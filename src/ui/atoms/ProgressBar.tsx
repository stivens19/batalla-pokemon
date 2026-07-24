import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, max }) => {
  // Evitamos que el porcentaje baje de 0 o suba de 100
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  let colorClass = 'bg-green-500';
  if (percentage < 20) colorClass = 'bg-red-500';
  else if (percentage < 50) colorClass = 'bg-yellow-400';

  return (
    <div className="w-full bg-gray-800 rounded-full h-4 md:h-6 overflow-hidden border border-gray-600 shadow-inner">
      <div
        className={`h-full ${colorClass} transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};