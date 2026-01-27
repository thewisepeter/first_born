'use client';

import { Receipt } from 'lucide-react';

interface QuarterlyGiving {
  label: string;
  amount: string;
}

interface GivingSummaryCardProps {
  total: string;
  quarters: QuarterlyGiving[];
}

export default function GivingSummaryCard({
  total = 'UGX 0',
  quarters = [],
}: GivingSummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col h-full overflow-hidden">
      {/* Header - More compact */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-50 shrink-0">
          <Receipt className="h-4 w-4 text-purple-600" />
        </div>
        <h2 className="text-sm font-bold text-gray-700 truncate">Giving Summary</h2>
      </div>

      {/* Total Given - Scaled down for 4-column layout */}
      <div className="text-center mb-5 min-w-0">
        <p className="text-xl md:text-2xl font-black text-gray-900 truncate px-1" title={total}>
          {total}
        </p>
        <div className="w-12 h-1 mx-auto my-1.5 rounded-full bg-gradient-to-r from-purple-600 to-[#B28930]" />
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Given</p>
      </div>

      {/* Quarterly Breakdown - Compact rows */}
      <div className="space-y-1.5 mt-auto">
        {quarters.map((q) => (
          <div
            key={q.label}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 border border-gray-100 min-w-0"
          >
            <span className="text-[11px] font-bold text-gray-500 shrink-0 mr-2">{q.label}</span>
            <span className="text-xs font-bold text-gray-800 truncate" title={q.amount}>
              {q.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
