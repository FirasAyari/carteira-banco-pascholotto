type FlowStepProps = {
  number: string;
  title: string;
  description: string;
  state: "done" | "active" | "waiting";
};

export function FlowStep({ number, title, description, state }: FlowStepProps) {
  return (
    <article className={`flow-step flow-step--${state}`}>
      <span className="flow-step-number">{number}</span>
      <div className="flow-step-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </article>
  );
}
