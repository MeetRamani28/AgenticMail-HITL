import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { EmailDetailView } from "./components/EmailDetailView";
import { processInboundEmail, type AgentStateResponse } from "./services/api";
import { PlusCircle, Inbox } from "lucide-react";

export const App: React.FC = () => {
  const [activeState, setActiveState] = useState<AgentStateResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const handleSimulateEmail = async () => {
    setLoading(true);
    const mockEmail = {
      thread_id: `thread_${Date.now()}`,
      email_id: `msg_${Date.now()}`,
      sender: "customer.alex@example.com",
      subject: "Inquiry about Return Policy and Shipping Delays",
      email_body:
        "Hi Support, I bought a jacket 10 days ago but want to return it. Also my order was delayed. Can I get a discount or refund?",
    };

    try {
      const state = await processInboundEmail(mockEmail);
      setActiveState(state);
    } catch (err) {
      alert("Failed to connect to LangGraph Backend");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto p-6 space-x-6">
        <div className="w-80 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-800 flex items-center space-x-2">
                <Inbox className="w-4 h-4 text-indigo-600" />
                <span>Inbox Queue</span>
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {activeState ? 1 : 0} Pending
              </span>
            </div>

            {activeState ? (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg cursor-pointer">
                <p className="text-xs font-bold text-indigo-950 truncate">
                  {activeState.subject}
                </p>
                <p className="text-xs text-indigo-700 truncate">
                  {activeState.sender}
                </p>
                <span className="inline-block text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mt-2 font-medium">
                  {activeState.status}
                </span>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active emails in queue. Click below to simulate an inbound
                email!
              </div>
            )}
          </div>

          <button
            onClick={handleSimulateEmail}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {loading ? "Processing Agent Graph..." : "Simulate Inbound Email"}
            </span>
          </button>
        </div>

        {activeState ? (
          <EmailDetailView
            emailState={activeState}
            onStateUpdated={setActiveState}
          />
        ) : (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <Inbox className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">
              Autonomous Agent Workspace
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mt-1">
              Simulate an inbound email to watch LangGraph run RAG context
              retrieval and prompt HITL human verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
