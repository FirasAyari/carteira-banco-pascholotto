import type { AgreementInstallment } from "@entities/agreement/types";
import type { Installment } from "@entities/contract/types";

export function defaultFirstDueDate() {
  return getDateFromToday(7);
}

export function getTodayDate() {
  return getDateFromToday(0);
}

export function getMinFirstDueDate() {
  return getDateFromToday(7);
}

export function getMaxFirstDueDate() {
  return getDateFromToday(30);
}

export function getDateFromToday(offsetInDays: number) {
  const currentDate = new Date();
  currentDate.setHours(12, 0, 0, 0);
  currentDate.setDate(currentDate.getDate() + offsetInDays);
  return formatDateInputValue(currentDate);
}

export function isDateBefore(value: string, minimumValue: string) {
  return Boolean(value) && value < minimumValue;
}

export function isDateAfter(value: string, maximumValue: string) {
  return Boolean(value) && value > maximumValue;
}

export function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function matchesStatus(value: string, expected: string) {
  return value.trim().toLowerCase() === expected;
}

export function matchesAnyStatus(value: string, expectedValues: string[]) {
  const normalized = value.trim().toLowerCase();
  return expectedValues.includes(normalized);
}

export function isActionableInstallment(value: Installment["status"] | AgreementInstallment["status"]) {
  return matchesAnyStatus(value, ["open", "overdue"]);
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

function formatDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
