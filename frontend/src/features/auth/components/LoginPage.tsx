import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/use-auth";
import { toMessage } from "@shared/lib/translations";

export function LoginPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("operador");
  const [password, setPassword] = useState("Pascholotto123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session) {
    return <Navigate replace to="/contracts" />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(username, password);
      navigate("/contracts");
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-shell">
        <section className="login-panel login-panel--brand">
          <p className="eyebrow">Plataforma de cobranca Paschoalotto</p>
          <h1>Estruture acordos com mais clareza, melhor ritmo e mais confianca para o operador.</h1>
          <p className="panel-copy">
            Um ambiente interno refinado para recalculo da divida, desenho da negociacao, confirmacao do acordo e entrega do boleto.
          </p>

          <div className="feature-list">
            <article className="feature-item">
              <span>01</span>
              <strong>Memoria da divida</strong>
              <p>Parcelas em aberto, multa e juros permanecem visiveis antes de qualquer decisao comercial ser confirmada.</p>
            </article>

            <article className="feature-item">
              <span>02</span>
              <strong>Negociacao guiada</strong>
              <p>Os operadores visualizam cenarios de parcelamento e formalizam a melhor proposta sem sair do fluxo.</p>
            </article>

            <article className="feature-item">
              <span>03</span>
              <strong>Geracao de boleto em PDF</strong>
              <p>Cada parcela negociada ja sai do fluxo com o boleto em PDF pronto para envio e acompanhamento.</p>
            </article>
          </div>
        </section>

        <section className="login-panel login-panel--form">
          <p className="eyebrow">Acesso do operador</p>
          <h2>Acesse a central de operacoes</h2>
          <p className="panel-copy">
            Entre para consultar contratos, recalcular dividas, configurar acordos e emitir boletos.
          </p>

          <form className="panel-form" onSubmit={handleSubmit}>
            <label>
              Usuario
              <input onChange={(event) => setUsername(event.target.value)} value={username} />
            </label>

            <label>
              Senha
              <input
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            {error ? <p className="error-message">{error}</p> : null}

            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Entrando..." : "Acessar ambiente"}
            </button>
          </form>

          <div className="login-hint">
            <span>Acesso padrao</span>
            <strong>operador / Pascholotto123!</strong>
          </div>
        </section>
      </div>
    </div>
  );
}
