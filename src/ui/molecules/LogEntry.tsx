import React from 'react';
import type { BattleLog } from '../../core/models/types';


interface LogEntryProps {
  log: BattleLog;
}

export const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  return (
    <div className={`font-mono text-sm mb-1 animate-fade-in ${log.isCritical ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
      <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
      {log.isCritical && <span className="text-red-500 mr-2">¡CRÍTICO!</span>}
      {log.message}
    </div>
  );
};