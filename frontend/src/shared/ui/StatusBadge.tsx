import { translateStatus } from "@shared/lib/translations";

type StatusBadgeProps = {
  value: string;
  tone?: "default" | "accent" | "neutral" | "danger";
};

export function StatusBadge({ value, tone }: StatusBadgeProps) {
  const normalized = value.trim().toLowerCase();
  const resolvedTone =
    tone ??
    (normalized.includes("overdue")
      ? "danger"
      : normalized.includes("open")
        ? "accent"
        : normalized.includes("active")
          ? "default"
          : "neutral");

  return <span className={`status-badge status-badge--${resolvedTone}`}>{translateStatus(value)}</span>;
}
