import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadBoleto, getAgreement } from "@features/agreements/api/agreements-api";
import { useAuth } from "@features/auth/hooks/use-auth";
import { AgreementDetailPage } from "@features/agreements/pages/AgreementDetailPage";
import { agreementDetailFixture, sessionFixture } from "@test/fixtures";
import { renderRoute } from "@test/render-route";

vi.mock("@features/auth/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@features/agreements/api/agreements-api", () => ({
  createAgreement: vi.fn(),
  downloadBoleto: vi.fn(),
  getAgreement: vi.fn(),
  simulateAgreement: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetAgreement = vi.mocked(getAgreement);
const mockedDownloadBoleto = vi.mocked(downloadBoleto);

describe("AgreementDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      session: sessionFixture,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockedGetAgreement.mockResolvedValue(agreementDetailFixture);
    mockedDownloadBoleto.mockResolvedValue(undefined);
  });

  it("renders the agreement details and downloads the first boleto", async () => {
    renderRoute([{ path: "/agreements/:agreementId", element: <AgreementDetailPage /> }], ["/agreements/agreement-1"]);

    expect(await screen.findByText("Marina Costa")).toBeInTheDocument();
    expect(screen.getByText("Trilha de auditoria")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Baixar primeiro boleto" }));

    await waitFor(() => {
      expect(mockedDownloadBoleto).toHaveBeenCalledWith("token-123", "agreement-1", "agr-inst-1");
    });
  });
});
