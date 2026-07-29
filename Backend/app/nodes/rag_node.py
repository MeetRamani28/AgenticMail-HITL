from app.state.email_state import EmailState


def retrieve_context_node(state: EmailState) -> EmailState:
    """
    RAG Retrieval Node:
    Based on the inbound email's subject and body, this node searches the
    knowledge base (FAQs/Policies) for relevant context and saves it to the state.
    """
    subject = state.get("subject", "").lower()
    body = state.get("email_body", "").lower()
    topic = state.get("topic", "").lower() if state.get("topic") else ""
    combined_text = f"{subject} {body} {topic}"
    
    mock_policy_db = [
        {"keyword": "return", "policy": "Company Return Policy: Products can be returned within 30 days of purchase with original receipt for a full refund."},
        {"keyword": "refund", "policy": "Company Refund Policy: Refunds are processed within 5-7 business days to the original payment method."},
        {"keyword": "discount", "policy": "Company Discount Policy: Customer support can issue maximum 10% promotional discount codes for delayed orders."},
        {"keyword": "shipping", "policy": "Company Shipping Policy: Standard shipping takes 3-5 business days. Express takes 1-2 business days."}
    ]
    
    retrieved_docs = []
    for item in mock_policy_db:
        if item["keyword"] in combined_text:
            retrieved_docs.append(item["policy"])
            
    if not retrieved_docs:
        retrieved_docs.append("Company General Support Policy: Always address the customer politely, resolve queries, and maintain professional tone.")
        
    print(f"🔍 [RAG Node] Retrieved {len(retrieved_docs)} policy documents.")
    
    return {**state, "retrieved_docs": retrieved_docs}