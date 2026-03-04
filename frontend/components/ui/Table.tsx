// ─── components/ui/Table.tsx ───────────────────────────────
import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}><table className="w-full text-sm bg-white border-collapse">{children}</table></div>;
}

export function Thead({ children }: { children: React.ReactNode }) { return <thead className="border-b border-gray-200 bg-gray-50">{children}</thead>; }
export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-5 py-3 text-left text-[10px] tracking-[1.8px] text-gray-600 uppercase font-medium whitespace-nowrap", className)}>{children}</th>;
}
export function Tbody({ children }: { children: React.ReactNode }) { return <tbody>{children}</tbody>; }
export function Tr({ children, className }: { children: React.ReactNode; className?: string }) { return <tr className={cn("border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-0", className)}>{children}</tr>; }
export function Td({ children, className }: { children: React.ReactNode; className?: string }) { return <td className={cn("px-5 py-3.5 whitespace-nowrap text-gray-800 text-[13px]", className)}>{children}</td>; }