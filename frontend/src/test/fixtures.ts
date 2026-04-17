import type { AgreementDetail, AgreementSimulation } from "@entities/agreement/types";
import type { SessionState } from "@entities/auth/types";
import type { ContractDetail, ContractSummary, DebtCalculation } from "@entities/contract/types";

export const sessionFixture: SessionState = {
  accessToken: "token-123",
  expiresAtUtc: "2026-04-18T12:00:00.000Z",
  user: {
    id: "user-1",
    username: "operador",
    displayName: "Operador Pascholotto",
    role: "Operator",
  },
};

export const contractSummaryFixture: ContractSummary = {
  id: "contract-1",
  contractNumber: "BP-2026-001",
  customerName: "Marina Costa",
  customerDocument: "12345678901",
  portfolio: "Banco Pascholotto",
  status: "Active",
  openBalance: 1500,
  openInstallments: 3,
};

export const secondContractSummaryFixture: ContractSummary = {
  ...contractSummaryFixture,
  id: "contract-2",
  contractNumber: "BP-2026-002",
  customerName: "Carlos Souza",
  customerDocument: "98765432100",
  openBalance: 1440,
  openInstallments: 2,
};

export const contractDetailFixture: ContractDetail = {
  id: "contract-1",
  contractNumber: "BP-2026-001",
  customerName: "Marina Costa",
  customerDocument: "12345678901",
  portfolio: "Banco Pascholotto",
  status: "Active",
  openBalance: 1500,
  activeAgreementId: "agreement-1",
  installments: [
    {
      id: "inst-1",
      number: 1,
      dueDate: "2026-04-10",
      principalAmount: 500,
      paidAmount: 0,
      status: "Overdue",
    },
    {
      id: "inst-2",
      number: 2,
      dueDate: "2026-05-10",
      principalAmount: 500,
      paidAmount: 0,
      status: "Open",
    },
    {
      id: "inst-3",
      number: 3,
      dueDate: "2026-06-10",
      principalAmount: 500,
      paidAmount: 200,
      status: "Open",
    },
  ],
};

export const debtCalculationFixture: DebtCalculation = {
  id: "debt-1",
  contractId: "contract-1",
  calculationDate: "2026-04-17",
  totalPrincipal: 1300,
  totalPenalty: 26,
  totalInterest: 14,
  totalAmount: 1340,
  items: [
    {
      installmentId: "inst-1",
      installmentNumber: 1,
      dueDate: "2026-04-10",
      daysOverdue: 7,
      principalAmount: 500,
      penaltyAmount: 10,
      interestAmount: 4,
      totalAmount: 514,
    },
    {
      installmentId: "inst-2",
      installmentNumber: 2,
      dueDate: "2026-05-10",
      daysOverdue: 0,
      principalAmount: 500,
      penaltyAmount: 10,
      interestAmount: 5,
      totalAmount: 515,
    },
    {
      installmentId: "inst-3",
      installmentNumber: 3,
      dueDate: "2026-06-10",
      daysOverdue: 0,
      principalAmount: 300,
      penaltyAmount: 6,
      interestAmount: 5,
      totalAmount: 311,
    },
  ],
};

export const agreementSimulationFixture: AgreementSimulation = {
  contractId: "contract-1",
  debtCalculationId: "debt-1",
  installmentCount: 4,
  totalAmount: 1340,
  downPaymentAmount: 100,
  financedAmount: 1240,
  firstDueDate: "2026-04-24",
  installments: [
    {
      number: 1,
      dueDate: "2026-04-24",
      amount: 100,
      isDownPayment: true,
    },
    {
      number: 2,
      dueDate: "2026-05-24",
      amount: 413.33,
      isDownPayment: false,
    },
    {
      number: 3,
      dueDate: "2026-06-24",
      amount: 413.33,
      isDownPayment: false,
    },
    {
      number: 4,
      dueDate: "2026-07-24",
      amount: 413.34,
      isDownPayment: false,
    },
  ],
};

export const agreementDetailFixture: AgreementDetail = {
  id: "agreement-1",
  contractId: "contract-1",
  contractNumber: "BP-2026-001",
  customerName: "Marina Costa",
  customerDocument: "12345678901",
  status: "Active",
  firstDueDate: "2026-04-24",
  installmentCount: 4,
  downPaymentAmount: 100,
  financedAmount: 1240,
  totalAmount: 1340,
  createdAtUtc: "2026-04-17T10:30:00.000Z",
  installments: [
    {
      id: "agr-inst-1",
      number: 1,
      dueDate: "2026-04-24",
      amount: 100,
      status: "Open",
      boleto: {
        agreementInstallmentId: "agr-inst-1",
        documentNumber: "BOL-BP-2026-001-01",
        lineDigitable: "12345.67890 12345.678901 12345.678901 1 2345678901",
        barcode: "12345678901234567890123456789012345678901234",
        generatedAtUtc: "2026-04-17T10:31:00.000Z",
      },
    },
    {
      id: "agr-inst-2",
      number: 2,
      dueDate: "2026-05-24",
      amount: 413.33,
      status: "Open",
      boleto: null,
    },
  ],
  auditTrail: [
    {
      id: "audit-1",
      eventType: "AgreementCreated",
      performedBy: "Operador Pascholotto",
      createdAtUtc: "2026-04-17T10:31:00.000Z",
      payloadJson: "{\"InstallmentCount\":4,\"TotalAmount\":1340,\"Status\":\"Active\"}",
    },
  ],
};
