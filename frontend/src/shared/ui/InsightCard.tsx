import type { ReactNode } from "react";

type InsightCardProps = {
  label: string;
  value: ReactNode;
  description: string;
  tone?: "default" | "featured" | "accent" | "attention";
};

export function InsightCard({
  label,
  value,
  description,
  tone = "default",
}: InsightCardProps) {
  return (
    <article className={`insight-card insight-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{description}</p>
    </article>
  );
}
