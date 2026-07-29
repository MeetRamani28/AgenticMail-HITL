from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.state.email_state import EmailState
from app.core.config import settings

def draft_topic_email_node(state: EmailState) -> EmailState:
    """Generates an outbound email draft based on a topic provided by the user."""
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.DEFAULT_MODEL,
        temperature=0.4
    )
    
    retrieved_context = "\n".join(state.get("retrieved_docs", []))
    
    system_prompt = f"""You are an Autonomous AI Email Assistant writing an outbound email.
Compose a clear, well-structured email based on the user's requested topic.

CONTEXT & POLICIES:
{retrieved_context}
"""

    human_prompt = f"""Recipient: {state.get('sender')}
Subject: {state.get('subject')}
Topic/Instructions: {state.get('topic')}

Write a complete professional draft email body."""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ])
    
    draft_text = response.content.strip()
    print("✍️ [Topic Writer Node] Outbound draft created.")
    
    return {
        **state,
        "draft_response": draft_text,
        "status": "pending_review",
        "iteration_count": state.get("iteration_count", 0) + 1
    }