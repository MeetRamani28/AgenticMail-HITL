from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.state.email_state import EmailState
from app.core.config import settings

def draft_topic_email_node(state: EmailState) -> EmailState:
    """Generates an outbound modern HTML email draft based on custom topic instructions."""
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.DEFAULT_MODEL,
        temperature=0.4
    )
    
    retrieved_context = "\n".join(state.get("retrieved_docs", []))
    
    system_prompt = f"""You are an Executive AI Email Assistant drafting an outbound email.
Create a beautifully designed, modern HTML email template based on the user's topic.

CONTEXT & POLICIES:
{retrieved_context}

FORMATTING REQUIREMENTS:
1. Return ONLY clean, valid inline HTML code (div/tables with inline CSS).
2. Use professional fonts, crisp card layouts (#ffffff background on #f1f5f9 container), and clean buttons.
3. Do NOT include markdown blocks like ```html.
"""

    human_prompt = f"""Recipient: {state.get('sender')}
Subject: {state.get('subject')}
Topic/Instructions: {state.get('topic')}

Draft the modern HTML email body."""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ])
    
    draft_html = response.content.strip().replace("```html", "").replace("```", "")
    print("✍️ [Topic Writer Node] Outbound HTML draft created.")
    
    return {
        **state,
        "draft_response": draft_html,
        "status": "pending_review",
        "iteration_count": state.get("iteration_count", 0) + 1
    }