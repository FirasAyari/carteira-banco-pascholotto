import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { AgreementSimulation } from "@entities/agreement/types";
import type { ContractDetail, DebtCalculation } from "@entities/contract/types";
import { useAuth } from "@features/auth/hooks/use-auth";
import { createAgreement, simulateAgreement } from "@features/agreements/api/agreements-api";
import { calculateDebt, getContract } from "@features/contracts/api/contracts-api";
import {
  defaultFirstDueDate,
  getMaxFirstDueDate,
  getMinFirstDueDate,
  getTodayDate,
  isActionableInstallment,
  isDateAfter,
  isDateBefore,
} from "@shared/lib/domain";
import { formatCurrency, formatDate } from "@shared/lib/formatters";
import { toMessage } from "@shared/lib/translations";
import { FlowStep } from "@shared/ui/FlowStep";
import { MetaPill } from "@shared/ui/MetaPill";
import { StatCard } from "@shared/ui/StatCard";
import { StatusBadge } from "@shared/ui/StatusBadge";

export function NegotiationPage() {
  const calculationDateMin = getTodayDate();
  const firstDueDateMin = getMinFirstDueDate();
  const firstDueDateMax = getMaxFirstDueDate();
  const calculationDatePastMessage = "A data de calculo nao pode estar no passado.";
  const firstDueDateRangeMessage = "O primeiro vencimento deve estar entre D+7 e D+30.";
  const { session } = useAuth();
  const navigate = useNavigate();
  const { contractId = "" } = useParams();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [debt, setDebt] = useState<DebtCalculation | null>(null);
  const [simulation, setSimulation] = useState<AgreementSimulation | null>(null);
  const [calculationDate, setCalculationDate] = useState("");
  const [installmentCount, setInstallmentCount] = useState(4);
  const [downPaymentAmount, setDownPaymentAmount] = useState("0");
  const [firstDueDate, setFirstDueDate] = useState(defaultFirstDueDate());
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    if (!contractId) {
      return;
    }

    void loadContract(contractId);
  }, [contractId]);

  async function loadContract(nextContractId: string) {
    setError("");

    try {
      const response = await getContract(session!.accessToken, nextContractId);
      setContract(response);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    }
  }

  async function handleCalculate() {
    if (calculationDate && isDateBefore(calculationDate, calculationDateMin)) {
      setError(calculationDatePastMessage);
      return;
    }

    setBusyAction("calculate");
    setError("");

    try {
      const response = await calculateDebt(session!.accessToken, contractId, calculationDate);
      setDebt(response);
      setSimulation(null);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setBusyAction("");
    }
  }

  async function handleSimulate() {
    if (!debt) {
      setError("Gere o calculo da divida primeiro.");
      return;
    }

    if (isDateBefore(firstDueDate, firstDueDateMin) || isDateAfter(firstDueDate, firstDueDateMax)) {
      setError(firstDueDateRangeMessage);
      return;
    }

    setBusyAction("simulate");
    setError("");

    try {
      const response = await simulateAgreement(session!.accessToken, contractId, {
        debtCalculationId: debt.id,
        installmentCount,
        downPaymentAmount: Number(downPaymentAmount || 0),
        firstDueDate,
      });
      setSimulation(response);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setBusyAction("");
    }
  }

  async function handleCreate() {
    if (!debt) {
      setError("Gere o calculo da divida primeiro.");
      return;
    }

    if (isDateBefore(firstDueDate, firstDueDateMin) || isDateAfter(firstDueDate, firstDueDateMax)) {
      setError(firstDueDateRangeMessage);
      return;
    }

    setBusyAction("create");
    setError("");

    try {
      const agreement = await createAgreement(session!.accessToken, contractId, {
        debtCalculationId: debt.id,
        installmentCount,
        downPaymentAmount: Number(downPaymentAmount || 0),
        firstDueDate,
      });
      navigate(`/agreements/${agreement.id}`);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setBusyAction("");
    }
  }

  const currentStep = simulation ? 3 : debt ? 2 : 1;
  const actionableInstallments = contract?.installments.filter((item) => isActionableInstallment(item.status)).length ?? 0;
  const canStructureAgreement = Boolean(debt);
  const workflowRules = ["1 a 12 parcelas", "Entrada opcional", "Primeiro vencimento entre D+7 e D+30"];

  function clearInlineDateError(message: string) {
    setError((currentError) => (currentError === message ? "" : currentError));
  }

  function handleCalculationDateChange(nextValue: string) {
    if (!nextValue) {
      clearInlineDateError(calculationDatePastMessage);
      setCalculationDate("");
      return;
    }

    if (isDateBefore(nextValue, calculationDateMin)) {
      setError(calculationDatePastMessage);
      return;
    }

    clearInlineDateError(calculationDatePastMessage);
    setCalculationDate(nextValue);
  }

  function handleFirstDueDateChange(nextValue: string) {
    if (!nextValue) {
      setError(firstDueDateRangeMessage);
      return;
    }

    if (isDateBefore(nextValue, firstDueDateMin) || isDateAfter(nextValue, firstDueDateMax)) {
      setError(firstDueDateRangeMessage);
      return;
    }

    clearInlineDateError(firstDueDateRangeMessage);
    setFirstDueDate(nextValue);
  }

  return (
    <section className="page">
      <div className="spotlight-card spotlight-card--workflow">
        <div className="spotlight-main">
          <div className="spotlight-kicker-row">
            <p className="eyebrow">Assistente de negociacao</p>
            {contract ? <span className="hero-chip hero-chip--soft">{contract.contractNumber}</span> : null}
            <span className="hero-chip hero-chip--accent">3 etapas guiadas</span>
          </div>

          <h2 className="spotlight-title">
            {contract ? `Monte o acordo de ${contract.customerName}` : "Carregando contrato..."}
          </h2>
          <p className="page-subtitle">
            Recalcule a divida, ajuste as condicoes comerciais e finalize a proposta com conferencia completa antes da emissao.
          </p>

          {contract ? (
            <div className="meta-pill-row meta-pill-row--workflow">
              <MetaPill label="Documento" value={contract.customerDocument} />
              <MetaPill label="Saldo em aberto" value={formatCurrency(contract.openBalance)} />
              <MetaPill label="Parcelas elegiveis" value={String(actionableInstallments)} />
              <MetaPill label="Janela do 1o vencimento" value="D+7 a D+30" />
            </div>
          ) : null}
        </div>

        <aside className="action-board action-board--workflow">
          <span className="board-kicker">Ritmo da jornada</span>
          <div className="workflow-rail">
            <FlowStep
              description="Atualize principal, multa e juros."
              number="01"
              state={currentStep === 1 ? "active" : currentStep > 1 ? "done" : "waiting"}
              title="Calcular divida"
            />
            <FlowStep
              description="Monte a proposta comercial."
              number="02"
              state={currentStep === 2 ? "active" : currentStep > 2 ? "done" : "waiting"}
              title="Estruturar acordo"
            />
            <FlowStep
              description="Validar o parcelamento final."
              number="03"
              state={currentStep === 3 ? "active" : "waiting"}
              title="Revisar simulacao"
            />
          </div>
          <div className="workflow-note">
            <strong>Regras da carteira</strong>
            <div className="workflow-rule-strip">
              {workflowRules.map((rule) => (
                <span className="workflow-rule-chip" key={rule}>
                  {rule}
                </span>
              ))}
            </div>
          </div>
          <Link className="ghost-button ghost-button--board" to={`/contracts/${contractId}`}>
            Voltar ao contrato
          </Link>
        </aside>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <div className="grid-two grid-two--negotiation">
        <div
          className={`surface stack-gap step-panel${currentStep === 1 ? " step-panel--active" : currentStep > 1 ? " step-panel--done" : ""}`}
        >
          <div className="step-heading">
            <span className="step-number">01</span>
            <div>
              <h3>Calculo da divida</h3>
              <p className="section-copy">
                Defina a data-base para o recalculo de multa e juros sobre as parcelas em aberto.
              </p>
            </div>
          </div>

          <div className="step-context-row">
            <span className={`step-state-chip ${debt ? "step-state-chip--done" : "step-state-chip--active"}`}>
              {debt ? "Memoria atualizada" : "Pronto para recalcular"}
            </span>
            <span className="step-inline-note">Juros simples de 1% a.m. e multa de 2% sobre parcelas vencidas.</span>
          </div>

          <label className="form-field-card form-field-card--full">
            Data de calculo
            <span className="field-note">Use a data da conversa para congelar a memoria financeira antes da proposta.</span>
            <input
              min={calculationDateMin}
              onChange={(event) => handleCalculationDateChange(event.target.value)}
              type="date"
              value={calculationDate}
            />
          </label>

          <button className="primary-button primary-button--block" onClick={handleCalculate} type="button">
            {busyAction === "calculate" ? "Recalculando..." : "Recalcular divida"}
          </button>

          {debt ? (
            <div className="kpi-breakdown-grid">
              <article className="kpi-breakdown-card kpi-breakdown-card--featured">
                <span>Total consolidado</span>
                <strong>{formatCurrency(debt.totalAmount)}</strong>
                <p>Saldo pronto para seguir para simulacao e formalizacao.</p>
              </article>
              <article className="kpi-breakdown-card">
                <span>Principal</span>
                <strong>{formatCurrency(debt.totalPrincipal)}</strong>
              </article>
              <article className="kpi-breakdown-card">
                <span>Multa</span>
                <strong>{formatCurrency(debt.totalPenalty)}</strong>
              </article>
              <article className="kpi-breakdown-card">
                <span>Juros</span>
                <strong>{formatCurrency(debt.totalInterest)}</strong>
              </article>
            </div>
          ) : (
            <div className="inline-guidance-card">
              <strong>O calculo vai abrir a memoria detalhada da divida.</strong>
              <span>Depois dessa etapa, a simulacao do acordo fica liberada com principal, multa e juros separados.</span>
            </div>
          )}
        </div>

        <div
          className={`surface stack-gap step-panel${currentStep === 2 ? " step-panel--active" : currentStep > 2 ? " step-panel--done" : ""}`}
        >
          <div className="step-heading">
            <span className="step-number">02</span>
            <div>
              <h3>Condicoes do acordo</h3>
              <p className="section-copy">
                Defina quantidade de parcelas, entrada e primeiro vencimento antes de visualizar a proposta.
              </p>
            </div>
          </div>

          <div className="step-context-row">
            <span className={`step-state-chip ${canStructureAgreement ? "step-state-chip--done" : "step-state-chip--locked"}`}>
              {canStructureAgreement ? "Etapa liberada" : "Aguardando calculo"}
            </span>
            <span className="step-inline-note">A ultima parcela absorve o ajuste de arredondamento automaticamente.</span>
          </div>

          <div className="workflow-rule-strip workflow-rule-strip--light">
            {workflowRules.map((rule) => (
              <span className="workflow-rule-chip workflow-rule-chip--light" key={rule}>
                {rule}
              </span>
            ))}
          </div>

          <div className="form-grid form-grid--agreement">
            <label className="form-field-card">
              Quantidade de parcelas
              <span className="field-note">Escolha entre 1 e 12 parcelas para distribuir o saldo atualizado.</span>
              <input
                max={12}
                min={1}
                onChange={(event) => setInstallmentCount(Number(event.target.value))}
                type="number"
                value={installmentCount}
              />
            </label>

            <label className="form-field-card">
              Valor de entrada
              <span className="field-note">Entrada opcional para reduzir o valor financiado do acordo.</span>
              <input
                inputMode="decimal"
                onChange={(event) => setDownPaymentAmount(event.target.value)}
                value={downPaymentAmount}
              />
            </label>

            <label className="form-field-card form-field-card--full">
              Primeiro vencimento
              <span className="field-note">A primeira parcela deve respeitar a janela operacional da carteira.</span>
              <input
                max={firstDueDateMax}
                min={firstDueDateMin}
                onChange={(event) => handleFirstDueDateChange(event.target.value)}
                type="date"
                value={firstDueDate}
              />
            </label>
          </div>

          <div className="decision-grid decision-grid--weighted">
            <button
              className="secondary-button secondary-button--block"
              disabled={!canStructureAgreement}
              onClick={handleSimulate}
              type="button"
            >
              {busyAction === "simulate" ? "Simulando..." : "Simular acordo"}
            </button>

            <button
              className="primary-button primary-button--block"
              disabled={!canStructureAgreement}
              onClick={handleCreate}
              type="button"
            >
              {busyAction === "create" ? "Formalizando..." : "Formalizar acordo"}
            </button>
          </div>

          {simulation ? (
            <div className="inline-guidance-card inline-guidance-card--success">
              <strong>Simulacao pronta para conferencia.</strong>
              <span>Revise o parcelamento abaixo e formalize quando o cliente aprovar as condicoes.</span>
            </div>
          ) : (
            <div className="inline-guidance-card">
              <strong>Monte a proposta depois do calculo.</strong>
              <span>Assim que a memoria da divida for recalculada, a simulacao e a formalizacao ficam disponiveis.</span>
            </div>
          )}
        </div>
      </div>

      {debt ? (
        <div className="surface surface--ledger">
          <div className="surface-head">
            <div>
              <h3>Composicao da divida calculada</h3>
              <p className="section-copy">
                Cada parcela em aberto mostra principal, multa acumulada, juros acumulados e o total resultante.
              </p>
            </div>
            <span className="surface-counter">{debt.items.length} parcelas processadas</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Parcela</th>
                <th>Vencimento</th>
                <th>Dias em atraso</th>
                <th>Principal</th>
                <th>Multa</th>
                <th>Juros</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {debt.items.map((item) => (
                <tr key={item.installmentId}>
                  <td data-label="Parcela">{item.installmentNumber}</td>
                  <td data-label="Vencimento">{formatDate(item.dueDate)}</td>
                  <td data-label="Dias em atraso">{item.daysOverdue}</td>
                  <td data-label="Principal">{formatCurrency(item.principalAmount)}</td>
                  <td data-label="Multa">{formatCurrency(item.penaltyAmount)}</td>
                  <td data-label="Juros">{formatCurrency(item.interestAmount)}</td>
                  <td data-label="Total">{formatCurrency(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {simulation ? (
        <div className="surface surface--ledger step-panel step-panel--active">
          <div className="surface-head">
            <div>
              <h3>Resultado da simulacao</h3>
              <p className="section-copy">Revise o parcelamento antes de criar o acordo e gerar os boletos.</p>
            </div>
            <span className="surface-counter">Etapa 03 ativa</span>
          </div>
          <div className="hero-stats">
            <StatCard label="Total do acordo" value={formatCurrency(simulation.totalAmount)} />
            <StatCard label="Entrada" value={formatCurrency(simulation.downPaymentAmount)} />
            <StatCard label="Financiado" value={formatCurrency(simulation.financedAmount)} />
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Parcela</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {simulation.installments.map((item) => (
                <tr key={`${item.number}-${item.dueDate}`}>
                  <td data-label="Parcela">{item.number}</td>
                  <td data-label="Vencimento">{formatDate(item.dueDate)}</td>
                  <td data-label="Valor">{formatCurrency(item.amount)}</td>
                  <td data-label="Tipo">
                    <StatusBadge
                      tone={item.isDownPayment ? "accent" : "neutral"}
                      value={item.isDownPayment ? "Entrada" : "Parcela"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
