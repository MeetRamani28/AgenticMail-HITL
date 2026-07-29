import React from "react";
import { Mail, ShieldCheck, Cpu, Radio } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#090d16]/90 backdrop-blur-md text-white px-6 py-3.5 flex justify-between items-center border-b border-cyan-900/40 sticky top-0 z-50 shadow-[0_4px_20px_rgba(6,182,212,0.15)]">
      <div className="flex items-center space-x-3">
        <div className="bg-cyan-500/10 border border-cyan-500/40 p-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Mail className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-wider text-cyan-400 font-mono">
              AgenticMail-HITL
            </h1>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.5 rounded uppercase tracking-widest">
              v2.0 OS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wide font-mono">
            AUTONOMOUS ENTERPRISE EMAIL OPERATING SYSTEM
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-[11px] bg-[#050811] px-3 py-1.5 rounded-full border border-cyan-900/60">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-mono">SYSTEM ONLINE</span>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] bg-[#050811] px-3 py-1.5 rounded-full border border-emerald-900/60">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300 font-mono">LangGraph Active</span>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] bg-[#050811] text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-900/60">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono">OWASP Guarded</span>
        </div>
      </div>
    </nav>
  );
};
