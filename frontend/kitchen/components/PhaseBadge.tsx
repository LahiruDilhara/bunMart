'use client';
import { Phase } from '@/types/kitchen';

const labels: Record<Phase, string> = {
  PREPARING: 'Preparing',
  BAKING: 'Baking',
  COMPLETED: 'Completed',
};

const icons: Record<Phase, string> = {
  PREPARING: '🥣',
  BAKING: '🔥',
  COMPLETED: '✅',
};

export default function PhaseBadge({ phase }: { phase: Phase }) {
  return (
    <span
      className={`phase-badge-${phase} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase font-mono`}
    >
      <span>{icons[phase]}</span>
      {labels[phase]}
    </span>
  );
}
