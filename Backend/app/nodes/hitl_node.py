from app.state.email_state import EmailState


def hitl_approval_node(state: EmailState) -> EmailState:
    """
    HITL Approval Node (Jarvis Sci-Fi Edition):
    Pauses execution and waits for human decision (Voice/Text Command).
    """
    print(f"🛑 [HITL Node] Workflow paused. Waiting for Human Command. Current Status: {state.get('status')}")
    
    logs = state.get("terminal_logs", [])
    logs.append("[HITL-CORE] System paused. Awaiting executive voice/text approval...")
    
    return {
        **state,
        "terminal_logs": logs,
        "agent_mood": "listening"
    }