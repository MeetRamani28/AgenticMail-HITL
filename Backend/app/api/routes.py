from fastapi import APIRouter, HTTPException, status
from app.graph.email_graph import email_agent_app
from app.api.schemas import (
    ProcessEmailRequest,
    HITLActionRequest,
    AgentStateResponse
)
from app.core.gmail_service import gmail_service

router = APIRouter(prefix="/email-agent", tags=["Email Agent HITL Operations"])


@router.post("/process-email", response_model=AgentStateResponse)
async def process_inbound_email(payload: ProcessEmailRequest):
    """
    1. Accepts a new inbound email.
    2. Initiates the LangGraph agent.
    3. The agent performs RAG, drafts a response, and then pauses at the
       HITL node for human review.
    """
    config = {"configurable": {"thread_id": payload.thread_id}}
    
    initial_state = {
        "thread_id": payload.thread_id,
        "email_id": payload.email_id,
        "sender": payload.sender,
        "subject": payload.subject,
        "email_body": payload.email_body,
        "retrieved_docs": [],
        "draft_response": "",
        "revised_draft": None,
        "status": "processing",
        "human_feedback": None,
        "iteration_count": 0,
        "is_sent": False,
        "error_message": None
    }
    
    try:
        for output in email_agent_app.stream(initial_state, config):
            pass  
            
        current_state = email_agent_app.get_state(config)
        state_values = current_state.values
        
        return AgentStateResponse(
            thread_id=state_values.get("thread_id"),
            sender=state_values.get("sender"),
            subject=state_values.get("subject"),
            email_body=state_values.get("email_body"),
            draft_response=state_values.get("draft_response"),
            revised_draft=state_values.get("revised_draft"),
            retrieved_docs=state_values.get("retrieved_docs", []),
            status=state_values.get("status", "pending_review"),
            iteration_count=state_values.get("iteration_count", 1),
            is_sent=state_values.get("is_sent", False)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing agent graph: {str(e)}"
        )


@router.post("/hitl-action", response_model=AgentStateResponse)
async def handle_hitl_action(payload: HITLActionRequest):
    """
    Resumes the graph by updating its state based on the decision
    (Approve / Revise / Reject) from the human reviewer via the
    frontend.
    """
    config = {"configurable": {"thread_id": payload.thread_id}}
    
    current_state = email_agent_app.get_state(config)
    if not current_state.values:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active workflow found for thread_id: {payload.thread_id}"
        )
        
    action_type = payload.action.lower()
    if action_type == "approve":
        new_status = "approved"
    elif action_type == "revise":
        if not payload.feedback:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback text is required when requesting draft revision."
            )
        new_status = "revision_requested"
    elif action_type == "reject":
        new_status = "rejected"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action type. Must be 'approve', 'revise', or 'reject'."
        )
        
    update_data = {
        "status": new_status,
        "human_feedback": payload.feedback if action_type == "revise" else None
    }
    
    email_agent_app.update_state(config, update_data)
    
    for output in email_agent_app.stream(None, config):
        pass
        
    updated_state = email_agent_app.get_state(config)
    state_values = updated_state.values
    
    return AgentStateResponse(
        thread_id=state_values.get("thread_id"),
        sender=state_values.get("sender"),
        subject=state_values.get("subject"),
        email_body=state_values.get("email_body"),
        draft_response=state_values.get("draft_response"),
        revised_draft=state_values.get("revised_draft"),
        retrieved_docs=state_values.get("retrieved_docs", []),
        status=state_values.get("status"),
        iteration_count=state_values.get("iteration_count", 1),
        is_sent=state_values.get("is_sent", False)
    )


@router.get("/state/{thread_id}", response_model=AgentStateResponse)
async def get_thread_state(thread_id: str):
    """
    Endpoint to retrieve the current state of a specific workflow thread.
    """
    config = {"configurable": {"thread_id": thread_id}}
    current_state = email_agent_app.get_state(config)
    
    if not current_state.values:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread with ID {thread_id} not found."
        )
        
    state_values = current_state.values
    return AgentStateResponse(
        thread_id=state_values.get("thread_id"),
        sender=state_values.get("sender"),
        subject=state_values.get("subject"),
        email_body=state_values.get("email_body"),
        draft_response=state_values.get("draft_response"),
        revised_draft=state_values.get("revised_draft"),
        retrieved_docs=state_values.get("retrieved_docs", []),
        status=state_values.get("status"),
        iteration_count=state_values.get("iteration_count", 1),
        is_sent=state_values.get("is_sent", False)
    )

@router.get("/fetch-inbox")
async def fetch_inbox_messages():
    """
    Fetches a list of unread emails from the authenticated user's Gmail inbox.
    """
    unread = gmail_service.fetch_unread_emails()
    return {"status": "success", "count": len(unread), "emails": unread}