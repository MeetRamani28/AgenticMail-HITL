import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { VoiceService } from "../services/voiceService";
import { fetchUnreadInbox, type AgentStateResponse } from "../services/api";

interface AgentContextType {
  socket: Socket | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inboxEmails: any[];
  selectedState: AgentStateResponse | null;
  setSelectedState: (state: AgentStateResponse | null) => void;
  activeTab: "inbox" | "compose";
  setActiveTab: (tab: "inbox" | "compose") => void;
  refreshInbox: () => Promise<void>;
  markAsReadInGmail: (emailId: string) => void;
  triggerVoiceUpdate: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<AgentStateResponse | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"inbox" | "compose">("inbox");

  const refreshInbox = async () => {
    try {
      const res = await fetchUnreadInbox();
      if (res?.emails) setInboxEmails(res.emails);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsReadInGmail = (emailId: string) => {
    if (socket) {
      socket.emit("mark_email_read", { email_id: emailId });
      setInboxEmails((prev) => prev.filter((e) => e.email_id !== emailId));
    }
  };

  const triggerVoiceUpdate = () => {
    const count = inboxEmails.length;
    if (count === 0) {
      VoiceService.speak(
        "Sir, all systems are operational. You have zero unread emails in your Gmail inbox.",
      );
    } else {
      VoiceService.speak(
        `Sir, you have ${count} unread emails. AI Core has automatically generated drafts in the background. Would you like to review them or send directly?`,
      );
    }
  };

  useEffect(() => {
    const sio = io("http://localhost:8000", { transports: ["websocket"] });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(sio);

    sio.on("terminal_log", (data: { message: string }) => {
      toast(data.message, {
        icon: "⚡",
        style: {
          background: "#090d16",
          color: "#22d3ee",
          border: "1px solid #0891b2",
        },
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sio.on("new_email_received", (email: any) => {
      setInboxEmails((prev) => {
        if (prev.some((e) => e.email_id === email.email_id)) return prev;
        return [email, ...prev];
      });
      VoiceService.speak(
        `Sir, new email detected from ${email.sender} regarding ${email.subject}. AI is preparing the draft.`,
      );
    });

    sio.on("draft_auto_ready", (readyDraft: AgentStateResponse) => {
      VoiceService.speak(
        `Sir, draft for ${readyDraft.subject} is ready for executive review.`,
      );
      if (!selectedState) setSelectedState(readyDraft);
    });

    refreshInbox();

    return () => {
      sio.disconnect();
    };
  }, []);

  return (
    <AgentContext.Provider
      value={{
        socket,
        inboxEmails,
        selectedState,
        setSelectedState,
        activeTab,
        setActiveTab,
        refreshInbox,
        markAsReadInGmail,
        triggerVoiceUpdate,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error("useAgent must be used within AgentProvider");
  return context;
};
