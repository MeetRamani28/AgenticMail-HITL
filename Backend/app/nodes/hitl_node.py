from app.state.email_state import EmailState


def hitl_approval_node(state: EmailState) -> EmailState:
    """
    HITL Approval Node:
    The graph will be interrupted at this node.
    Here, the state of the human reviewer's decision is checked.
    """
    status = state.get("status")
    print(f"🛑 [HITL Node] Current Review Status: {status}")
    return state