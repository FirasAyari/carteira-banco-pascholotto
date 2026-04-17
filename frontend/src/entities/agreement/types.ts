export type AgreementInstallmentPlan = {
  number: number;
  dueDate: string;
  amount: number;
  isDownPayment: boolean;
};

export type AgreementSimulation = {
  contractId: string;
  debtCalculationId: string;
  installmentCount: number;
  totalAmount: number;
  downPaymentAmount: number;
  financedAmount: number;
  firstDueDate: string;
  installments: AgreementInstallmentPlan[];
};

export type BoletoSummary = {
  agreementInstallmentId: string;
  documentNumber: string;
  lineDigitable: string;
  barcode: string;
  generatedAtUtc: string;
};

export type AuditEvent = {
  id: string;
  eventType: string;
  performedBy: string;
  createdAtUtc: string;
  payloadJson: string;
};

export type AgreementInstallment = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  status: string;
  boleto?: BoletoSummary | null;
};

export type AgreementDetail = {
  id: string;
  contractId: string;
  contractNumber: string;
  customerName: string;
  customerDocument: string;
  status: string;
  firstDueDate: string;
  installmentCount: number;
  downPaymentAmount: number;
  financedAmount: number;
  totalAmount: number;
  createdAtUtc: string;
  installments: AgreementInstallment[];
  auditTrail: AuditEvent[];
};
