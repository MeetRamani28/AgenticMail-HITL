import React from "react";
import { Cpu, Server, Shield, Terminal, Activity } from "lucide-react";

interface Props {
  terminalLogs: string[];
}

export const SystemMetrics: React.FC<Props> = ({ terminalLogs }) => {
  return (
    <div className="w-72 bg-[#090d16]/80 border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between h-full shadow-[0_0_25px_rgba(0,0,0,0.5)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase font-mono">
              SYSTEM METRICS
            </span>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono">
            ONLINE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#050811] p-2.5 rounded-lg border border-cyan-900/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase">CPU LOAD</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-base font-bold text-cyan-300 font-mono">18.4%</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-cyan-400 h-full w-[18%]" />
            </div>
          </div>

          <div className="bg-[#050811] p-2.5 rounded-lg border border-cyan-900/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase">RAM USAGE</span>
              <Server className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-base font-bold text-emerald-300 font-mono">
              4.2 GB
            </p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[35%]" />
            </div>
          </div>
        </div>

        <div className="bg-[#050811] p-3 rounded-lg border border-cyan-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>OWASP Top 10 Guard</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              ACTIVE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-300">
              RAG Vector Database
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              CONNECTED
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-300">
              Gmail OAuth 2.0 API
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              VERIFIED
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 flex flex-col min-h-[220px] bg-[#050811] rounded-lg border border-cyan-900/40 p-3 overflow-hidden">
        <div className="flex items-center space-x-1.5 text-cyan-400 text-xs font-mono border-b border-cyan-900/40 pb-1.5 mb-2">
          <Terminal className="w-3.5 h-3.5" />
          <span className="tracking-wider uppercase font-bold">
            TERMINAL LOGS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-300">
          {terminalLogs && terminalLogs.length > 0 ? (
            terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className="p-1.5 rounded bg-cyan-950/20 border-l-2 border-cyan-500 text-cyan-200 leading-relaxed"
              >
                {log}
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-6">
              [SYS-IDLE] Awaiting email stream...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
