import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
};

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <article className="stat-card">
      {icon ? <span className="stat-card-icon">{icon}</span> : null}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
