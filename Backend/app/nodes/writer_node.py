from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.state.email_state import EmailState
from app.core.config import settings

def draft_response_node(state: EmailState) -> EmailState:
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.DEFAULT_MODEL,
        temperature=0.3
    )
    
    retrieved_context = "\n".join(state.get("retrieved_docs", []))
    
    system_prompt = f"""You are an Expert Corporate AI Email Assistant.
Your task is to write a highly professional, modern HTML email response.

COMPANY POLICIES TO COMPLY WITH:
{retrieved_context}

DESIGN & TEMPLATE INSTRUCTIONS:
1. Output a beautifully designed modern HTML email template body.
2. Use inline CSS styles, neutral background container (#f8fafc), dark text (#0f172a), rounded cards (#ffffff), proper padding, and clean typography (Arial/sans-serif).
3. Do NOT wrap the output in markdown codeblocks (no ```html). Return ONLY raw HTML starting with <div> or <table>.
"""

    human_prompt = f"""Inbound Email Details:
From: {state.get('sender')}
Subject: {state.get('subject')}
Body: {state.get('email_body')}

Generate a modern HTML formatted reply."""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ])
    
    draft_html = response.content.strip().replace("```html", "").replace("```", "")
    print("✍️ [Writer Node] Modern HTML Draft generated.")
    
    return {
        **state,
        "draft_response": draft_html,
        "status": "pending_review",  
        "iteration_count": state.get("iteration_count", 0) + 1
    }