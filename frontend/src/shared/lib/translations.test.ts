import { describe, expect, it } from "vitest";
import {
  toMessage,
  translateAuditEventType,
  translateRole,
  translateStatus,
} from "@shared/lib/translations";

describe("translation helpers", () => {
  it("translates known enum-like values", () => {
    expect(translateRole("Operator")).toBe("Operador");
    expect(translateStatus("Open")).toBe("Em aberto");
    expect(translateStatus("Overdue")).toBe("Em atraso");
    expect(translateAuditEventType("DebtCalculated")).toBe("Divida calculada");
  });

  it("maps known api errors to localized messages", () => {
    expect(toMessage(new Error("Invalid credentials."))).toBe("Credenciais invalidas.");
    expect(toMessage(new Error("The calculation date cannot be in the past."))).toBe(
      "A data de calculo nao pode estar no passado.",
    );
    expect(toMessage(new Error("Request failed."))).toBe("Falha na requisicao.");
    expect(toMessage("unexpected")).toBe("Erro inesperado.");
  });
});
