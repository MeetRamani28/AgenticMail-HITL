from app.state.email_state import EmailState
from app.core.gmail_service import gmail_service

def send_email_node(state: EmailState) -> EmailState:
    final_email = state.get("revised_draft") or state.get("draft_response")
    recipient = state.get("sender")
    subject = state.get("subject")
    status = state.get("status")
    
    if not state.get("is_outbound", False) and not subject.startswith("Re:"):
        subject = f"Re: {subject}"
        
    thread_id = state.get("thread_id")

    if status == "save_draft":
        draft_id = gmail_service.create_draft(
            to_email=recipient,
            subject=subject,
            body_content=final_email,
            thread_id=thread_id,
            is_html=True
        )
        return {
            **state,
            "is_sent": False,
            "status": "saved_as_gmail_draft",
            "error_message": None if draft_id else "Failed to save draft in Gmail"
        }

    success = gmail_service.send_email(
        to_email=recipient,
        subject=subject,
        body_content=final_email,
        thread_id=thread_id if not state.get("is_outbound") else None,
        is_html=True
    )
    
    return {
        **state,
        "is_sent": success,
        "status": "approved_and_sent" if success else "failed_to_send",
        "error_message": None if success else "Failed to send via Gmail API"
    }