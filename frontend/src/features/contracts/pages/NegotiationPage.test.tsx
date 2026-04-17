import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@features/auth/hooks/use-auth";
import { createAgreement, simulateAgreement } from "@features/agreements/api/agreements-api";
import { calculateDebt, getContract } from "@features/contracts/api/contracts-api";
import { NegotiationPage } from "@features/contracts/pages/NegotiationPage";
import { defaultFirstDueDate, getDateFromToday, getMaxFirstDueDate, getMinFirstDueDate, getTodayDate } from "@shared/lib/domain";
import {
  agreementDetailFixture,
  agreementSimulationFixture,
  contractDetailFixture,
  debtCalculationFixture,
  sessionFixture,
} from "@test/fixtures";
import { renderRoute } from "@test/render-route";

vi.mock("@features/auth/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@features/contracts/api/contracts-api", () => ({
  calculateDebt: vi.fn(),
  getContract: vi.fn(),
  searchContracts: vi.fn(),
}));

vi.mock("@features/agreements/api/agreements-api", () => ({
  createAgreement: vi.fn(),
  downloadBoleto: vi.fn(),
  getAgreement: vi.fn(),
  simulateAgreement: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetContract = vi.mocked(getContract);
const mockedCalculateDebt = vi.mocked(calculateDebt);
const mockedSimulateAgreement = vi.mocked(simulateAgreement);
const mockedCreateAgreement = vi.mocked(createAgreement);

describe("NegotiationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      session: sessionFixture,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockedGetContract.mockResolvedValue(contractDetailFixture);
    mockedCalculateDebt.mockResolvedValue(debtCalculationFixture);
    mockedSimulateAgreement.mockResolvedValue(agreementSimulationFixture);
    mockedCreateAgreement.mockResolvedValue(agreementDetailFixture);
  });

  it("walks through debt calculation, simulation, and agreement creation", async () => {
    renderRoute(
      [
        { path: "/contracts/:contractId/negotiate", element: <NegotiationPage /> },
        { path: "/agreements/:agreementId", element: <div>Acordo aberto</div> },
      ],
      ["/contracts/contract-1/negotiate"],
    );

    expect(await screen.findByText(/Monte o acordo de Marina Costa/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Recalcular divida" }));

    expect(await screen.findByText("Total consolidado")).toBeInTheDocument();
    expect(mockedCalculateDebt).toHaveBeenCalledWith("token-123", "contract-1", "");

    await userEvent.click(screen.getByRole("button", { name: "Simular acordo" }));

    expect(await screen.findByText("Resultado da simulacao")).toBeInTheDocument();
    expect(screen.getByText("Total do acordo")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Formalizar acordo" }));

    await waitFor(() => {
      expect(mockedCreateAgreement).toHaveBeenCalledWith("token-123", "contract-1", {
        debtCalculationId: "debt-1",
        installmentCount: 4,
        downPaymentAmount: 0,
        firstDueDate: agreementSimulationFixture.firstDueDate,
      });
    });

    expect(await screen.findByText("Acordo aberto")).toBeInTheDocument();
  });

  it("blocks past dates and exposes the valid date window", async () => {
    renderRoute([{ path: "/contracts/:contractId/negotiate", element: <NegotiationPage /> }], ["/contracts/contract-1/negotiate"]);

    const calculationDateInput = (await screen.findByLabelText(/Data de calculo/i)) as HTMLInputElement;
    const firstDueDateInput = screen.getByLabelText(/Primeiro vencimento/i) as HTMLInputElement;

    expect(calculationDateInput).toHaveAttribute("min", getTodayDate());
    expect(firstDueDateInput).toHaveAttribute("min", getMinFirstDueDate());
    expect(firstDueDateInput).toHaveAttribute("max", getMaxFirstDueDate());

    fireEvent.change(calculationDateInput, { target: { value: getDateFromToday(-1) } });
    expect(calculationDateInput).toHaveValue("");
    expect(screen.getByText("A data de calculo nao pode estar no passado.")).toBeInTheDocument();

    fireEvent.change(firstDueDateInput, { target: { value: getDateFromToday(-1) } });
    expect(firstDueDateInput).toHaveValue(defaultFirstDueDate());
    expect(screen.getByText("O primeiro vencimento deve estar entre D+7 e D+30.")).toBeInTheDocument();
  });
});
