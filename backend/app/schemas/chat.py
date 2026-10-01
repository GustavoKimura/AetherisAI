from typing import List, Optional
from pydantic import BaseModel, Field


class MessageItem(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    conversation_id: Optional[int] = None
    messages: List[MessageItem]
    deep_thinking: bool = False
    web_search: bool = False


class ConversationCreate(BaseModel):
    title: str = Field(default="Nova Conversa")


class ConversationResponse(BaseModel):
    id: int
    title: str
    updated_at: str


class ConversationDetailResponse(BaseModel):
    id: int
    title: str
    messages: List[MessageItem]
    updated_at: str


class ModelSwitchRequest(BaseModel):
    model_name: str
