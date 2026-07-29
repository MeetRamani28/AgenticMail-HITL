from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.state.email_state import EmailState
from app.core.config import settings

def refine_draft_node(state: EmailState) -> EmailState:
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.DEFAULT_MODEL,
        temperature=0.3
    )
    
    current_draft = state.get("revised_draft") or state.get("draft_response")
    human_feedback = state.get("human_feedback", "")
    
    system_prompt = """You are an Expert AI Email Editor.
Rewrite the draft based on feedback provided by the reviewer. Return ONLY the revised email body."""

    human_prompt = f"""Original Draft:
{current_draft}

Human Feedback:
"{human_feedback}"

Rewrite the draft following the feedback."""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ])
    
    new_revised_draft = response.content.strip()
    print(f"🔄 [Feedback Node] Draft revised.")
    
    return {
        **state,
        "revised_draft": new_revised_draft,
        "status": "pending_review"  
    }