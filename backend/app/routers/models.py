import os
import asyncio
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.core.llm_engine import engine
from app.schemas.chat import ModelSwitchRequest

router = APIRouter(prefix="/api/models", tags=["Models"])


@router.get("")
async def get_models():
    files = []
    if os.path.exists(settings.models_dir):
        files = [f for f in os.listdir(settings.models_dir) if f.endswith(".gguf")]

    labeled_models = []
    for f in sorted(files):
        if "coder" in f.lower():
            label = "Aetheris Pro (Qwen 2.5 Coder 7B)"
        elif "hermes" in f.lower():
            label = "Aetheris Fast (Hermes 3 8B)"
        else:
            label = f
        labeled_models.append({"filename": f, "label": label})

    return {
        "models": labeled_models,
        "current": engine.active_model_name,
        "is_ready": engine.is_ready,
    }


@router.post("/switch")
async def switch_model(req: ModelSwitchRequest):
    try:
        async with engine.lock:
            await asyncio.to_thread(engine.load_model, req.model_name)
        return {"status": "ok", "current": req.model_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unload")
async def unload_model():
    try:
        async with engine.lock:
            await asyncio.to_thread(engine.unload)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
