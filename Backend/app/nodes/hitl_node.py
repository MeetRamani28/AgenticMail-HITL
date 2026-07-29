from app.state.email_state import EmailState

def hitl_approval_node(state: EmailState) -> EmailState:
    print(f"🛑 [HITL Node] Waiting for Human Approval. Current Status: {state.get('status')}")
    return state