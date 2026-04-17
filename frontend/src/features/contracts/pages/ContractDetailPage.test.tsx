import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@features/auth/hooks/use-auth";
import { getContract } from "@features/contracts/api/contracts-api";
import { ContractDetailPage } from "@features/contracts/pages/ContractDetailPage";
import { contractDetailFixture, sessionFixture } from "@test/fixtures";
import { renderRoute } from "@test/render-route";

vi.mock("@features/auth/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@features/contracts/api/contracts-api", () => ({
  getContract: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetContract = vi.mocked(getContract);

describe("ContractDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      session: sessionFixture,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockedGetContract.mockResolvedValue(contractDetailFixture);
  });

  it("renders the contract spotlight and ledger", async () => {
    renderRoute([{ path: "/contracts/:contractId", element: <ContractDetailPage /> }], ["/contracts/contract-1"]);

    expect(await screen.findByText("Marina Costa")).toBeInTheDocument();
    expect(screen.getByText("Iniciar negociacao")).toBeInTheDocument();
    expect(screen.getByText("Extrato de parcelas")).toBeInTheDocument();
    expect(screen.getByText("Disponivel para consulta")).toBeInTheDocument();
  });
});
