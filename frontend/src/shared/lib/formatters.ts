import { localizePayloadKeys } from "@shared/lib/translations";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function prettyJson(value: string) {
  try {
    return JSON.stringify(localizePayloadKeys(JSON.parse(value)), null, 2);
  } catch {
    return value;
  }
}
