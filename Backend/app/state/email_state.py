from typing import TypedDict, List, Optional, Dict, Any


class EmailState(TypedDict):
    """
    The central Sci-Fi State for AgenticMail-HITL (Jarvis / ARYA Edition).
    Stores email data, RAG context, Voice Mood, Dialogue history, and Terminal Logs.
    """
    thread_id: str
    email_id: str
    sender: str
    subject: str
    email_body: str
    topic: Optional[str]
    is_outbound: bool
    retrieved_docs: List[str]
    draft_response: str
    revised_draft: Optional[str]
    status: str
    human_feedback: Optional[str]
    iteration_count: int
    is_sent: bool
    error_message: Optional[str]
    agent_mood: str               
    dialogue_transcript: List[str]  
    terminal_logs: List[str]       