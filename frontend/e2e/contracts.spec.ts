import { expect, test } from "@playwright/test";
import { statSync } from "node:fs";

test("operator can complete an agreement and download the boleto PDF", async ({ page }, testInfo) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Acesse a central de operacoes" })).toBeVisible();
  await page.getByLabel("Usuario").fill("operador");
  await page.getByLabel("Senha").fill("Pascholotto123!");
  await page.getByRole("button", { name: "Acessar ambiente" }).click();

  await expect(page).toHaveURL(/\/contracts$/);
  await expect(page.getByRole("heading", { name: "Busque contratos e siga para a negociacao" })).toBeVisible();

  await page.getByLabel("Numero do contrato").fill("BP-2026-001");
  await page.getByRole("button", { name: "Buscar carteira" }).click();
  await expect(page.getByRole("cell", { name: "BP-2026-001" })).toBeVisible();

  await page.getByRole("link", { name: "Abrir" }).click();
  await expect(page.getByRole("heading", { name: "Marina Costa" })).toBeVisible();

  await page.getByRole("link", { name: "Iniciar negociacao" }).click();
  await expect(page.getByRole("heading", { name: "Monte o acordo de Marina Costa" })).toBeVisible();

  await page.getByRole("button", { name: "Recalcular divida" }).click();
  await expect(page.getByText("Total consolidado")).toBeVisible();

  await page.getByRole("button", { name: "Simular acordo" }).click();
  await expect(page.getByRole("heading", { name: "Resultado da simulacao" })).toBeVisible();
  await expect(page.getByText("Total do acordo")).toBeVisible();

  await page.getByRole("button", { name: "Formalizar acordo" }).click();
  await expect(page).toHaveURL(/\/agreements\//);
  await expect(page.getByRole("heading", { name: "Marina Costa" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Parcelas e boletos" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar primeiro boleto" }).first().click();
  const download = await downloadPromise;
  const suggestedFileName = download.suggestedFilename();
  expect(suggestedFileName).toMatch(/^boleto-.+\.pdf$/);

  const downloadedBoletoPath = testInfo.outputPath(suggestedFileName);
  await download.saveAs(downloadedBoletoPath);
  expect(statSync(downloadedBoletoPath).size).toBeGreaterThan(1_000);
});
