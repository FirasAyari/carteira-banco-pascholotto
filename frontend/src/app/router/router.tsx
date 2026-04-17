import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@app/layouts/AppShell";
import { LoginPage } from "@features/auth/components/LoginPage";
import { AgreementDetailPage } from "@features/agreements/pages/AgreementDetailPage";
import { ContractDetailPage } from "@features/contracts/pages/ContractDetailPage";
import { ContractsPage } from "@features/contracts/pages/ContractsPage";
import { NegotiationPage } from "@features/contracts/pages/NegotiationPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/contracts" />,
      },
      {
        path: "contracts",
        element: <ContractsPage />,
      },
      {
        path: "contracts/:contractId",
        element: <ContractDetailPage />,
      },
      {
        path: "contracts/:contractId/negotiate",
        element: <NegotiationPage />,
      },
      {
        path: "agreements/:agreementId",
        element: <AgreementDetailPage />,
      },
    ],
  },
]);
