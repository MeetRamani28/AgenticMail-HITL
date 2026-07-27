from app.state.email_state import EmailState


def send_email_node(state: EmailState) -> EmailState:
    """
    Send Email Node:
    Once the draft is approved by a human reviewer,
    this node sends the final email to the customer.
    """
    final_email = state.get("revised_draft") or state.get("draft_response")
    recipient = state.get("sender")
    subject = state.get("subject")
    
    print("=" * 60)
    print(f"🚀 [Email Sender Node] SENDING EMAIL TO: {recipient}")
    print(f"📌 SUBJECT: Re: {subject}")
    print(f"📄 BODY:\n{final_email}")
    print("=" * 60)
    
    return {
        **state,
        "is_sent": True,
        "status": "approved_and_sent"
    }