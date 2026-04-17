import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AuthContextValue } from "@features/auth/context/auth-context";
import { useAuth } from "@features/auth/hooks/use-auth";
import { LoginPage } from "@features/auth/components/LoginPage";
import { renderRoute } from "@test/render-route";

vi.mock("@features/auth/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signs in and redirects to contracts", async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);

    mockedUseAuth.mockReturnValue({
      session: null,
      signIn,
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderRoute(
      [
        { path: "/login", element: <LoginPage /> },
        { path: "/contracts", element: <div>Carteira carregada</div> },
      ],
      ["/login"],
    );

    await userEvent.click(screen.getByRole("button", { name: "Acessar ambiente" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("operador", "Pascholotto123!");
    });

    expect(await screen.findByText("Carteira carregada")).toBeInTheDocument();
  });

  it("shows localized errors on failed sign in", async () => {
    mockedUseAuth.mockReturnValue({
      session: null,
      signIn: vi.fn().mockRejectedValue(new Error("Invalid credentials.")),
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderRoute([{ path: "/login", element: <LoginPage /> }], ["/login"]);

    await userEvent.click(screen.getByRole("button", { name: "Acessar ambiente" }));

    expect(await screen.findByText("Credenciais invalidas.")).toBeInTheDocument();
  });
});
