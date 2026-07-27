from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.state.email_state import EmailState
from app.core.config import settings


def draft_response_node(state: EmailState) -> EmailState:
    """
    Writer Node:
    Reads the email body and RAG policy context to draft an AI support response.
    """
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.DEFAULT_MODEL,
        temperature=0.3
    )
    
    retrieved_context = "\n".join(state.get("retrieved_docs", []))
    
    system_prompt = f"""You are an Autonomous AI Email Support Assistant for our enterprise.
Your goal is to write a helpful, empathetic, and highly professional email response to the customer.

RULES:
1. Base your answer strictly on the provided COMPANY POLICIES:
{retrieved_context}
2. Be direct, clear, and professional.
3. Do not invent policies that do not exist.
4. Keep the output strictly as the email body response (No preamble like "Here is your draft").
"""

    human_prompt = f"""Customer Email Details:
From: {state.get('sender')}
Subject: {state.get('subject')}
Body:
{state.get('email_body')}

Write a draft email response."""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ])
    
    draft_text = response.content.strip()
    
    print("✍️ [Writer Node] Draft email generated successfully.")
    
    return {
        **state,
        "draft_response": draft_text,
        "status": "pending_review",  
        "iteration_count": state.get("iteration_count", 0) + 1
    }