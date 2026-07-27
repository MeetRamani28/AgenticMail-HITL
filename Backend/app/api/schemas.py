from pydantic import BaseModel, Field
from typing import Optional, List


class ProcessEmailRequest(BaseModel):
    """Schema for processing a new incoming email in the graph."""
    thread_id: str = Field(..., description="Unique Gmail or System Thread ID")
    email_id: str = Field(..., description="Message ID")
    sender: str = Field(..., description="Sender Email Address")
    subject: str = Field(..., description="Email Subject")
    email_body: str = Field(..., description="Email Body Content")


class HITLActionRequest(BaseModel):
    """Schema for the human reviewer's action (Approve / Revise / Reject)."""
    thread_id: str = Field(..., description="Thread ID of the paused workflow")
    action: str = Field(..., description="Action type: 'approve', 'revise', 'reject'")
    feedback: Optional[str] = Field(None, description="Optional feedback string for revision")


class AgentStateResponse(BaseModel):
    """Schema for providing the graph's current state to the frontend."""
    thread_id: str
    sender: str
    subject: str
    email_body: str
    draft_response: Optional[str] = None
    revised_draft: Optional[str] = None
    retrieved_docs: List[str] = []
    status: str
    iteration_count: int
    is_sent: bool