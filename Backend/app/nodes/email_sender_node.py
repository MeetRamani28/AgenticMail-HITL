from app.state.email_state import EmailState
from app.core.gmail_service import gmail_service

def send_email_node(state: EmailState) -> EmailState:
    """
    Send Email Node:
    Once the draft is approved by a human reviewer,
    this node sends the final email to the customer.
    """
    final_email = state.get("revised_draft") or state.get("draft_response")
    recipient = state.get("sender")
    subject = f"Re: {state.get('subject')}"
    thread_id = state.get("thread_id")

    success = gmail_service.send_email(
        to_email=recipient,
        subject=subject,
        body_text=final_email,
        thread_id=thread_id
    )
    
    return {
        **state,
        "is_sent": success,
        "status": "approved_and_sent" if success else "failed_to_send",
        "error_message": None if success else "Failed to send via Gmail API"
    }