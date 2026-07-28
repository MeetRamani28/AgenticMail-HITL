import React, { useState } from "react";
import { type AgentStateResponse, submitHITLAction } from "../services/api";
import {
  CheckCircle,
  RefreshCw,
  XCircle,
  BookOpen,
  Send,
  Sparkles,
} from "lucide-react";

interface Props {
  emailState: AgentStateResponse;
  onStateUpdated: (newState: AgentStateResponse) => void;
}

export const EmailDetailView: React.FC<Props> = ({
  emailState,
  onStateUpdated,
}) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  const handleAction = async (action: "approve" | "revise" | "reject") => {
    try {
      setLoading(true);
      const updated = await submitHITLAction({
        thread_id: emailState.thread_id,
        action,
        feedback: action === "revise" ? feedback : undefined,
      });
      onStateUpdated(updated);
      setFeedback("");
      setShowFeedbackInput(false);
    } catch (err) {
      alert("Error executing HITL action");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentDraft = emailState.revised_draft || emailState.draft_response;

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
              Inbound Email
            </span>
            <h2 className="text-lg font-bold text-slate-800 mt-2">
              {emailState.subject}
            </h2>
            <p className="text-sm text-slate-500">
              From:{" "}
              <span className="font-medium text-slate-700">
                {emailState.sender}
              </span>
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              emailState.status === "approved_and_sent"
                ? "bg-emerald-100 text-emerald-800"
                : emailState.status === "pending_review"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            Status: {emailState.status}
          </span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm whitespace-pre-wrap border border-slate-100">
          {emailState.email_body}
        </div>
      </div>

      <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
        <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-sm mb-3">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Retrieved Company Policies (RAG Context)</span>
        </div>
        <div className="space-y-2">
          {emailState.retrieved_docs.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white p-3 rounded-lg text-xs text-indigo-950 border border-indigo-100 shadow-2xs"
            >
              {doc}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">
              {emailState.revised_draft
                ? "Revised Response Draft"
                : "AI Generated Draft"}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Iteration: #{emailState.iteration_count}
          </span>
        </div>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
          {currentDraft || "Draft is generating..."}
        </div>

        {emailState.status === "pending_review" && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            {!showFeedbackInput ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition text-sm cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve & Send Email</span>
                </button>

                <button
                  onClick={() => setShowFeedbackInput(true)}
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition text-sm cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Request Edits / Give Feedback</span>
                </button>

                <button
                  onClick={() => handleAction("reject")}
                  disabled={loading}
                  className="bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-600 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition text-sm cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <label className="block text-xs font-bold text-amber-900">
                  Provide Instructions to AI (Feedback Refinement Loop):
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Make it more polite and add a 10% coupon code DISCOUNT10..."
                  className="w-full p-2.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowFeedbackInput(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction("revise")}
                    disabled={loading || !feedback.trim()}
                    className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md flex items-center space-x-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit & Rewrite Draft</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
