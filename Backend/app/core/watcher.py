import asyncio
from app.core.gmail_service import gmail_service
from app.graph.email_graph import email_agent_app

class AutonomousWatcher:
    """
    Production Background Service:
    Continuously monitors Gmail, auto-generates drafts in the background,
    and emits real-time events via Socket.IO.
    """
    def __init__(self, sio):
        self.sio = sio
        self.is_running = False
        self.processed_ids = set()

    async def start_polling(self, interval_seconds: int = 15):
        self.is_running = True
        print("⚡ [AutonomousWatcher] Background OS Service Started.")
        
        while self.is_running:
            try:
                unread_emails = gmail_service.fetch_unread_emails(max_results=5)
                for email in unread_emails:
                    email_id = email["email_id"]
                    if email_id not in self.processed_ids:
                        self.processed_ids.add(email_id)
                        
                        await self.sio.emit("terminal_log", {"message": f"[MAIL-DETECTED] New email from {email['sender']} regarding '{email['subject']}'"})
                        await self.sio.emit("new_email_received", email)
                        
                        await self.sio.emit("terminal_log", {"message": f"[AI-CORE] Auto-generating draft for {email['sender']}..."})
                        
                        config = {"configurable": {"thread_id": email["thread_id"]}}
                        state_input = {
                            "thread_id": email["thread_id"],
                            "email_id": email_id,
                            "sender": email["sender"],
                            "subject": email["subject"],
                            "email_body": email["email_body"],
                            "is_outbound": False,
                            "retrieved_docs": [],
                            "draft_response": "",
                            "status": "processing",
                            "agent_mood": "thinking",
                            "terminal_logs": [],
                            "dialogue_transcript": []
                        }
                        
                        for _ in email_agent_app.stream(state_input, config):
                            pass
                            
                        final_state = email_agent_app.get_state(config).values
                        await self.sio.emit("draft_auto_ready", final_state)
                        await self.sio.emit("terminal_log", {"message": f"[DRAFT-READY] Draft ready for executive approval: {email['subject']}"})
                        
            except Exception as e:
                print(f"⚠️ [Watcher Error]: {str(e)}")
                
            await asyncio.sleep(interval_seconds)

    def stop(self):
        self.is_running = False