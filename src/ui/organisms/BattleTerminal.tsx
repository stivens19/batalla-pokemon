import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../molecules/LogEntry';
import type { BattleLog } from '../../core/models/types';

interface BattleTerminalProps {
  logs: BattleLog[];
}

export const BattleTerminal: React.FC<BattleTerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo cuando hay un nuevo log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-black border-2 border-gray-700 rounded-xl overflow-hidden flex flex-col h-64 md:h-80 shadow-2xl">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center">
        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-green-500 mr-4"></div>
        <span className="text-xs text-gray-400 font-mono">system_battle_log.exe</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto scroll-smooth custom-scrollbar"
      >
        {logs.length === 0 ? (
          <p className="text-gray-600 font-mono text-sm italic">Esperando inicio del combate...</p>
        ) : (
          logs.map((log) => <LogEntry key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
};