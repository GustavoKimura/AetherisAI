import os
from typing import List, Optional
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class ModelSettings(BaseModel):
    name: str = "Qwen2.5-Coder-7B-Instruct-abliterated-Q5_K_M.gguf"
    path: str = ""
    chat_format: Optional[str] = None
    n_gpu_layers: int = 99
    n_threads: int = 6
    n_threads_batch: int = 12
    n_batch: int = 1024
    n_ubatch: int = 256
    flash_attn: bool = False
    use_mmap: bool = True
    use_mlock: bool = False


class ContextSettings(BaseModel):
    max_context: int = 8192
    max_gen_tokens: int = 4096
    stop_tokens: List[str] = [
        "<|im_end|>",
        "<|im_start|>",
        "<|endoftext|>",
        "</s>",
        "<end_of_turn>",
        "<start_of_turn>",
    ]


class SamplingSettings(BaseModel):
    temperature: float = 0.70
    top_p: float = 0.90
    min_p: float = 0.05
    repeat_penalty: float = 1.05


class AppSettings(BaseSettings):
    app_name: str = "Aetheris AI"
    base_dir: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    model: ModelSettings = ModelSettings()
    context: ContextSettings = ContextSettings()
    sampling: SamplingSettings = SamplingSettings()

    model_config = SettingsConfigDict(
        env_prefix="AETHERIS_",
        env_file=".env",
        extra="ignore",
    )

    @property
    def models_dir(self) -> str:
        path = os.path.join(self.base_dir, "models")
        os.makedirs(path, exist_ok=True)
        return path

    @property
    def data_dir(self) -> str:
        path = os.path.join(self.base_dir, "data")
        os.makedirs(path, exist_ok=True)
        return path


settings = AppSettings()
