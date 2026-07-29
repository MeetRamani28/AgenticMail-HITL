/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { AgenticMailOrb } from "./components/AgenticMailOrb";
import { SystemMetrics } from "./components/SystemMetrics";
import { DialogueChat } from "./components/DialogueChat";
import { EmailDetailView } from "./components/EmailDetailView";
import {
  fetchUnreadInbox,
  processInboundEmail,
  createOutboundDraft,
  type AgentStateResponse,
} from "./services/api";
import { VoiceService } from "./services/voiceService";
import toast from "react-hot-toast";
import {
  Inbox,
  Send,
  RefreshCw,
  PlusCircle,
  Mail,
  Activity,
} from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"inbox" | "compose">("inbox");
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [selectedEmailState, setSelectedEmailState] =
    useState<AgentStateResponse | null>(null);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [outboundLoading, setOutboundLoading] = useState(false);

  const handleRefreshInbox = async () => {
    try {
      setLoadingInbox(true);
      const res = await fetchUnreadInbox();
      if (res && res.emails) {
        setInboxEmails(res.emails);
      }
    } catch (err) {
      toast.error("Failed to fetch Gmail Inbox");
      console.error(err);
    } finally {
      setLoadingInbox(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRefreshInbox();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectEmail = async (email: any) => {
    const toastId = toast.loading(
      "Connecting AI Core & generating HTML draft...",
    );
    try {
      const result = await processInboundEmail({
        thread_id: email.thread_id || email.email_id,
        email_id: email.email_id,
        sender: email.sender,
        subject: email.subject,
        email_body: email.email_body,
      });
      setSelectedEmailState(result);
      toast.dismiss(toastId);
      toast.success("Executive draft ready for review!");

      VoiceService.speak(
        `Sir, email from ${email.sender} regarding ${email.subject} is analyzed. Draft is ready on screen.`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Error processing inbound email.");
    }
  };

  const handleCreateOutbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !topic) {
      toast.error("Please fill all fields for outbound mail.");
      return;
    }

    const toastId = toast.loading("AI Core creating custom HTML draft...");
    try {
      setOutboundLoading(true);
      const result = await createOutboundDraft({
        recipient_email: recipient,
        subject: subject,
        topic: topic,
      });
      setSelectedEmailState(result);
      toast.dismiss(toastId);
      toast.success("Outbound HTML email draft generated!");

      VoiceService.speak(
        `Sir, outbound email to ${recipient} is drafted. Ready for your command.`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to generate outbound draft.");
    } finally {
      setOutboundLoading(false);
    }
  };

  const handleToggleListen = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast("Listening to executive voice command...", { icon: "🎙️" });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleUserVoiceCommand(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed. Try again.");
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleUserVoiceCommand = (cmd: string) => {
    toast(`Executive Command: "${cmd}"`, { icon: "🗣️" });

    if (!selectedEmailState) return;

    const lower = cmd.toLowerCase();
    if (lower.includes("send") || lower.includes("approve")) {
      toast.success("Voice confirmed: Approving & Sending...");
    } else if (lower.includes("save") || lower.includes("draft")) {
      toast.success("Voice confirmed: Saving to Gmail Mailbox...");
    } else {
      toast.success("Processing voice refinement loop...");
    }
  };

  const currentMood = selectedEmailState?.agent_mood || "idle";
  const currentLogs = selectedEmailState?.terminal_logs || [
    "[SYS-INIT] AgenticMail-HITL Kernel Online.",
    "[SECURE-AUTH] Gmail OAuth 2.0 Token Verified.",
    "[RAG-DB] Qdrant Knowledge Engine Standing By.",
  ];
  const currentTranscript = selectedEmailState?.dialogue_transcript || [];

  return (
    <div className="flex flex-col h-screen bg-[#050811] text-slate-100 font-mono overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <SystemMetrics terminalLogs={currentLogs} />

        <div className="flex-1 flex flex-col bg-[#090d16]/60 border border-cyan-900/40 rounded-xl p-4 overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <div className="border-b border-cyan-900/40 pb-4 mb-4">
            <AgenticMailOrb mood={currentMood} />
          </div>

          <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3 mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setActiveTab("inbox");
                  setSelectedEmailState(null);
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "inbox"
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900/40"
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>INBOX THREADS</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("compose");
                  setSelectedEmailState(null);
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "compose"
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900/40"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>NEW OUTBOUND</span>
              </button>
            </div>

            {activeTab === "inbox" && (
              <button
                onClick={handleRefreshInbox}
                disabled={loadingInbox}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#050811] text-cyan-400 border border-cyan-800/60 hover:bg-cyan-950/40 rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loadingInbox ? "animate-spin" : ""}`}
                />
                <span>SYNC GMAIL</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {selectedEmailState ? (
              <EmailDetailView
                emailState={selectedEmailState}
                onStateUpdated={(newState) => setSelectedEmailState(newState)}
              />
            ) : activeTab === "inbox" ? (
              <div className="space-y-2">
                {inboxEmails && inboxEmails.length > 0 ? (
                  inboxEmails.map((email, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectEmail(email)}
                      className="bg-[#050811] p-3.5 rounded-lg border border-cyan-900/40 hover:border-cyan-500/80 cursor-pointer transition flex items-start justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-cyan-300">
                            {email.sender}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-400 transition">
                          {email.subject}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {email.email_body}
                        </p>
                      </div>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded">
                        UNREAD
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-500 space-y-2">
                    <Activity className="w-8 h-8 text-cyan-900 mx-auto animate-pulse" />
                    <p className="text-xs">No unread emails in Gmail Inbox.</p>
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleCreateOutbound}
                className="space-y-4 max-w-xl mx-auto py-4"
              >
                <div className="bg-[#050811] p-5 rounded-xl border border-cyan-900/40 space-y-4">
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-cyan-900/40 pb-2">
                    EXECUTIVE OUTBOUND PARAMETERS
                  </h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      RECIPIENT EMAIL ADDRESS:
                    </label>
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. vinitramani@gmail.com"
                      className="w-full bg-[#090d16] border border-cyan-900/60 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      SUBJECT LINE:
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Executive Meeting Schedule & Project Sync"
                      className="w-full bg-[#090d16] border border-cyan-900/60 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      TOPIC INSTRUCTIONS FOR AI CORE:
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Ask for project update and tell him I want to meet tomorrow at 9 AM IST via Google Meet..."
                      rows={4}
                      className="w-full bg-[#090d16] border border-cyan-900/60 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={outboundLoading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded flex items-center justify-center space-x-2 text-xs transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {outboundLoading
                        ? "GENERATING HTML TEMPLATE..."
                        : "GENERATE EXECUTIVE AI DRAFT"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <DialogueChat
          transcript={currentTranscript}
          onUserVoiceCommand={handleUserVoiceCommand}
          isListening={isListening}
          onToggleListen={handleToggleListen}
        />
      </main>
    </div>
  );
};

export default App;
