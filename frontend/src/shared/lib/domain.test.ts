import { describe, expect, it, vi } from "vitest";
import {
  defaultFirstDueDate,
  getDateFromToday,
  getInitials,
  getMaxFirstDueDate,
  getMinFirstDueDate,
  getTodayDate,
  isDateAfter,
  isDateBefore,
  isActionableInstallment,
  matchesAnyStatus,
  matchesStatus,
  pluralize,
} from "@shared/lib/domain";

describe("domain helpers", () => {
  it("returns the default first due date seven days ahead", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T12:00:00.000Z"));

    expect(getTodayDate()).toBe("2026-04-17");
    expect(defaultFirstDueDate()).toBe("2026-04-24");
    expect(getMinFirstDueDate()).toBe("2026-04-24");
    expect(getMaxFirstDueDate()).toBe("2026-05-17");
    expect(getDateFromToday(-1)).toBe("2026-04-16");
    expect(isDateBefore("2026-04-16", "2026-04-17")).toBe(true);
    expect(isDateAfter("2026-05-18", "2026-05-17")).toBe(true);

    vi.useRealTimers();
  });

  it("derives initials and status helpers correctly", () => {
    expect(getInitials("Operador Pascholotto")).toBe("OP");
    expect(matchesStatus("Overdue", "overdue")).toBe(true);
    expect(matchesAnyStatus("Open", ["overdue", "open"])).toBe(true);
    expect(isActionableInstallment("Overdue")).toBe(true);
    expect(isActionableInstallment("Paid")).toBe(false);
    expect(pluralize(1, "parcela", "parcelas")).toBe("parcela");
    expect(pluralize(3, "parcela", "parcelas")).toBe("parcelas");
  });
});
