import os
import os.path
import base64
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify"
]


class GmailService:
    """Service class for authenticating with the Gmail API and fetching/sending emails.
    """
    def __init__(self, credentials_path: str = "credentials.json", token_path: str = "token.json"):
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.creds = None
        self.service = None
        self._authenticate()

    def _authenticate(self):
        """Handles the Gmail OAuth2 authentication process."""
        if os.path.exists(self.token_path):
            self.creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
            
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            elif os.path.exists(self.credentials_path):
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)
                self.creds = flow.run_local_server(port=0) 
                with open(self.token_path, "w") as token:
                    token.write(self.creds.to_json())
            else:
                print("⚠️ [GmailService] Warning: credentials.json not found. Gmail API running in Mock Mode.")
                return

        if self.creds:
            self.service = build("gmail", "v1", credentials=self.creds)
            print("✅ [GmailService] Authenticated with Gmail API successfully.")

    def fetch_unread_emails(self, max_results: int = 5):
        """Fetches unread emails from the inbox."""
        if not self.service:
            print("⚠️ [GmailService] Service not initialized. Returning empty list.")
            return []

        try:
            results = self.service.users().messages().list(
                userId="me", q="is:unread", maxResults=max_results
            ).execute()
            messages = results.get("messages", [])
            
            unread_emails = []
            for msg in messages:
                msg_data = self.service.users().messages().get(
                    userId="me", id=msg["id"], format="full"
                ).execute()
                
                headers = msg_data.get("payload", {}).get("headers", [])
                subject = next((h["value"] for h in headers if h["name"].lower() == "subject"), "No Subject")
                sender = next((h["value"] for h in headers if h["name"].lower() == "from"), "Unknown Sender")
                
                snippet = msg_data.get("snippet", "")
                
                unread_emails.append({
                    "thread_id": msg_data.get("threadId"),
                    "email_id": msg["id"],
                    "sender": sender,
                    "subject": subject,
                    "email_body": snippet
                })
                
            return unread_emails

        except Exception as e:
            print(f"❌ [GmailService] Error fetching unread emails: {str(e)}")
            return []

    def fetch_email_history(self, max_results: int = 15):
        """Fetches last N emails from sent and inbox for history overview."""
        if not self.service:
            return []

        try:
            results = self.service.users().messages().list(
                userId="me", maxResults=max_results
            ).execute()
            messages = results.get("messages", [])
            
            history = []
            for msg in messages:
                msg_data = self.service.users().messages().get(
                    userId="me", id=msg["id"], format="full"
                ).execute()
                
                headers = msg_data.get("payload", {}).get("headers", [])
                subject = next((h["value"] for h in headers if h["name"].lower() == "subject"), "No Subject")
                sender = next((h["value"] for h in headers if h["name"].lower() == "from"), "Unknown Sender")
                snippet = msg_data.get("snippet", "")
                
                history.append({
                    "thread_id": msg_data.get("threadId"),
                    "email_id": msg["id"],
                    "sender": sender,
                    "subject": subject,
                    "snippet": snippet
                })
            return history
        except Exception as e:
            print(f"❌ [GmailService] Error fetching email history: {str(e)}")
            return []

    def send_email(self, to_email: str, subject: str, body_text: str, thread_id: str = None) -> bool:
        """Sends a new email or replies within a thread."""
        if not self.service:
            print("⚠️ [GmailService] Mock Mode Active: Email simulated sending.")
            print(f"To: {to_email} | Subject: {subject}\nBody:\n{body_text}")
            return True

        try:
            message = MIMEText(body_text)
            message["to"] = to_email
            message["subject"] = subject
            
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            body = {"raw": raw_message}
            
            if thread_id:
                body["threadId"] = thread_id

            self.service.users().messages().send(
                userId="me", body=body
            ).execute()
            
            print(f"🚀 [GmailService] Email successfully sent to {to_email}")
            return True

        except Exception as e:
            print(f"❌ [GmailService] Failed to send email: {str(e)}")
            return False


gmail_service = GmailService()