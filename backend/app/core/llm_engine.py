import os
import gc
import time
import asyncio
import ctypes
from typing import Optional
import psutil
import llama_cpp
from llama_cpp import Llama
from app.config import settings
from app.services.audit_service import AuditService

_NULL_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_int, ctypes.c_char_p, ctypes.c_void_p)(
    lambda lvl, txt, udata: None
)
try:
    if hasattr(llama_cpp, "llama_log_set"):
        llama_cpp.llama_log_set(_NULL_CALLBACK, None)
except Exception:
    pass


class LLMEngine:
    def __init__(self):
        self._llm: Optional[Llama] = None
        self._is_ready: bool = False
        self._lock = asyncio.Lock()
        self.active_model_name: str = ""

    @property
    def is_ready(self) -> bool:
        return self._is_ready

    @property
    def lock(self) -> asyncio.Lock:
        return self._lock

    @property
    def client(self) -> Llama:
        if not self._llm:
            raise RuntimeError("Instância do LLM não carregada.")
        return self._llm

    def _optimize_process_affinity(self):
        try:
            p = psutil.Process()
            p.nice(psutil.HIGH_PRIORITY_CLASS)
            p.cpu_affinity(list(range(12)))
        except Exception:
            pass

    def load_model(self, model_name: str) -> None:
        if (
            self._is_ready
            and self.active_model_name == model_name
            and self._llm is not None
        ):
            return

        model_path = os.path.join(settings.models_dir, model_name)
        if not os.path.exists(model_path):
            AuditService.log_model_load(
                model_name, model_path, 0, 0.0, False, "Arquivo inexistente"
            )
            raise FileNotFoundError(f"Arquivo não localizado: {model_path}")

        start_time = time.perf_counter()
        self.unload()
        self._optimize_process_affinity()

        file_size_gb = os.path.getsize(model_path) / (1024**3)

        allocation_attempts = (
            [
                {"layers": 99, "ctx": settings.context.max_context},
                {"layers": 28, "ctx": 4096},
            ]
            if file_size_gb > 7.0
            else [{"layers": 99, "ctx": settings.context.max_context}]
        )

        last_error = None
        for config in allocation_attempts:
            try:
                self._llm = Llama(
                    model_path=model_path,
                    n_gpu_layers=config["layers"],
                    n_threads=settings.model.n_threads,
                    n_threads_batch=settings.model.n_threads_batch,
                    n_batch=settings.model.n_batch,
                    n_ubatch=settings.model.n_ubatch,
                    n_ctx=config["ctx"],
                    flash_attn=False,
                    use_mmap=True,
                    use_mlock=False,
                    verbose=False,
                )
                self.active_model_name = model_name
                self._is_ready = True
                duration = time.perf_counter() - start_time
                AuditService.log_model_load(
                    model_name, model_path, config["layers"], duration, True
                )
                return
            except Exception as exc:
                last_error = exc
                if self._llm is not None:
                    del self._llm
                    self._llm = None
                gc.collect()

        self._is_ready = False
        duration = time.perf_counter() - start_time
        AuditService.log_model_load(
            model_name, model_path, 0, duration, False, str(last_error)
        )
        raise last_error

    def unload(self) -> None:
        self._is_ready = False
        if self._llm is not None:
            del self._llm
            self._llm = None
            gc.collect()
        if self.active_model_name:
            AuditService.write_entry(
                "MODEL_UNLOADED", {"model": self.active_model_name}
            )
        self.active_model_name = ""


engine = LLMEngine()
