import time
from fastapi import APIRouter, HTTPException, status
from app.graph.email_graph import email_agent_app
from app.api.schemas import (
    ProcessEmailRequest,
    OutboundTopicRequest,
    HITLActionRequest,
    AgentStateResponse,
    sanitize_input
)
from app.core.gmail_service import gmail_service

router = APIRouter(prefix="/email-agent", tags=["Jarvis Email Agent Operations"])


@router.post("/process-email", response_model=AgentStateResponse)
async def process_inbound_email(payload: ProcessEmailRequest):
    config = {"configurable": {"thread_id": payload.thread_id}}
    
    initial_state = {
        "thread_id": sanitize_input(payload.thread_id),
        "email_id": sanitize_input(payload.email_id),
        "sender": sanitize_input(payload.sender),
        "subject": sanitize_input(payload.subject),
        "email_body": sanitize_input(payload.email_body),
        "topic": None,
        "is_outbound": False,
        "retrieved_docs": [],
        "draft_response": "",
        "revised_draft": None,
        "status": "processing",
        "human_feedback": None,
        "iteration_count": 0,
        "is_sent": False,
        "error_message": None,
        "agent_mood": "thinking",
        "dialogue_transcript": [f"JARVIS: Sir, incoming email detected from {payload.sender}. Initiating analysis..."],
        "terminal_logs": ["[SYS-INIT] Inbound email stream connected. Launching RAG & LLM Engine..."]
    }
    
    for _ in email_agent_app.stream(initial_state, config):
        pass  
        
    current_state = email_agent_app.get_state(config)
    s = current_state.values
    return AgentStateResponse(**s)


@router.post("/generate-outbound-draft", response_model=AgentStateResponse)
async def generate_outbound_draft(payload: OutboundTopicRequest):
    generated_thread_id = f"outbound_{int(time.time())}"
    config = {"configurable": {"thread_id": generated_thread_id}}
    
    initial_state = {
        "thread_id": generated_thread_id,
        "email_id": f"msg_{generated_thread_id}",
        "sender": sanitize_input(payload.recipient_email),
        "subject": sanitize_input(payload.subject),
        "email_body": f"Topic: {sanitize_input(payload.topic)}",
        "topic": sanitize_input(payload.topic),
        "is_outbound": True,
        "retrieved_docs": [],
        "draft_response": "",
        "revised_draft": None,
        "status": "processing",
        "human_feedback": None,
        "iteration_count": 0,
        "is_sent": False,
        "error_message": None,
        "agent_mood": "thinking",
        "dialogue_transcript": [f"JARVIS: Acknowledged, Sir. Drafting email to {payload.recipient_email} regarding '{payload.subject}'..."],
        "terminal_logs": ["[SYS-INIT] Outbound topic stream opened. Creating custom HTML template..."]
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
    elif action_type == "save_draft":
        new_status = "save_draft"
    elif action_type == "reject":
        new_status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action type.")
        
    update_data = {
        "status": new_status,
        "human_feedback": sanitize_input(payload.feedback) if action_type == "revise" and payload.feedback else None
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
    history = gmail_service.fetch_email_history()
    return {"status": "success", "count": len(history), "history": history}