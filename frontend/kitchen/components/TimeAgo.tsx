'use client';

export default function TimeAgo({ timestamp }: { timestamp: string }) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);

  let label = '';
  if (mins < 1) label = 'just now';
  else if (mins < 60) label = `${mins}m ago`;
  else label = `${hours}h ${mins % 60}m ago`;

  return (
    <span className="text-xs font-mono text-gray-500" title={new Date(timestamp).toLocaleString()}>
      {label}
    </span>
  );
}
