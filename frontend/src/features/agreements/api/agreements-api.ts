import type { AgreementDetail, AgreementSimulation } from "@entities/agreement/types";
import { request } from "@shared/api/http-client";
import { API_BASE_URL } from "@shared/config/env";

type AgreementPayload = {
  debtCalculationId: string;
  installmentCount: number;
  downPaymentAmount: number;
  firstDueDate: string;
};

export function simulateAgreement(token: string, contractId: string, payload: AgreementPayload) {
  return request<AgreementSimulation>(`${API_BASE_URL}/api/contracts/${contractId}/agreements/simulate`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function createAgreement(token: string, contractId: string, payload: AgreementPayload) {
  return request<AgreementDetail>(`${API_BASE_URL}/api/contracts/${contractId}/agreements`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function getAgreement(token: string, agreementId: string) {
  return request<AgreementDetail>(`${API_BASE_URL}/api/agreements/${agreementId}`, { token });
}

export async function downloadBoleto(token: string, agreementId: string, installmentId: string) {
  const response = await fetch(`${API_BASE_URL}/api/agreements/${agreementId}/boletos/${installmentId}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to download boleto PDF.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `boleto-${installmentId}.pdf`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
