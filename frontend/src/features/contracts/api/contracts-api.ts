import type { DebtCalculation, ContractDetail, ContractSummary } from "@entities/contract/types";
import { request } from "@shared/api/http-client";
import { API_BASE_URL } from "@shared/config/env";

export function searchContracts(token: string, document: string, contractNumber: string) {
  const query = new URLSearchParams();

  if (document) {
    query.set("document", document);
  }

  if (contractNumber) {
    query.set("contractNumber", contractNumber);
  }

  return request<ContractSummary[]>(`${API_BASE_URL}/api/contracts?${query.toString()}`, { token });
}

export function getContract(token: string, contractId: string) {
  return request<ContractDetail>(`${API_BASE_URL}/api/contracts/${contractId}`, { token });
}

export function calculateDebt(token: string, contractId: string, calculationDate?: string) {
  return request<DebtCalculation>(`${API_BASE_URL}/api/contracts/${contractId}/debt-calculations`, {
    method: "POST",
    token,
    body: JSON.stringify({ calculationDate: calculationDate || null }),
  });
}
