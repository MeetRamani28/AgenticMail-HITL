from app.state.email_state import EmailState
from app.core.gmail_service import gmail_service


def send_email_node(state: EmailState) -> EmailState:
    """
    Email Sender & Mailbox Draft Router:
    - Sends email via Gmail API if approved.
    - Saves directly to Gmail Drafts folder if user says 'save_draft'.
    """
    final_email = state.get("revised_draft") or state.get("draft_response")
    recipient = state.get("sender")
    subject = state.get("subject")
    status = state.get("status")
    
    if not state.get("is_outbound", False) and not subject.startswith("Re:"):
        subject = f"Re: {subject}"
        
    thread_id = state.get("thread_id")
    logs = state.get("terminal_logs", [])
    transcript = state.get("dialogue_transcript", [])

    if status == "save_draft":
        draft_id = gmail_service.create_draft(
            to_email=recipient,
            subject=subject,
            body_content=final_email,
            thread_id=thread_id if not state.get("is_outbound") else None,
            is_html=True
        )
        logs.append(f"[MAILBOX-SYNC] Saved draft to official Gmail Drafts folder. ID: {draft_id}")
        transcript.append("JARVIS: Very well, Sir. I have saved the response in your Gmail Drafts folder. It will not be sent.")
        
        return {
            **state,
            "is_sent": False,
            "status": "saved_as_gmail_draft",
            "error_message": None if draft_id else "Failed to save draft in Gmail",
            "terminal_logs": logs,
            "dialogue_transcript": transcript,
            "agent_mood": "idle"
        }

    success = gmail_service.send_email(
        to_email=recipient,
        subject=subject,
        body_content=final_email,
        thread_id=thread_id if not state.get("is_outbound") else None,
        is_html=True
    )
    
    if success:
        logs.append(f"[SMTP-EXEC] HTML Email successfully dispatched to {recipient}.")
        transcript.append(f"JARVIS: Email has been sent to {recipient}, Sir. All tasks completed.")
    else:
        logs.append(f"[SMTP-ERROR] Failed to dispatch email via Gmail API.")
        transcript.append("JARVIS: My apologies, Sir. I encountered an error while sending the email.")
    
    return {
        **state,
        "is_sent": success,
        "status": "approved_and_sent" if success else "failed_to_send",
        "error_message": None if success else "Failed to send via Gmail API",
        "terminal_logs": logs,
        "dialogue_transcript": transcript,
        "agent_mood": "idle"
    }