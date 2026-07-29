import React, { useState } from "react";
import { VoiceService } from "../services/voiceService";
import { Volume2, VolumeX, Mic, Send, RefreshCw } from "lucide-react";
import { type AgentStateResponse } from "../services/api";

interface Props {
  emailState: AgentStateResponse;
  onApproveAndSend: () => void;
  onRevise: (feedback: string) => void;
}

export const VoiceAgentController: React.FC<Props> = ({
  emailState,
  onApproveAndSend,
  onRevise,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userFeedback, setUserFeedback] = useState("");

  const handleReadDraft = () => {
    const draftText =
      emailState.revised_draft || emailState.draft_response || "";
    setIsSpeaking(true);

    VoiceService.speak(
      `Here is the draft response: ${draftText}. Would you like to send this email or modify it?`,
      () => {
        setIsSpeaking(false);
      },
    );
  };

  const handleStopSpeech = () => {
    VoiceService.stop();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Mic className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className="font-bold text-sm text-indigo-200">
            Voice Assistant Workflow
          </h3>
        </div>

        {isSpeaking ? (
          <button
            onClick={handleStopSpeech}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-xs rounded-md flex items-center space-x-1 cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Stop Speaking</span>
          </button>
        ) : (
          <button
            onClick={handleReadDraft}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-xs rounded-md flex items-center space-x-1 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Option 1: Listen to Draft</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onApproveAndSend}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition"
        >
          <Send className="w-4 h-4" />
          <span>Option 2: Direct Send (Without Reading)</span>
        </button>

        <button
          onClick={() => handleReadDraft()}
          className="bg-indigo-700 hover:bg-indigo-800 text-white p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition"
        >
          <Volume2 className="w-4 h-4" />
          <span>Read & Review Draft First</span>
        </button>
      </div>

      <div className="pt-2 border-t border-slate-800 space-y-2">
        <label className="text-[11px] font-medium text-slate-400">
          Want to change or add something to the draft?
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            placeholder="e.g. Add 10% coupon code and make it formal..."
            className="flex-1 bg-slate-800 border border-slate-700 p-2 text-xs text-white rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => {
              if (userFeedback.trim()) {
                onRevise(userFeedback);
                setUserFeedback("");
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-md text-xs font-medium flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Revise</span>
          </button>
        </div>
      </div>
    </div>
  );
};
