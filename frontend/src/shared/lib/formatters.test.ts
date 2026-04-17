import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, prettyJson } from "@shared/lib/formatters";

describe("formatters", () => {
  it("formats currency and dates for pt-BR", () => {
    expect(formatCurrency(2940)).toBe("R$ 2.940,00");
    expect(formatDate("2026-04-17")).toBe("17/04/2026");
  });

  it("pretty prints and localizes payload json", () => {
    expect(prettyJson("{\"InstallmentCount\":4,\"Status\":\"Open\"}")).toContain("\"QuantidadeParcelas\": 4");
    expect(prettyJson("{\"InstallmentCount\":4,\"Status\":\"Open\"}")).toContain("\"Status\": \"Em aberto\"");
  });
});
