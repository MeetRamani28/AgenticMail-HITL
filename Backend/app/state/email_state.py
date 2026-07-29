from typing import TypedDict, List, Optional, Dict, Any
from typing_extensions import Annotated
import operator


class EmailState(TypedDict):
    """
    The central state object for AgenticMail-HITL.

    This state stores all the necessary information for email processing,
    context retrieved via RAG, and feedback from the HITL reviewer.
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