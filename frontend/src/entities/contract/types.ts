export type ContractSummary = {
  id: string;
  contractNumber: string;
  customerName: string;
  customerDocument: string;
  portfolio: string;
  status: string;
  openBalance: number;
  openInstallments: number;
};

export type Installment = {
  id: string;
  number: number;
  dueDate: string;
  principalAmount: number;
  paidAmount: number;
  status: string;
};

export type ContractDetail = {
  id: string;
  contractNumber: string;
  customerName: string;
  customerDocument: string;
  portfolio: string;
  status: string;
  openBalance: number;
  activeAgreementId?: string | null;
  installments: Installment[];
};

export type DebtCalculationItem = {
  installmentId: string;
  installmentNumber: number;
  dueDate: string;
  daysOverdue: number;
  principalAmount: number;
  penaltyAmount: number;
  interestAmount: number;
  totalAmount: number;
};

export type DebtCalculation = {
  id: string;
  contractId: string;
  calculationDate: string;
  totalPrincipal: number;
  totalPenalty: number;
  totalInterest: number;
  totalAmount: number;
  items: DebtCalculationItem[];
};
