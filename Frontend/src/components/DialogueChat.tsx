import React, { useState } from "react";
import { Mic, Send, Volume2, MessageSquare } from "lucide-react";

interface Props {
  transcript: string[];
  onUserVoiceCommand: (command: string) => void;
  isListening: boolean;
  onToggleListen: () => void;
}

export const DialogueChat: React.FC<Props> = ({
  transcript,
  onUserVoiceCommand,
  isListening,
  onToggleListen,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onUserVoiceCommand(inputText.trim());
    setInputText("");
  };

  return (
    <div className="w-80 bg-[#090d16]/80 border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between h-full shadow-[0_0_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-cyan-400">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase font-mono">
            LIVE TRANSCRIPT
          </span>
        </div>
        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.5 rounded font-mono uppercase">
          Voice-to-Voice
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
                    {isAgent ? "AGENTIC-MAIL CORE" : "EXECUTIVE (USER)"}
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
            No dialogue history. Speak or type a command to start.
          </p>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-cyan-900/40">
        <form onSubmit={handleSendText} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onToggleListen}
            className={`p-2 rounded-lg border transition ${
              isListening
                ? "bg-red-600 border-red-500 text-white animate-pulse"
                : "bg-cyan-950 border-cyan-800 text-cyan-400 hover:bg-cyan-900"
            }`}
            title="Toggle Voice Microphone"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or speak executive command..."
            className="flex-1 bg-[#050811] border border-cyan-900/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition"
            title="Send Command"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
