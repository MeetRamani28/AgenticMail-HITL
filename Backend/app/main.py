import asyncio
import socketio
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.routes import router as api_router
from app.core.watcher import AutonomousWatcher
from app.core.gmail_service import gmail_service

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
watcher = AutonomousWatcher(sio)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(watcher.start_polling(interval_seconds=15))
    yield
    watcher.stop()
    task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@sio.event
async def connect(sid, environ):
    print(f"🔌 [Socket.IO] Frontend Client Connected: {sid}")
    await sio.emit("terminal_log", {"message": "[SYS-ONLINE] Socket.IO real-time channel established."}, room=sid)

@sio.event
async def mark_email_read(sid, data):
    email_id = data.get("email_id")
    if email_id:
        gmail_service.mark_as_read(email_id)
        await sio.emit("terminal_log", {"message": f"[MAILBOX-SYNC] Removed UNREAD label from Gmail for ID: {email_id}"})

app = socketio.ASGIApp(sio, app)