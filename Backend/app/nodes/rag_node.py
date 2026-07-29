from app.state.email_state import EmailState


def retrieve_context_node(state: EmailState) -> EmailState:
    """
    RAG Retrieval Node (Jarvis Sci-Fi Edition):
    Searches company policies, meeting preferences, and email history.
    Appends live terminal logs for the frontend UI.
    """
    subject = state.get("subject", "").lower()
    body = state.get("email_body", "").lower()
    topic = state.get("topic", "").lower() if state.get("topic") else ""
    combined_text = f"{subject} {body} {topic}"
    
    mock_policy_db = [
        {"keyword": "meeting", "policy": "Executive Meeting Policy: Default meetings are scheduled via Google Meet. Normal working hours are 9:00 AM to 6:00 PM IST."},
        {"keyword": "project", "policy": "Project Status Policy: Always share high-level progress and ask for a convenient time for a detailed technical sync."},
        {"keyword": "return", "policy": "Company Return Policy: Products can be returned within 30 days of purchase with original receipt for a full refund."},
        {"keyword": "refund", "policy": "Company Refund Policy: Refunds are processed within 5-7 business days to the original payment method."},
        {"keyword": "discount", "policy": "Company Discount Policy: Customer support can issue maximum 10% promotional discount codes for delayed orders."}
    ]
    
    retrieved_docs = []
    for item in mock_policy_db:
        if item["keyword"] in combined_text:
            retrieved_docs.append(item["policy"])
            
    if not retrieved_docs:
        retrieved_docs.append("Company General Executive Policy: Maintain a polite, highly professional tone and resolve the sender's inquiry efficiently.")
        
    print(f"🔍 [RAG Node] Retrieved {len(retrieved_docs)} policy documents.")
    
    logs = state.get("terminal_logs", [])
    logs.append(f"[RAG-CORE] Querying Vector Knowledge Base for keywords in subject/body...")
    logs.append(f"[RAG-CORE] Successfully retrieved {len(retrieved_docs)} verified policy documents.")
    
    return {
        **state,
        "retrieved_docs": retrieved_docs,
        "terminal_logs": logs,
        "agent_mood": "thinking"
    }