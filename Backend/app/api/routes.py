import time
from fastapi import APIRouter, HTTPException, status
from app.graph.email_graph import email_agent_app
from app.api.schemas import (
    ProcessEmailRequest,
    OutboundTopicRequest,
    HITLActionRequest,
    AgentStateResponse
)
from app.core.gmail_service import gmail_service

router = APIRouter(prefix="/email-agent", tags=["Email Agent Operations"])

@router.post("/process-email", response_model=AgentStateResponse)
async def process_inbound_email(payload: ProcessEmailRequest):
    config = {"configurable": {"thread_id": payload.thread_id}}
    
    initial_state = {
        "thread_id": payload.thread_id,
        "email_id": payload.email_id,
        "sender": payload.sender,
        "subject": payload.subject,
        "email_body": payload.email_body,
        "topic": None,
        "is_outbound": False,
        "retrieved_docs": [],
        "draft_response": "",
        "revised_draft": None,
        "status": "processing",
        "human_feedback": None,
        "iteration_count": 0,
        "is_sent": False,
        "error_message": None
    }
    
    for _ in email_agent_app.stream(initial_state, config):
        pass  
        
    current_state = email_agent_app.get_state(config)
    s = current_state.values
    return AgentStateResponse(**s)

@router.post("/generate-outbound-draft", response_model=AgentStateResponse)
async def generate_outbound_draft(payload: OutboundTopicRequest):
    """Generates an email from user's custom topic/instructions and pauses at HITL."""
    generated_thread_id = f"outbound_{int(time.time())}"
    config = {"configurable": {"thread_id": generated_thread_id}}
    
    initial_state = {
        "thread_id": generated_thread_id,
        "email_id": f"msg_{generated_thread_id}",
        "sender": payload.recipient_email,
        "subject": payload.subject,
        "email_body": f"Topic: {payload.topic}",
        "topic": payload.topic,
        "is_outbound": True,
        "retrieved_docs": [],
        "draft_response": "",
        "revised_draft": None,
        "status": "processing",
        "human_feedback": None,
        "iteration_count": 0,
        "is_sent": False,
        "error_message": None
    }
    
    for _ in email_agent_app.stream(initial_state, config):
        pass
        
    current_state = email_agent_app.get_state(config)
    s = current_state.values
    return AgentStateResponse(**s)

@router.post("/hitl-action", response_model=AgentStateResponse)
async def handle_hitl_action(payload: HITLActionRequest):
    config = {"configurable": {"thread_id": payload.thread_id}}
    
    current_state = email_agent_app.get_state(config)
    if not current_state.values:
        raise HTTPException(status_code=404, detail="Workflow thread not found.")
        
    action_type = payload.action.lower()
    if action_type == "approve":
        new_status = "approved"
    elif action_type == "revise":
        if not payload.feedback:
            raise HTTPException(status_code=400, detail="Feedback is required for revision.")
        new_status = "revision_requested"
    elif action_type == "reject":
        new_status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action.")
        
    update_data = {
        "status": new_status,
        "human_feedback": payload.feedback if action_type == "revise" else None
    }
    
    email_agent_app.update_state(config, update_data)
    
    for _ in email_agent_app.stream(None, config):
        pass
        
    updated_state = email_agent_app.get_state(config)
    s = updated_state.values
    return AgentStateResponse(**s)

@router.get("/fetch-inbox")
async def fetch_inbox_messages():
    unread = gmail_service.fetch_unread_emails()
    return {"status": "success", "count": len(unread), "emails": unread}

@router.get("/email-history")
async def get_email_history():
    """Returns past emails for viewing history."""
    history = gmail_service.fetch_email_history()
    return {"status": "success", "count": len(history), "history": history}