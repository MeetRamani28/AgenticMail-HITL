from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.state.email_state import EmailState
from app.core.config import settings


def refine_draft_node(state: EmailState) -> EmailState:
    """
    Feedback Refinement Node:
    Rewrites the HTML draft based on user's voice/text edit instructions.
    """
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.DEFAULT_MODEL,
        temperature=0.3
    )
    
    current_draft = state.get("revised_draft") or state.get("draft_response")
    human_feedback = state.get("human_feedback", "")
    
    system_prompt = """You are Jarvis, an Expert AI Email Editor.
Rewrite the HTML email draft strictly based on the feedback provided by the executive.
Return ONLY clean, inline-styled HTML body content without markdown wrapper (no ```html)."""

    human_prompt = f"""Original Draft:
{current_draft}

Executive Feedback:
"{human_feedback}"

Rewrite the draft following the feedback."""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ])
    
    new_revised_draft = response.content.strip().replace("```html", "").replace("```", "")
    print(f"🔄 [Feedback Node] Draft revised.")
    
    logs = state.get("terminal_logs", [])
    logs.append(f"[AI-REVISE] Applying feedback: '{human_feedback}'...")
    logs.append("[AI-REVISE] Draft updated successfully. Awaiting confirmation.")

    transcript = state.get("dialogue_transcript", [])
    transcript.append(f"JARVIS: I have updated the draft according to your instructions, Sir. Should I send it now?")
    
    return {
        **state,
        "revised_draft": new_revised_draft,
        "status": "pending_review",
        "terminal_logs": logs,
        "dialogue_transcript": transcript,
        "agent_mood": "speaking"
    }