import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@features/auth/hooks/use-auth";
import { searchContracts } from "@features/contracts/api/contracts-api";
import { ContractsPage } from "@features/contracts/pages/ContractsPage";
import { secondContractSummaryFixture, sessionFixture, contractSummaryFixture } from "@test/fixtures";
import { renderRoute } from "@test/render-route";

vi.mock("@features/auth/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@features/contracts/api/contracts-api", () => ({
  searchContracts: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedSearchContracts = vi.mocked(searchContracts);

describe("ContractsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      session: sessionFixture,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

  it("loads contracts on mount and supports a filtered search", async () => {
    mockedSearchContracts
      .mockResolvedValueOnce([contractSummaryFixture, secondContractSummaryFixture])
      .mockResolvedValueOnce([contractSummaryFixture]);

    renderRoute([{ path: "/contracts", element: <ContractsPage /> }], ["/contracts"]);

    expect(await screen.findByText("Marina Costa")).toBeInTheDocument();
    expect(screen.getByText("Carlos Souza")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText("Documento do cliente"));
    await userEvent.type(screen.getByLabelText("Documento do cliente"), "12345678901");
    await userEvent.clear(screen.getByLabelText("Numero do contrato"));
    await userEvent.type(screen.getByLabelText("Numero do contrato"), "BP-2026-001");
    await userEvent.click(screen.getByRole("button", { name: "Buscar carteira" }));

    await waitFor(() => {
      expect(mockedSearchContracts).toHaveBeenNthCalledWith(2, "token-123", "12345678901", "BP-2026-001");
    });

    await waitFor(() => {
      expect(screen.queryByText("Carlos Souza")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Marina Costa")).toBeInTheDocument();
  });

  it("renders the empty state when no contracts are returned", async () => {
    mockedSearchContracts.mockResolvedValue([]);

    renderRoute([{ path: "/contracts", element: <ContractsPage /> }], ["/contracts"]);

    expect(await screen.findByText("Nenhum contrato foi encontrado com os filtros informados.")).toBeInTheDocument();
  });
});
