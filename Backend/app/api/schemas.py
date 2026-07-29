from pydantic import BaseModel, Field
from typing import Optional, List

class ProcessEmailRequest(BaseModel):
    thread_id: str
    email_id: str
    sender: str
    subject: str
    email_body: str

class OutboundTopicRequest(BaseModel):
    recipient_email: str = Field(..., description="Target email address")
    subject: str = Field(..., description="Email Subject")
    topic: str = Field(..., description="Detailed instructions/topic for LLM generation")

class HITLActionRequest(BaseModel):
    thread_id: str
    action: str = Field(..., description="'approve', 'revise', or 'reject'")
    feedback: Optional[str] = None

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
    status: str
    iteration_count: int
    is_sent: bool