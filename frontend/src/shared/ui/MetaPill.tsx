import type { ReactNode } from "react";

type MetaPillProps = {
  label: string;
  value: ReactNode;
};

export function MetaPill({ label, value }: MetaPillProps) {
  return (
    <article className="meta-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
