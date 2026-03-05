'use client';
import { Phase } from '@/types/kitchen';

export default function ProgressBar({ percent, phase }: { percent: number; phase: Phase }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Progress</span>
        <span className="text-xs font-mono font-semibold text-gray-300">{percent}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out progress-${phase}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
