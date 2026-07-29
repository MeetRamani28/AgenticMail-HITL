import React, { useState } from "react";
import { type AgentStateResponse, submitHITLAction } from "../services/api";
import {
  CheckCircle,
  RefreshCw,
  XCircle,
  BookOpen,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Save,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface Props {
  emailState: AgentStateResponse;
  onStateUpdated: (newState: AgentStateResponse) => void;
}

export const EmailDetailView: React.FC<Props> = ({
  emailState,
  onStateUpdated,
}) => {
  const [feedback, setFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakDraft = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Your browser does not support Speech Synthesis.");
      return;
    }

    const currentDraft =
      emailState.revised_draft || emailState.draft_response || "";
    const plainText = currentDraft.replace(/<[^>]*>?/gm, "");

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `Here is the executive response draft: ${plainText}. Would you like to approve and send, save as a mailbox draft, or request changes?`,
    );
    utterance.rate = 0.95;
    utterance.pitch = 0.98;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleAction = async (
    action: "approve" | "revise" | "save_draft" | "reject",
  ) => {
    handleStopSpeech();
    const loadingToast = toast.loading(
      action === "approve"
        ? "Dispatching email via Gmail API..."
        : action === "save_draft"
          ? "Saving draft to official Gmail Mailbox..."
          : action === "revise"
            ? "AI Core is revising draft based on executive feedback..."
            : "Rejecting workflow...",
    );

    try {
      setActionLoading(true);
      const updated = await submitHITLAction({
        thread_id: emailState.thread_id,
        action,
        feedback: action === "revise" ? feedback : undefined,
      });
      onStateUpdated(updated);
      setFeedback("");
      setShowFeedbackInput(false);

      toast.dismiss(loadingToast);

      if (action === "approve") {
        toast.success("🚀 Email successfully dispatched via Gmail!");
      } else if (action === "save_draft") {
        toast.success("📌 Draft safely stored in Gmail Drafts folder!");
      } else if (action === "revise") {
        toast.success("✨ Draft updated successfully!");
      } else {
        toast.error("❌ Workflow terminated.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to execute executive HITL command.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const currentDraft = emailState.revised_draft || emailState.draft_response;

  const renderSafeHTML = (htmlContent: string) => {
    const sanitized = htmlContent.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );
    return { __html: sanitized };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto space-y-4 pr-1"
    >
      <div className="bg-[#090d16]/90 p-4 rounded-xl border border-cyan-900/40 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
              {emailState.is_outbound
                ? "OUTBOUND EXECUTIVE TOPIC"
                : "INBOUND EMAIL THREAD"}
            </span>
            <h2 className="text-base font-bold text-slate-100 mt-2 font-mono">
              {emailState.subject}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {emailState.is_outbound ? "To: " : "From: "}{" "}
              <span className="font-semibold text-cyan-300">
                {emailState.sender}
              </span>
            </p>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
              emailState.status === "approved_and_sent"
                ? "bg-emerald-950 text-emerald-400 border-emerald-700"
                : emailState.status === "saved_as_gmail_draft"
                  ? "bg-cyan-950 text-cyan-400 border-cyan-700"
                  : "bg-amber-950 text-amber-400 border-amber-700"
            }`}
          >
            STATUS: {emailState.status}
          </span>
        </div>
        <div className="bg-[#050811] p-3 rounded-lg text-slate-300 text-xs whitespace-pre-wrap border border-cyan-900/40 font-mono">
          {emailState.topic
            ? `Topic Instructions: ${emailState.topic}`
            : emailState.email_body}
        </div>
      </div>

      <div className="bg-cyan-950/20 p-3.5 rounded-xl border border-cyan-900/40">
        <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs mb-2 font-mono uppercase">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Retrieved Vector Policy Context (RAG)</span>
        </div>
        <div className="space-y-1.5">
          {emailState.retrieved_docs.length > 0 ? (
            emailState.retrieved_docs.map((doc, idx) => (
              <div
                key={idx}
                className="bg-[#050811] p-2.5 rounded text-[11px] text-cyan-200 border border-cyan-900/40 font-mono"
              >
                {doc}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 font-mono">
              No specific policies matched.
            </p>
          )}
        </div>
      </div>

      <div className="bg-[#090d16]/90 p-4 rounded-xl border border-cyan-900/40 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm font-mono uppercase">
              {emailState.revised_draft
                ? "REVISED EXECUTIVE DRAFT"
                : "AI GENERATED EXECUTIVE DRAFT"}
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            {isSpeaking ? (
              <button
                onClick={handleStopSpeech}
                className="px-2.5 py-1 bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 text-xs font-semibold rounded flex items-center space-x-1 cursor-pointer transition font-mono"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>STOP TTS</span>
              </button>
            ) : (
              <button
                onClick={handleSpeakDraft}
                className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-700 hover:bg-cyan-900 text-xs font-semibold rounded flex items-center space-x-1 cursor-pointer transition font-mono"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>LISTEN DRAFT</span>
              </button>
            )}
            <span className="text-xs text-slate-500 font-mono">
              ITERATION: #{emailState.iteration_count}
            </span>
          </div>
        </div>

        <div className="bg-[#050811] p-4 rounded-lg text-sm border border-cyan-900/40">
          {currentDraft ? (
            currentDraft.includes("<") && currentDraft.includes(">") ? (
              <div
                className="bg-white text-slate-900 p-6 rounded-md shadow-inner overflow-x-auto"
                dangerouslySetInnerHTML={renderSafeHTML(currentDraft)}
              />
            ) : (
              <div className="text-slate-200 font-mono whitespace-pre-wrap">
                {currentDraft}
              </div>
            )
          ) : (
            <p className="text-slate-500 font-mono text-center py-6">
              [AI-CORE] Draft generation in progress...
            </p>
          )}
        </div>

        {emailState.status === "pending_review" && (
          <div className="pt-2 border-t border-cyan-900/40 space-y-3">
            {!showFeedbackInput ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={actionLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-2.5 px-3 rounded flex items-center justify-center space-x-1.5 transition text-xs cursor-pointer shadow font-mono disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>APPROVE & SEND</span>
                </button>

                <button
                  onClick={() => handleAction("save_draft")}
                  disabled={actionLoading}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-2.5 px-3 rounded flex items-center justify-center space-x-1.5 transition text-xs cursor-pointer shadow font-mono disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE AS GMAIL DRAFT</span>
                </button>

                <button
                  onClick={() => setShowFeedbackInput(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 px-3 rounded flex items-center justify-center space-x-1.5 transition text-xs cursor-pointer shadow font-mono disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>REQUEST CHANGES</span>
                </button>

                <button
                  onClick={() => handleAction("reject")}
                  disabled={actionLoading}
                  className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 font-bold py-2.5 px-3 rounded flex items-center justify-center space-x-1 transition text-xs cursor-pointer font-mono disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>REJECT</span>
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 bg-[#050811] p-4 rounded-lg border border-amber-500/40"
              >
                <label className="block text-xs font-bold text-amber-400 font-mono">
                  EXECUTIVE INSTRUCTIONS (REFINEMENT LOOP):
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Schedule meeting for tomorrow at 9 AM IST instead..."
                  className="w-full p-2.5 text-xs bg-[#090d16] border border-amber-500/60 rounded text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowFeedbackInput(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 rounded cursor-pointer font-mono"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleAction("revise")}
                    disabled={actionLoading || !feedback.trim()}
                    className="px-4 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold rounded flex items-center space-x-1 cursor-pointer disabled:opacity-50 font-mono"
                  >
                    <Send className="w-3 h-3" />
                    <span>SUBMIT & REWRITE</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
