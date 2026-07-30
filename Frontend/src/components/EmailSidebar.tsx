/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useAgent } from "../context/AgentContext";
import { processInboundEmail } from "../services/api";
import { Inbox, PlusCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export const EmailSidebar: React.FC = () => {
  const {
    inboxEmails,
    activeTab,
    setActiveTab,
    setSelectedState,
    refreshInbox,
    markAsReadInGmail,
  } = useAgent();
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    await refreshInbox();
    setSyncing(false);
    toast.success("Gmail Mailbox Synchronized via Socket.IO!");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectEmail = async (email: any) => {
    markAsReadInGmail(email.email_id);

    const toastId = toast.loading("Opening Executive Draft...");
    try {
      const result = await processInboundEmail({
        thread_id: email.thread_id || email.email_id,
        email_id: email.email_id,
        sender: email.sender,
        subject: email.subject,
        email_body: email.email_body,
      });
      setSelectedState(result);
      toast.dismiss(toastId);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to load draft.");
    }
  };

  return (
    <div className="w-80 bg-[#090d16]/80 border border-cyan-900/40 rounded-xl p-3.5 flex flex-col justify-between h-full shadow-[0_0_25px_rgba(0,0,0,0.5)] select-none">
      <div className="space-y-2 border-b border-cyan-900/40 pb-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setActiveTab("inbox");
              setSelectedState(null);
            }}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer font-mono ${
              activeTab === "inbox"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900/40"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>INBOX ({inboxEmails.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("compose");
              setSelectedState(null);
            }}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer font-mono ${
              activeTab === "compose"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900/40"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>NEW OUTBOUND</span>
          </button>
        </div>

        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="w-full flex items-center justify-center space-x-2 py-2 bg-[#050811] text-cyan-400 border border-cyan-800/60 hover:bg-cyan-950/40 rounded-lg text-xs font-bold transition cursor-pointer font-mono disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
          />
          <span>SYNC GMAIL API</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 my-3 pr-1 font-mono">
        <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">
          UNREAD MAILBOX THREADS
        </div>

        {inboxEmails.length > 0 ? (
          inboxEmails.map((email, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectEmail(email)}
              className="bg-[#050811] p-3 rounded-lg border border-cyan-900/40 hover:border-cyan-500 cursor-pointer transition space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-300 truncate max-w-[160px]">
                  {email.sender}
                </span>
                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">
                  UNREAD
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-100 group-hover:text-cyan-400 truncate">
                {email.subject}
              </h4>
              <p className="text-[10px] text-slate-400 line-clamp-1">
                {email.email_body}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600/60 mx-auto" />
            <p className="text-xs">All caught up! Zero unread emails.</p>
          </div>
        )}
      </div>

      <div className="border-t border-cyan-900/40 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>BACKGROUND SERVICE:</span>
        <span className="text-emerald-400 font-bold flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>AUTONOMOUS ACTIVE</span>
        </span>
      </div>
    </div>
  );
};
