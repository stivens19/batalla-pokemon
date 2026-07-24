import React from 'react';

interface StatRowProps {
  label: string;
  value: number;
}

export const StatRow: React.FC<StatRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-700/50 last:border-0">
      <span className="text-gray-400 font-medium uppercase text-xs tracking-wider">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
};