import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ContractDetail } from "@entities/contract/types";
import { useAuth } from "@features/auth/hooks/use-auth";
import { getContract } from "@features/contracts/api/contracts-api";
import { formatCurrency, formatDate } from "@shared/lib/formatters";
import { isActionableInstallment, matchesAnyStatus, matchesStatus, pluralize } from "@shared/lib/domain";
import { toMessage } from "@shared/lib/translations";
import { ActionMenu } from "@shared/ui/ActionMenu";
import { InsightCard } from "@shared/ui/InsightCard";
import { MetaPill } from "@shared/ui/MetaPill";
import { StatusBadge } from "@shared/ui/StatusBadge";
import type { ActionMenuItem } from "@shared/types/action-menu-item";

export function ContractDetailPage() {
  const { session } = useAuth();
  const { contractId } = useParams();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [error, setError] = useState("");

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

  if (error) {
    return (
      <section className="page">
        <p className="error-message">{error}</p>
      </section>
    );
  }

  if (!contract) {
    return (
      <section className="page">
        <p>Carregando contrato...</p>
      </section>
    );
  }

  const overdueInstallments = contract.installments.filter((item) => matchesStatus(item.status, "overdue")).length;
  const actionableInstallments = contract.installments.filter((item) => isActionableInstallment(item.status)).length;
  const totalPaidAmount = contract.installments.reduce((total, item) => total + item.paidAmount, 0);
  const nextDueInstallment = [...contract.installments]
    .filter((item) => !matchesAnyStatus(item.status, ["paid", "settled", "cancelled"]))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))[0];

  const secondaryActions: ActionMenuItem[] = [
    {
      label: "Voltar para a carteira",
      description: "Retorna para a busca geral de contratos.",
      to: "/contracts",
    },
  ];

  if (contract.activeAgreementId) {
    secondaryActions.push({
      label: "Abrir acordo ativo",
      description: "Consulta parcelas, boletos e trilha de auditoria ja formalizados.",
      to: `/agreements/${contract.activeAgreementId}`,
    });
  }

  return (
    <section className="page">
      <div className="spotlight-card spotlight-card--contract">
        <div className="spotlight-main">
          <div className="spotlight-kicker-row">
            <p className="eyebrow">{contract.portfolio}</p>
            <span className={`hero-chip ${overdueInstallments > 0 ? "hero-chip--danger" : "hero-chip--accent"}`}>
              {overdueInstallments > 0
                ? `${overdueInstallments} ${pluralize(overdueInstallments, "parcela em atraso", "parcelas em atraso")}`
                : "Sem atraso critico"}
            </span>
          </div>

          <h2 className="spotlight-title">{contract.customerName}</h2>
          <p className="page-subtitle">
            Contrato {contract.contractNumber} - documento {contract.customerDocument}
          </p>

          <div className="meta-pill-row">
            <MetaPill label="Documento" value={contract.customerDocument} />
            <MetaPill
              label="Proximo vencimento"
              value={nextDueInstallment ? formatDate(nextDueInstallment.dueDate) : "Nenhuma parcela pendente"}
            />
            <MetaPill
              label="Acordo ativo"
              value={contract.activeAgreementId ? "Disponivel para consulta" : "Nenhum acordo ativo"}
            />
          </div>

          <div className="insight-grid">
            <InsightCard
              description="Base atual para abertura da negociacao"
              label="Saldo em aberto"
              tone="featured"
              value={formatCurrency(contract.openBalance)}
            />
            <InsightCard
              description={`${overdueInstallments} ${pluralize(overdueInstallments, "item em atraso", "itens em atraso")} para priorizacao`}
              label="Parcelas elegiveis"
              tone={overdueInstallments > 0 ? "attention" : "accent"}
              value={String(actionableInstallments)}
            />
            <InsightCard
              description="Historico financeiro ja compensado no contrato"
              label="Total ja pago"
              value={formatCurrency(totalPaidAmount)}
            />
            <InsightCard
              description="Leitura operacional do contrato no momento"
              label="Situacao atual"
              value={<StatusBadge value={contract.status} />}
            />
          </div>
        </div>

        <aside className="action-board">
          <span className="board-kicker">Proxima melhor acao</span>
          <h3>Levar este contrato para a mesa de negociacao</h3>
          <p>
            Abra o assistente guiado, revise a divida atualizada e transforme a analise em acordo com emissao de boletos.
          </p>
          <Link className="primary-button primary-button--block" to={`/contracts/${contract.id}/negotiate`}>
            Iniciar negociacao
          </Link>
          <ActionMenu items={secondaryActions} label="Mais acoes" />
        </aside>
      </div>

      <div className="surface surface--ledger">
        <div className="surface-head">
          <div>
            <h3>Extrato de parcelas</h3>
            <p className="section-copy">
              Leitura rapida do contrato para apoiar a conversa com o cliente e a decisao comercial.
            </p>
          </div>
          <span className="surface-counter">{actionableInstallments} parcelas negociaveis</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Vencimento</th>
              <th>Principal</th>
              <th>Pago</th>
              <th>Situacao</th>
            </tr>
          </thead>
          <tbody>
            {contract.installments.map((installment) => (
              <tr key={installment.id}>
                <td data-label="No">{installment.number}</td>
                <td data-label="Vencimento">{formatDate(installment.dueDate)}</td>
                <td data-label="Principal">{formatCurrency(installment.principalAmount)}</td>
                <td data-label="Pago">{formatCurrency(installment.paidAmount)}</td>
                <td data-label="Situacao">
                  <StatusBadge value={installment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
