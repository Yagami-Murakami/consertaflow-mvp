import { statusLabel, statusTone } from "@/lib/consertaflow";
import { cn } from "@/lib/utils";

const toneClass: Record<string, string> = {
  info: "bg-accent/10 text-accent border-accent/25",
  ok: "bg-success/10 text-success border-success/25",
  warn: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
};

export function StatusBadge({ status, className }: { status: string | null; className?: string }) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClass[tone] ?? toneClass["info"],
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}