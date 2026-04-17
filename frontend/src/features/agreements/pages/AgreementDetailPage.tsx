import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AgreementDetail } from "@entities/agreement/types";
import { useAuth } from "@features/auth/hooks/use-auth";
import { downloadBoleto, getAgreement } from "@features/agreements/api/agreements-api";
import { formatCurrency, formatDate, formatDateTime, prettyJson } from "@shared/lib/formatters";
import { pluralize } from "@shared/lib/domain";
import { toMessage, translateAuditEventType } from "@shared/lib/translations";
import { ActionMenu } from "@shared/ui/ActionMenu";
import { InsightCard } from "@shared/ui/InsightCard";
import { MetaPill } from "@shared/ui/MetaPill";
import { StatusBadge } from "@shared/ui/StatusBadge";
import type { ActionMenuItem } from "@shared/types/action-menu-item";

export function AgreementDetailPage() {
  const { session } = useAuth();
  const { agreementId } = useParams();
  const [agreement, setAgreement] = useState<AgreementDetail | null>(null);
  const [error, setError] = useState("");
  const [downloadingInstallment, setDownloadingInstallment] = useState("");

  useEffect(() => {
    if (!agreementId) {
      return;
    }

    void loadAgreement(agreementId);
  }, [agreementId]);

  async function loadAgreement(nextAgreementId: string) {
    setError("");

    try {
      const response = await getAgreement(session!.accessToken, nextAgreementId);
      setAgreement(response);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    }
  }

  async function handleDownload(nextAgreementId: string, installmentId: string) {
    setDownloadingInstallment(installmentId);
    setError("");

    try {
      await downloadBoleto(session!.accessToken, nextAgreementId, installmentId);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setDownloadingInstallment("");
    }
  }

  if (error) {
    return (
      <section className="page">
        <p className="error-message">{error}</p>
      </section>
    );
  }

  if (!agreement) {
    return (
      <section className="page">
        <p>Carregando acordo...</p>
      </section>
    );
  }

  const firstDownloadableInstallment = agreement.installments.find((item) => item.boleto);
  const boletosReady = agreement.installments.filter((item) => item.boleto).length;

  const agreementActions: ActionMenuItem[] = [
    {
      label: "Voltar ao contrato",
      description: "Retorna para a visao operacional do contrato de origem.",
      to: `/contracts/${agreement.contractId}`,
    },
    {
      label: "Voltar a carteira",
      description: "Retorna para a busca geral de contratos.",
      to: "/contracts",
    },
  ];

  if (firstDownloadableInstallment) {
    agreementActions.unshift({
      label: "Baixar primeiro boleto",
      description: "Faz o download imediato do primeiro boleto disponivel neste acordo.",
      onSelect: () => {
        void handleDownload(agreement.id, firstDownloadableInstallment.id);
      },
    });
  }

  return (
    <section className="page">
      <div className="spotlight-card spotlight-card--agreement">
        <div className="spotlight-main">
          <div className="spotlight-kicker-row">
            <p className="eyebrow">Dossie do acordo</p>
            <StatusBadge value={agreement.status} />
          </div>
          <h2 className="spotlight-title">{agreement.customerName}</h2>
          <p className="page-subtitle">
            Contrato {agreement.contractNumber} - acordo {agreement.id}
          </p>
          <div className="meta-pill-row">
            <MetaPill label="Documento" value={agreement.customerDocument} />
            <MetaPill label="Primeiro vencimento" value={formatDate(agreement.firstDueDate)} />
            <MetaPill label="Criado em" value={formatDateTime(agreement.createdAtUtc)} />
          </div>
          <div className="insight-grid">
            <InsightCard
              description="Valor consolidado formalizado para o cliente"
              label="Total do acordo"
              tone="featured"
              value={formatCurrency(agreement.totalAmount)}
            />
            <InsightCard
              description="Parcela inicial prevista na formalizacao"
              label="Entrada"
              tone="accent"
              value={formatCurrency(agreement.downPaymentAmount)}
            />
            <InsightCard
              description="Montante dividido nas parcelas futuras"
              label="Valor financiado"
              value={formatCurrency(agreement.financedAmount)}
            />
            <InsightCard
              description={`${boletosReady} ${pluralize(boletosReady, "boleto pronto", "boletos prontos")} para envio`}
              label="Parcelas"
              value={String(agreement.installmentCount)}
            />
          </div>
        </div>

        <aside className="action-board">
          <span className="board-kicker">Atalhos do acordo</span>
          <h3>{firstDownloadableInstallment ? "Baixe o primeiro boleto agora" : "Revise o contrato de origem"}</h3>
          <p>
            {firstDownloadableInstallment
              ? "Use o atalho principal para gerar rapidamente o primeiro documento e siga com os demais downloads abaixo."
              : "Nao ha boleto disponivel para atalho imediato. Volte ao contrato e acompanhe a formalizacao."}
          </p>
          {firstDownloadableInstallment ? (
            <button
              className="primary-button primary-button--block"
              onClick={() => void handleDownload(agreement.id, firstDownloadableInstallment.id)}
              type="button"
            >
              {downloadingInstallment === firstDownloadableInstallment.id ? "Preparando..." : "Baixar primeiro boleto"}
            </button>
          ) : (
            <Link className="primary-button primary-button--block" to={`/contracts/${agreement.contractId}`}>
              Voltar ao contrato
            </Link>
          )}
          <ActionMenu items={agreementActions} label="Mais acoes do acordo" />
        </aside>
      </div>

      <div className="surface surface--ledger">
        <div className="surface-head">
          <div>
            <h3>Parcelas e boletos</h3>
            <p className="section-copy">Acompanhe vencimentos, valores e documentos disponiveis para download.</p>
          </div>
          <span className="surface-counter">{boletosReady} boletos prontos</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Linha digitavel</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {agreement.installments.map((installment) => (
              <tr key={installment.id}>
                <td data-label="No">{installment.number}</td>
                <td data-label="Vencimento">{formatDate(installment.dueDate)}</td>
                <td data-label="Valor">{formatCurrency(installment.amount)}</td>
                <td data-label="Linha digitavel">{installment.boleto?.lineDigitable ?? "-"}</td>
                <td data-label="Acao">
                  {installment.boleto ? (
                    <button
                      className="ghost-button"
                      onClick={() => void handleDownload(agreement.id, installment.id)}
                      type="button"
                    >
                      {downloadingInstallment === installment.id ? "Preparando..." : "Baixar boleto em PDF"}
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="surface surface--audit">
        <div className="surface-head">
          <div>
            <h3>Trilha de auditoria</h3>
            <p className="section-copy">Eventos relevantes da operacao registrados em ordem cronologica inversa.</p>
          </div>
          <span className="surface-counter">{agreement.auditTrail.length} eventos</span>
        </div>
        <div className="audit-list">
          {agreement.auditTrail.map((event) => (
            <article className="audit-card" key={event.id}>
              <div className="audit-head">
                <strong>{translateAuditEventType(event.eventType)}</strong>
                <span>{event.performedBy}</span>
              </div>
              <span>{formatDateTime(event.createdAtUtc)}</span>
              <pre>{prettyJson(event.payloadJson)}</pre>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
