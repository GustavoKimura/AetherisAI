import os
import json
import traceback
from datetime import datetime
from typing import Dict, Any, Optional
from app.config import settings


class AuditService:
    _session_id: Optional[str] = None
    _session_file: Optional[str] = None
    _latest_file: Optional[str] = None

    @classmethod
    def _ensure_dir(cls) -> str:
        logs_dir = os.path.join(settings.data_dir, "logs")
        os.makedirs(logs_dir, exist_ok=True)
        return logs_dir

    @classmethod
    def initialize_session(cls) -> str:
        logs_dir = cls._ensure_dir()
        cls._session_id = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        cls._session_file = os.path.join(logs_dir, f"audit_{cls._session_id}.log")
        cls._latest_file = os.path.join(logs_dir, "audit_latest.log")

        cls.write_entry(
            "SYSTEM_SESSION_START",
            {
                "session_id": cls._session_id,
                "timestamp": datetime.now().isoformat(),
                "app_name": settings.app_name,
                "max_context": settings.context.max_context,
                "max_gen_tokens": settings.context.max_gen_tokens,
            },
        )
        return cls._session_file

    @classmethod
    def write_entry(cls, event_type: str, data: Dict[str, Any]) -> None:
        if cls._session_file is None:
            cls.initialize_session()

        record = {
            "session_id": cls._session_id,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            "event": event_type,
            "data": data,
        }
        line = json.dumps(record, ensure_ascii=False) + "\n"

        for target in [cls._session_file, cls._latest_file]:
            if target:
                with open(target, "a", encoding="utf-8") as f:
                    f.write(line)
                    f.flush()
                    os.fsync(f.fileno())

    @classmethod
    def log_model_load(
        cls,
        model_name: str,
        path: str,
        n_gpu_layers: int,
        duration_sec: float,
        success: bool,
        error: Optional[str] = None,
    ):
        cls.write_entry(
            "MODEL_LOAD_RESULT",
            {
                "model_name": model_name,
                "model_path": path,
                "n_gpu_layers": n_gpu_layers,
                "duration_sec": round(duration_sec, 3),
                "success": success,
                "error": error,
            },
        )

    @classmethod
    def log_inference(
        cls,
        conversation_id: Optional[int],
        model_name: str,
        prompt_length_chars: int,
        generated_length_chars: int,
        prompt_tokens_est: int,
        generated_tokens: int,
        thinking_tokens: int,
        total_time_sec: float,
        ttft_sec: float,
        web_search_used: bool,
        web_search_time_sec: float,
        interrupted: bool = False,
        error: Optional[str] = None,
    ):
        eval_time = max(0.001, ttft_sec)
        gen_time = (
            max(0.001, total_time_sec - ttft_sec)
            if total_time_sec > ttft_sec
            else total_time_sec
        )
        tps = generated_tokens / gen_time if gen_time > 0 else 0.0

        cls.write_entry(
            "INFERENCE_METRICS",
            {
                "conversation_id": conversation_id,
                "model": model_name,
                "interrupted": interrupted,
                "error": error,
                "features": {
                    "web_search": web_search_used,
                    "web_search_latency_sec": round(web_search_time_sec, 3),
                    "deep_thinking": thinking_tokens > 0,
                },
                "tokens": {
                    "prompt_tokens_est": prompt_tokens_est,
                    "generated_tokens": generated_tokens,
                    "thinking_tokens": thinking_tokens,
                    "response_tokens": max(0, generated_tokens - thinking_tokens),
                },
                "performance": {
                    "total_duration_sec": round(total_time_sec, 3),
                    "ttft_sec": round(ttft_sec, 3),
                    "generation_tokens_per_sec": round(tps, 2),
                },
                "lengths": {
                    "prompt_chars": prompt_length_chars,
                    "generated_chars": generated_length_chars,
                },
            },
        )
