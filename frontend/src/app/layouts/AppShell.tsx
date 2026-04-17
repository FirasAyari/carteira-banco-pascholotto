import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/use-auth";
import logoPaschoalotto from "@shared/assets/logo-paschoalotto.webp";
import { getInitials } from "@shared/lib/domain";
import { translateRole } from "@shared/lib/translations";

export function AppShell() {
  const { session, signOut } = useAuth();

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-brand-lockup">
              <p className="sidebar-kicker">Central digital Paschoalotto</p>
              <img alt="Paschoalotto" className="sidebar-logo" src={logoPaschoalotto} />
              <span className="sidebar-brand-meta">Operacao Banco Pascholotto</span>
            </div>
          </div>

          <div className="sidebar-hero">
            <span className="sidebar-chip">Espaco do operador</span>
            <h2>Cobranca, negociacao e emissao de boletos em um fluxo unico e claro.</h2>
            <p className="sidebar-copy">
              Feito para times internos de cobranca que precisam de velocidade, rastreabilidade e melhor conducao do atendimento.
            </p>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              className={({ isActive }) => `sidebar-link${isActive ? " sidebar-link--active" : ""}`}
              to="/contracts"
            >
              <span>Contratos</span>
              <small>Espaco da carteira</small>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-head">
            <span className="sidebar-avatar">{getInitials(session.user.displayName)}</span>
            <div>
              <strong>{session.user.displayName}</strong>
              <span>{translateRole(session.user.role)}</span>
            </div>
          </div>
          <span className="sidebar-meta">Sessao autenticada de operador interno</span>
          <button className="sidebar-signout" onClick={signOut} type="button">
            Encerrar sessao
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
