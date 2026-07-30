from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
import re


def sanitize_input(v: str) -> str:
    """
    OWASP Top 10 Sanitization:
    Removes potentially malicious HTML/Script tags to prevent XSS and Prompt Injection.
    """
    if not isinstance(v, str):
        return v
    clean = re.sub(r'<script.*?>.*?</script>', '', v, flags=re.DOTALL | re.IGNORECASE)
    return clean.strip()


class ProcessEmailRequest(BaseModel):
    thread_id: str = Field(..., min_length=1, max_length=128)
    email_id: str = Field(..., min_length=1, max_length=128)
    sender: str = Field(..., min_length=1, max_length=255)
    subject: str = Field(..., max_length=255)
    email_body: str = Field(..., max_length=10000)


class OutboundTopicRequest(BaseModel):
    recipient_email: EmailStr = Field(..., description="Target recipient email address")
    subject: str = Field(..., min_length=1, max_length=255)
    topic: str = Field(..., min_length=1, max_length=5000)


class HITLActionRequest(BaseModel):
    thread_id: str = Field(..., min_length=1, max_length=128)
    action: str = Field(..., description="'approve', 'revise', 'save_draft', or 'reject'")
    feedback: Optional[str] = Field(None, max_length=2000)


class AgentStateResponse(BaseModel):
    thread_id: str
    sender: str
    subject: str
    email_body: str
    topic: Optional[str] = None
    is_outbound: bool = False
    draft_response: Optional[str] = None
    revised_draft: Optional[str] = None
    retrieved_docs: List[str] = []
    status: str = "processing"
    iteration_count: int = 0
    is_sent: bool = False
    error_message: Optional[str] = None
    agent_mood: str = "idle"
    dialogue_transcript: List[str] = []
    terminal_logs: List[str] = []