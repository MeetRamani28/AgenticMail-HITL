import React from "react";
import { Mail, ShieldCheck, Cpu } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AgenticMail-HITL</h1>
          <p className="text-xs text-slate-400">
            Autonomous Enterprise Email Operations
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">LangGraph Active</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs bg-indigo-950 text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-800">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>OWASP Compliant & HITL Enabled</span>
        </div>
      </div>
    </nav>
  );
};
