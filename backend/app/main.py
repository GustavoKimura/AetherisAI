from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.db_service import init_db
from app.services.audit_service import AuditService
from app.routers import chat, models, conversations


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    AuditService.initialize_session()
    yield


def create_app() -> FastAPI:
    application = FastAPI(title=settings.app_name, lifespan=lifespan)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/health")
    async def health():
        return {"status": "ok", "app": settings.app_name}

    application.include_router(chat.router)
    application.include_router(models.router)
    application.include_router(conversations.router)

    return application


app = create_app()
