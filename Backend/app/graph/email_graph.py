from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.state.email_state import EmailState
from app.nodes.rag_node import retrieve_context_node
from app.nodes.writer_node import draft_response_node
from app.nodes.topic_writer_node import draft_topic_email_node
from app.nodes.feedback_node import refine_draft_node
from app.nodes.email_sender_node import send_email_node
from app.nodes.hitl_node import hitl_approval_node


def route_writer(state: EmailState) -> str:
    """Routes to inbound HTML generator OR outbound HTML topic generator."""
    if state.get("is_outbound", False):
        return "draft_topic_email"
    return "draft_response"


def route_human_decision(state: EmailState) -> str:
    """Routes based on user's voice/text executive command."""
    status = state.get("status")
    if status == "approved":
        return "send_email"
    elif status == "save_draft":
        return "send_email"  
    elif status == "revision_requested":
        return "refine_draft"
    elif status == "rejected":
        return "reject_end"
    else:
        return "wait_for_human"


def create_email_agent_graph():
    workflow = StateGraph(EmailState)
    
    workflow.add_node("retrieve_context", retrieve_context_node)
    workflow.add_node("draft_response", draft_response_node)
    workflow.add_node("draft_topic_email", draft_topic_email_node)
    workflow.add_node("hitl_approval", hitl_approval_node)
    workflow.add_node("refine_draft", refine_draft_node)
    workflow.add_node("send_email", send_email_node)
    
    workflow.set_entry_point("retrieve_context")
    
    workflow.add_conditional_edges(
        "retrieve_context",
        route_writer,
        {
            "draft_response": "draft_response",
            "draft_topic_email": "draft_topic_email"
        }
    )
    
    workflow.add_edge("draft_response", "hitl_approval")
    workflow.add_edge("draft_topic_email", "hitl_approval")
    workflow.add_edge("refine_draft", "hitl_approval")  
    workflow.add_edge("send_email", END)
    
    workflow.add_conditional_edges(
        "hitl_approval",
        route_human_decision,
        {
            "send_email": "send_email",
            "refine_draft": "refine_draft",
            "reject_end": END,
            "wait_for_human": "hitl_approval"
        }
    )
    
    checkpointer = MemorySaver()
    return workflow.compile(checkpointer=checkpointer, interrupt_before=["hitl_approval"])


email_agent_app = create_email_agent_graph()