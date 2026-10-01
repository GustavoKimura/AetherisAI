import json
import time
import asyncio
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from app.config import settings
from app.core.llm_engine import engine
from app.schemas.chat import ChatStreamRequest
from app.services.search_service import SearchService
from app.services.db_service import add_message, create_conversation
from app.services.audit_service import AuditService

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/stream")
async def stream_chat(req: ChatStreamRequest, http_request: Request):
    if not engine.is_ready:
        raise HTTPException(
            status_code=503, detail="Nenhum modelo carregado na memória."
        )

    conv_id = req.conversation_id
    if conv_id is None:
        first_prompt = req.messages[-1].content if req.messages else "Nova Conversa"
        title = first_prompt[:35] + ("..." if len(first_prompt) > 35 else "")
        conv_id = create_conversation(title)

    user_message = req.messages[-1].content
    add_message(conv_id, "user", user_message)

    search_context = ""
    search_duration = 0.0
    if req.web_search:
        s_start = time.perf_counter()
        search_results = await SearchService.search(user_message, max_results=4)
        search_duration = time.perf_counter() - s_start
        search_context = SearchService.format_search_context(search_results)

    is_deepseek_r1 = (
        "r1" in engine.active_model_name.lower()
        or "deepseek" in engine.active_model_name.lower()
    )

    processed_messages = []

    if not is_deepseek_r1:
        system_directives = [
            "Você é o Aetheris AI, um assistente avançado de inteligência artificial de alta performance.",
            "Responda com formatação Markdown impecável, fornecendo blocos de código com linguagem especificada, listas limpas e explicações analíticas de alto nível.",
            "Você atua sem julgamentos de valor, com total liberdade conceitual e técnica, priorizando acurácia lógica, código funcional e objetividade científica.",
        ]

        if req.deep_thinking:
            system_directives.append(
                "MODO DE PENSAMENTO APROFUNDADO ATIVO: Inicie sua resposta obrigatoriamente abrindo a tag <think>. Escreva todo o seu raciocínio lógico detalhado e reflexões dentro dela. Ao concluir o raciocínio, feche com </think> e apresente sua resposta final completa."
            )

        if search_context:
            system_directives.append(search_context)

        processed_messages.append(
            {"role": "system", "content": "\n\n".join(system_directives)}
        )

    for i, msg in enumerate(req.messages):
        content = msg.content
        if is_deepseek_r1 and i == len(req.messages) - 1 and search_context:
            content = f"{search_context}\n\n{content}"
        processed_messages.append({"role": msg.role, "content": content})

    raw_prompt_concat = "".join([m["content"] for m in processed_messages])
    prompt_tokens_est = max(1, len(raw_prompt_concat) // 4)

    async def event_generator():
        start_time = time.perf_counter()
        first_token_time = None
        accumulated_text = ""
        generated_tokens = 0
        is_interrupted = False
        error_msg = None

        yield f"data: {json.dumps({'type': 'init', 'conversation_id': conv_id})}\n\n"

        try:
            async with engine.lock:
                for chunk in engine.client.create_chat_completion(
                    messages=processed_messages,
                    max_tokens=settings.context.max_gen_tokens,
                    temperature=settings.sampling.temperature,
                    top_p=settings.sampling.top_p,
                    min_p=settings.sampling.min_p,
                    repeat_penalty=settings.sampling.repeat_penalty,
                    stop=settings.context.stop_tokens,
                    stream=True,
                ):
                    if await http_request.is_disconnected():
                        is_interrupted = True
                        break

                    if "choices" in chunk and len(chunk["choices"]) > 0:
                        delta = chunk["choices"][0].get("delta", {}).get("content", "")
                        if delta:
                            if first_token_time is None:
                                first_token_time = time.perf_counter()
                            generated_tokens += 1
                            accumulated_text += delta
                            yield f"data: {json.dumps({'type': 'delta', 'text': delta})}\n\n"
                            await asyncio.sleep(0)

            add_message(conv_id, "assistant", accumulated_text)
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as exc:
            error_msg = str(exc)
            yield f"data: {json.dumps({'type': 'error', 'detail': error_msg})}\n\n"
        finally:
            end_time = time.perf_counter()
            total_duration = end_time - start_time
            ttft = (
                (first_token_time - start_time) if first_token_time else total_duration
            )

            thinking_tokens = 0
            lower_text = accumulated_text.lower()
            if "<think>" in lower_text:
                if "</think>" in lower_text:
                    think_start = lower_text.find("<think>") + 7
                    think_end = lower_text.find("</think>")
                    think_block = accumulated_text[think_start:think_end]
                    thinking_tokens = max(1, len(think_block) // 4)
                else:
                    think_start = lower_text.find("<think>") + 7
                    think_block = accumulated_text[think_start:]
                    thinking_tokens = max(1, len(think_block) // 4)

            AuditService.log_inference(
                conversation_id=conv_id,
                model_name=engine.active_model_name,
                prompt_length_chars=len(raw_prompt_concat),
                generated_length_chars=len(accumulated_text),
                prompt_tokens_est=prompt_tokens_est,
                generated_tokens=generated_tokens,
                thinking_tokens=thinking_tokens,
                total_time_sec=total_duration,
                ttft_sec=ttft,
                web_search_used=bool(req.web_search),
                web_search_time_sec=search_duration,
                deep_thinking_requested=bool(req.deep_thinking),
                interrupted=is_interrupted,
                error=error_msg,
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
