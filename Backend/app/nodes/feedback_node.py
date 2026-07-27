from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.state.email_state import EmailState
from app.core.config import settings


def refine_draft_node(state: EmailState) -> EmailState:
    """
    Feedback Refiner Node:

    When a human reviewer provides feedback (e.g., "Add a 10% discount code and make it extra formal"),
    this node takes the existing draft and the reviewer's feedback to generate a new, revised draft.
    """
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.DEFAULT_MODEL,
        temperature=0.3
    )
    
    current_draft = state.get("revised_draft") or state.get("draft_response")
    human_feedback = state.get("human_feedback", "")
    
    system_prompt = """You are an Expert AI Email Editor.
Your job is to rewrite an existing draft email based on specific feedback provided by a human reviewer.

INSTRUCTIONS:
1. Carefully read the original draft and the reviewer's instructions/feedback.
2. Modify the draft to incorporate ALL human feedback accurately.
3. Maintain professional tone and high readability.
4. Return ONLY the final revised email body.
"""

    human_prompt = f"""Original Draft:
{current_draft}

Human Reviewer Feedback:
"{human_feedback}"

Please rewrite the email incorporating this feedback."""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ])
    
    new_revised_draft = response.content.strip()
    
    print(f"🔄 [Feedback Node] Draft revised based on human feedback (Iteration #{state.get('iteration_count')}).")
    
    return {
        **state,
        "revised_draft": new_revised_draft,
        "status": "pending_review"  
    }