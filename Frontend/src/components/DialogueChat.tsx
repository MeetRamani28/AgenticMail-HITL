import React from "react";
import { Mic, Volume2, MessageSquare, Radio } from "lucide-react";

interface Props {
  transcript: string[];
  isListening: boolean;
  onToggleListen: () => void;
}

export const DialogueChat: React.FC<Props> = ({
  transcript,
  isListening,
  onToggleListen,
}) => {
  return (
    <div className="w-80 bg-[#090d16]/80 border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between h-full shadow-[0_0_25px_rgba(0,0,0,0.5)] select-none">
      <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-cyan-400">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase font-mono">
            VOICE-ONLY TRANSCRIPT
          </span>
        </div>
        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.5 rounded font-mono uppercase flex items-center space-x-1">
          <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
          <span>AUDIO LINK</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono text-xs">
        {transcript && transcript.length > 0 ? (
          transcript.map((msg, idx) => {
            const isAgent =
              msg.toUpperCase().startsWith("JARVIS:") ||
              msg.toUpperCase().startsWith("AGENTIC-MAIL:");
            const cleanText = msg.replace(
              /^(JARVIS|AGENTIC-MAIL|USER|SIR):\s*/i,
              "",
            );

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border leading-relaxed ${
                  isAgent
                    ? "bg-cyan-950/40 border-cyan-800/60 text-cyan-200 self-start mr-4"
                    : "bg-slate-900/80 border-slate-700 text-slate-200 self-end ml-4"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isAgent ? "text-cyan-400" : "text-emerald-400"
                    }`}
                  >
                    {isAgent ? "AGENTIC-MAIL CORE" : "EXECUTIVE (VOICE)"}
                  </span>
                  {isAgent && (
                    <Volume2 className="w-3 h-3 text-cyan-400 opacity-70" />
                  )}
                </div>
                <p className="text-slate-200">{cleanText}</p>
              </div>
            );
          })
        ) : (
          <p className="text-slate-500 text-center py-10 text-[11px] font-mono">
            No dialogue history. Press the executive microphone to speak.
          </p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-cyan-900/40 flex flex-col items-center">
        <button
          type="button"
          onClick={onToggleListen}
          className={`w-full py-3 rounded-xl border font-bold font-mono tracking-widest text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg ${
            isListening
              ? "bg-red-600 border-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]"
              : "bg-cyan-950 border-cyan-600 text-cyan-300 hover:bg-cyan-900/80 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          }`}
        >
          <Mic className={`w-4 h-4 ${isListening ? "animate-bounce" : ""}`} />
          <span>
            {isListening ? "LISTENING... SPEAK NOW" : "PRESS & SPEAK COMMAND"}
          </span>
        </button>
        <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase text-center">
          Say: "Approve & Send" • "Save Draft" • "Change to 10 AM" • "Reject"
        </p>
      </div>
    </div>
  );
};
