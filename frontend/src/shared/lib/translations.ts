export function translateRole(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "operator") {
    return "Operador";
  }

  return value;
}

export function translateStatus(value: string) {
  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case "open":
      return "Em aberto";
    case "overdue":
      return "Em atraso";
    case "active":
      return "Ativo";
    case "paid":
      return "Pago";
    case "settled":
      return "Liquidado";
    case "cancelled":
      return "Cancelado";
    case "draft":
      return "Rascunho";
    default:
      return value;
  }
}

export function translateAuditEventType(value: string) {
  switch (value) {
    case "DebtCalculated":
      return "Divida calculada";
    case "AgreementCreated":
      return "Acordo criado";
    case "BoletosGenerated":
      return "Boletos gerados";
    default:
      return value;
  }
}

export function translateApiMessage(message: string) {
  const knownMessages: Record<string, string> = {
    "The contract has no open installments to calculate.": "O contrato nao possui parcelas em aberto para calculo.",
    "Agreement total amount must be greater than zero.": "O valor total do acordo deve ser maior que zero.",
    "Agreement installment count must be between 1 and 12.": "A quantidade de parcelas do acordo deve estar entre 1 e 12.",
    "Down payment amount cannot be negative.": "O valor de entrada nao pode ser negativo.",
    "Down payment amount must be lower than the total agreement amount.": "O valor de entrada deve ser menor que o valor total do acordo.",
    "A down payment requires at least 2 installments.": "Uma entrada exige pelo menos 2 parcelas.",
    "The agreement must contain at least one financed installment.": "O acordo deve conter ao menos uma parcela financiada.",
    "Contract was not found.": "Contrato nao encontrado.",
    "Debt calculation was not found for this contract.": "O calculo da divida nao foi encontrado para este contrato.",
    "Invalid credentials.": "Credenciais invalidas.",
    "Agreement was not found.": "Acordo nao encontrado.",
    "Boleto PDF was not found.": "O boleto em PDF nao foi encontrado.",
    "The contract already has an active agreement.": "O contrato ja possui um acordo ativo.",
    "The calculation date cannot be in the past.": "A data de calculo nao pode estar no passado.",
    "The first due date must be between D+7 and D+30.": "O primeiro vencimento deve estar entre D+7 e D+30.",
    "Request failed.": "Falha na requisicao.",
    "Unable to download boleto PDF.": "Nao foi possivel baixar o boleto em PDF.",
  };

  return knownMessages[message] ?? message;
}

export function toMessage(caughtError: unknown) {
  return caughtError instanceof Error ? translateApiMessage(caughtError.message) : "Erro inesperado.";
}

export function localizePayloadKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(localizePayloadKeys);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
      translatePayloadKey(key),
      localizePayloadKeys(entryValue),
    ]);

    return Object.fromEntries(entries);
  }

  if (typeof value === "string") {
    return translateStatus(value);
  }

  return value;
}

function translatePayloadKey(value: string) {
  const knownKeys: Record<string, string> = {
    InstallmentCount: "QuantidadeParcelas",
    DownPaymentAmount: "ValorEntrada",
    FinancedAmount: "ValorFinanciado",
    TotalAmount: "ValorTotal",
    FirstDueDate: "PrimeiroVencimento",
    Count: "Quantidade",
    TotalPrincipal: "TotalPrincipal",
    TotalPenalty: "TotalMulta",
    TotalInterest: "TotalJuros",
    CalculationDate: "DataCalculo",
  };

  return knownKeys[value] ?? value;
}
