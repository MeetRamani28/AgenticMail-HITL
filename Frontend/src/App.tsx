/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { AgentProvider, useAgent } from "./context/AgentContext";
import { Navbar } from "./components/Navbar";
import { AgenticMailOrb } from "./components/AgenticMailOrb";
import { EmailSidebar } from "./components/EmailSidebar";
import { DialogueChat } from "./components/DialogueChat";
import { EmailDetailView } from "./components/EmailDetailView";
import { createOutboundDraft, submitHITLAction } from "./services/api";
import { VoiceService } from "./services/voiceService";
import { Send, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const DashboardContent: React.FC = () => {
  const { selectedState, setSelectedState, activeTab, triggerVoiceUpdate } =
    useAgent();

  // Outbound Form State
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [outboundLoading, setOutboundLoading] = useState(false);
  const [pendingSpellingConfirm, setPendingSpellingConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // 1. Initial Submit -> Trigger Voice Spelling Confirmation
  const handleInitiateOutbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !topic) {
      toast.error("Please fill all fields for outbound mail.");
      return;
    }

    setPendingSpellingConfirm(true);
    const msg = `Sir, you requested to send an email to ${recipient}. Please confirm if the email spelling is correct. Say 'Yes correct', 'Edit', or 'Cancel'.`;
    VoiceService.speak(msg);
    toast.custom(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (t) => (
        <div className="bg-[#090d16] border border-amber-500 text-amber-300 px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 font-mono text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Confirming spelling: {recipient}</span>
        </div>
      ),
      { duration: 6000 },
    );
  };

  const executeCreateOutbound = async () => {
    setPendingSpellingConfirm(false);
    const toastId = toast.loading("AI Core creating custom HTML draft...");
    try {
      setOutboundLoading(true);
      const result = await createOutboundDraft({
        recipient_email: recipient,
        subject,
        topic,
      });
      setSelectedState(result);
      toast.dismiss(toastId);
      toast.success("Outbound HTML email draft generated!");

      VoiceService.speak(
        `Sir, outbound email to ${recipient} is drafted. Say 'Approve and send', 'Save as draft', or speak your changes.`,
      );
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to generate outbound draft.");
    } finally {
      setOutboundLoading(false);
    }
  };

  const handleVoiceHITLAction = async (
    action: "approve" | "revise" | "save_draft" | "reject",
    feedback?: string,
  ) => {
    if (!selectedState) return;
    const toastId = toast.loading("Executing voice command via AI Core...");
    try {
      const updated = await submitHITLAction({
        thread_id: selectedState.thread_id,
        action,
        feedback,
      });
      setSelectedState(updated);
      toast.dismiss(toastId);

      if (action === "approve") {
        VoiceService.speak("Sir, the email has been sent successfully.");
      } else if (action === "save_draft") {
        VoiceService.speak("Sir, draft saved in your Gmail mailbox.");
      } else if (action === "revise") {
        VoiceService.speak(
          "Sir, I have revised the draft based on your instructions. Ready for review.",
        );
      } else {
        VoiceService.speak("Sir, workflow rejected and terminated.");
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Voice command execution failed.");
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
    const lower = cmd.toLowerCase();

    if (pendingSpellingConfirm) {
      if (
        lower.includes("yes") ||
        lower.includes("correct") ||
        lower.includes("confirm")
      ) {
        VoiceService.speak("Spelling confirmed. Generating draft now.");
        executeCreateOutbound();
      } else if (
        lower.includes("edit") ||
        lower.includes("no") ||
        lower.includes("change")
      ) {
        setPendingSpellingConfirm(false);
        VoiceService.speak(
          "Please type or speak the corrected recipient address.",
        );
      } else if (lower.includes("cancel")) {
        setPendingSpellingConfirm(false);
        VoiceService.speak("Outbound email composition canceled.");
      }
      return;
    }

    if (
      lower.includes("hello") ||
      lower.includes("update") ||
      lower.includes("status")
    ) {
      triggerVoiceUpdate();
      return;
    }

    if (!selectedState) return;

    if (
      lower.includes("send") ||
      lower.includes("approve") ||
      lower.includes("yes send")
    ) {
      handleVoiceHITLAction("approve");
    } else if (lower.includes("save") || lower.includes("draft")) {
      handleVoiceHITLAction("save_draft");
    } else if (lower.includes("reject") || lower.includes("cancel")) {
      handleVoiceHITLAction("reject");
    } else if (
      lower.includes("change") ||
      lower.includes("make it") ||
      lower.includes("schedule") ||
      lower.includes("rewrite") ||
      lower.includes("add")
    ) {
      handleVoiceHITLAction("revise", cmd);
    } else {
      VoiceService.speak(
        "Sir, I did not understand the executive command. Please repeat.",
      );
    }
  };

  const currentMood = selectedState?.agent_mood || "idle";
  const currentTranscript = selectedState?.dialogue_transcript || [];

  return (
    <div className="flex flex-col h-screen bg-[#050811] text-slate-100 font-mono overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <EmailSidebar />

        <div className="flex-1 flex flex-col bg-[#090d16]/60 border border-cyan-900/40 rounded-xl p-4 overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <div className="border-b border-cyan-900/40 pb-3 mb-3">
            <AgenticMailOrb mood={currentMood} />
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {selectedState ? (
              <EmailDetailView
                emailState={selectedState}
                onStateUpdated={(newState) => setSelectedState(newState)}
              />
            ) : activeTab === "compose" ? (
              <form
                onSubmit={handleInitiateOutbound}
                className="space-y-4 max-w-xl mx-auto py-4"
              >
                <div className="bg-[#050811] p-5 rounded-xl border border-cyan-900/40 space-y-4">
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-cyan-900/40 pb-2 flex items-center justify-between">
                    <span>EXECUTIVE OUTBOUND PARAMETERS</span>
                    {pendingSpellingConfirm && (
                      <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-600 px-2 py-0.5 rounded animate-pulse">
                        VOICE CONFIRMATION REQUIRED
                      </span>
                    )}
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      RECIPIENT EMAIL ADDRESS:
                    </label>
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. vinitramani21@gmail.com"
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
                      placeholder="e.g. Executive Meeting Schedule & Sync"
                      className="w-full bg-[#090d16] border border-cyan-900/60 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      TOPIC INSTRUCTIONS:
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Ask for project update and suggest meeting tomorrow..."
                      rows={4}
                      className="w-full bg-[#090d16] border border-cyan-900/60 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={outboundLoading || pendingSpellingConfirm}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded flex items-center justify-center space-x-2 text-xs transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {outboundLoading
                        ? "GENERATING HTML TEMPLATE..."
                        : "CONFIRM & GENERATE DRAFT"}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                Select an Inbox Thread from the left panel to review its
                auto-generated draft.
              </div>
            )}
          </div>
        </div>

        <DialogueChat
          transcript={currentTranscript}
          isListening={isListening}
          onToggleListen={handleToggleListen}
        />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AgentProvider>
      <DashboardContent />
    </AgentProvider>
  );
};

export default App;
