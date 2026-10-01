from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.chat import (
    ConversationResponse,
    ConversationDetailResponse,
    ConversationCreate,
)
from app.services.db_service import (
    list_conversations,
    create_conversation,
    get_conversation,
    delete_conversation,
    update_conversation_title,
)

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.get("", response_model=List[ConversationResponse])
async def get_all():
    return list_conversations()


@router.post("", response_model=dict)
async def create(data: ConversationCreate):
    cid = create_conversation(data.title)
    return {"id": cid}


@router.get("/{conv_id}", response_model=ConversationDetailResponse)
async def get_one(conv_id: int):
    conv = get_conversation(conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversa não encontrada.")
    return conv


@router.delete("/{conv_id}")
async def remove(conv_id: int):
    delete_conversation(conv_id)
    return {"status": "ok"}
