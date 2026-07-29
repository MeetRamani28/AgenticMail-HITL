/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { EmailDetailView } from "./components/EmailDetailView";
import {
  processInboundEmail,
  createOutboundDraft,
  fetchUnreadInbox,
  fetchEmailHistory,
  type AgentStateResponse,
} from "./services/api";
import {
  PlusCircle,
  Inbox,
  Send,
  History,
  RefreshCw,
  Mail,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";

export const App: React.FC = () => {
  const [activeState, setActiveState] = useState<AgentStateResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbox" | "create" | "history">(
    "inbox",
  );

  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [historyEmails, setHistoryEmails] = useState<any[]>([]);

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const loadInboxAndHistory = useCallback(async () => {
    try {
      const inboxRes = await fetchUnreadInbox();
      setInboxEmails(inboxRes.emails || []);

      const historyRes = await fetchEmailHistory();
      setHistoryEmails(historyRes.history || []);
    } catch (err) {
      console.error("Failed to load inbox/history:", err);
      toast.error("Failed to sync inbox data from Gmail.");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const inboxRes = await fetchUnreadInbox();
        const historyRes = await fetchEmailHistory();
        if (isMounted) {
          setInboxEmails(inboxRes.emails || []);
          setHistoryEmails(historyRes.history || []);
        }
      } catch (err) {
        console.error("Failed to load inbox/history:", err);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectInboundEmail = async (email: any) => {
    setLoading(true);
    // ખબરો બતાવવા માટે ફક્ત Toast Notification નો જ ઉપયોગ
    const toastId = toast.loading(
      "🤖 AI processing email & generating draft...",
    );

    try {
      const state = await processInboundEmail({
        thread_id: email.thread_id,
        email_id: email.email_id,
        sender: email.sender,
        subject: email.subject,
        email_body: email.email_body,
      });
      setActiveState(state);
      toast.dismiss(toastId);
      toast.success("✨ Draft generated successfully! Ready for review.");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to process email with LangGraph backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOutboundDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !topic) {
      toast.error("Please fill all fields!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("🚀 Drafting email from your topic...");

    try {
      const state = await createOutboundDraft({
        recipient_email: recipient,
        subject,
        topic,
      });
      setActiveState(state);
      setRecipient("");
      setSubject("");
      setTopic("");
      toast.dismiss(toastId);
      toast.success("✨ Outbound draft created successfully!");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to generate draft from topic.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative">
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto p-6 space-x-6">
        <div className="w-80 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex border-b border-slate-200 pb-2 mb-4 space-x-1">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center space-x-1 cursor-pointer transition ${
                  activeTab === "inbox"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Inbox ({inboxEmails.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center space-x-1 cursor-pointer transition ${
                  activeTab === "create"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>New Mail</span>
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center space-x-1 cursor-pointer transition ${
                  activeTab === "history"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </button>
            </div>

            {activeTab === "inbox" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    UNREAD GMAIL INBOX
                  </span>
                  <button
                    onClick={() => {
                      loadInboxAndHistory();
                      toast.success("Inbox refreshed!");
                    }}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {inboxEmails.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No unread emails found.
                  </p>
                ) : (
                  inboxEmails.map((email) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      key={email.email_id}
                      onClick={() => handleSelectInboundEmail(email)}
                      className={`p-3 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 rounded-lg cursor-pointer transition shadow-2xs ${
                        loading ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {email.subject}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {email.sender}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === "create" && (
              <form onSubmit={handleCreateOutboundDraft} className="space-y-3">
                <p className="text-xs font-bold text-slate-700">
                  Generate Mail from Topic
                </p>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600">
                    Recipient Email:
                  </label>
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full p-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600">
                    Subject:
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Meeting Updates / Notice"
                    className="w-full p-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600">
                    Topic / Key Points:
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={4}
                    placeholder="Provide detailed instructions or topic..."
                    className="w-full p-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-md flex items-center justify-center space-x-1 cursor-pointer transition shadow-sm disabled:opacity-50"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{loading ? "Generating..." : "Generate AI Draft"}</span>
                </button>
              </form>
            )}

            {activeTab === "history" && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <span className="text-[11px] font-bold text-slate-500">
                  PAST EMAIL HISTORY
                </span>
                {historyEmails.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No email history found.
                  </p>
                ) : (
                  historyEmails.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg"
                    >
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {item.subject}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.sender}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {activeState ? (
          <EmailDetailView
            emailState={activeState}
            onStateUpdated={setActiveState}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <Mail className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">
              Autonomous Agent Workspace
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mt-1">
              Select an unread email from your Inbox OR generate an outbound
              email draft using custom topic instructions.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default App;
