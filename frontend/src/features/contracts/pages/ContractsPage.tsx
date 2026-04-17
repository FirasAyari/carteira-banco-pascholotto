import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { ContractSummary } from "@entities/contract/types";
import { useAuth } from "@features/auth/hooks/use-auth";
import { searchContracts } from "@features/contracts/api/contracts-api";
import { formatCurrency } from "@shared/lib/formatters";
import { toMessage } from "@shared/lib/translations";
import { StatCard } from "@shared/ui/StatCard";
import { BalanceStatIcon, ContractsStatIcon } from "@shared/ui/icons/StatIcons";

export function ContractsPage() {
  const { session } = useAuth();
  const [document, setDocument] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void runSearch();
  }, []);

  async function runSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await searchContracts(session!.accessToken, document, contractNumber);
      setContracts(response);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }

  const openBalance = contracts.reduce((total, item) => total + item.openBalance, 0);

  return (
    <section className="page">
      <header className="page-header page-header--search">
        <div className="page-header-copy">
          <span className="header-pill">Central da carteira</span>
          <div className="page-header-heading">
            <h2>Busque contratos e siga para a negociacao</h2>
            <p className="page-subtitle page-subtitle--search">
              Pesquise por CPF, CNPJ ou numero do contrato e avance para calculo da divida, proposta de acordo e emissao de boletos.
            </p>
          </div>
        </div>

        <div className="hero-sidecard">
          <span className="hero-sidecard-label">Fluxo disponivel</span>
          <strong>Consulta, memoria da divida e formalizacao em uma unica tela operacional.</strong>
          <div className="hero-sidecard-tags">
            <span>CPF ou CNPJ</span>
            <span>Numero do contrato</span>
            <span>Acordo com boleto</span>
          </div>
        </div>
      </header>

      <form className="search-form" onSubmit={runSearch}>
        <label>
          Documento do cliente
          <input
            onChange={(event) => setDocument(event.target.value)}
            placeholder="12345678901"
            value={document}
          />
        </label>

        <label>
          Numero do contrato
          <input
            onChange={(event) => setContractNumber(event.target.value)}
            placeholder="BP-2026-001"
            value={contractNumber}
          />
        </label>

        <button className="primary-button" type="submit">
          Buscar carteira
        </button>
      </form>

      {error ? <p className="error-message">{error}</p> : null}

      <div className="hero-stats">
        <StatCard icon={<ContractsStatIcon />} label="Contratos encontrados" value={String(contracts.length)} />
        <StatCard icon={<BalanceStatIcon />} label="Saldo em aberto" value={formatCurrency(openBalance)} />
      </div>

      <div className="surface">
        {isLoading ? (
          <p className="muted-copy">Carregando contratos...</p>
        ) : contracts.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum contrato foi encontrado com os filtros informados.</strong>
            <p>Tente outro numero de contrato ou documento do cliente para refazer a busca da carteira.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contrato</th>
                <th>Documento</th>
                <th>Saldo em aberto</th>
                <th>Parcelas</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td data-label="Cliente">{contract.customerName}</td>
                  <td data-label="Contrato">{contract.contractNumber}</td>
                  <td data-label="Documento">{contract.customerDocument}</td>
                  <td data-label="Saldo em aberto">{formatCurrency(contract.openBalance)}</td>
                  <td data-label="Parcelas">{contract.openInstallments}</td>
                  <td data-label="Acao">
                    <Link className="inline-link" to={`/contracts/${contract.id}`}>
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
