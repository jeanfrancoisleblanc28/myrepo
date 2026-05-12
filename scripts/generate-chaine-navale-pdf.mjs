#!/usr/bin/env node
/**
 * Génère public/chaine-navale.pdf à partir de la page /chaine-navale servie
 * en local. À lancer après `npm run build && npm run start` :
 *
 *   node scripts/generate-chaine-navale-pdf.mjs
 *
 * Le script utilise Playwright (Chromium) installé via `npx playwright
 * install chromium`. Le PDF final est écrit dans `public/chaine-navale.pdf`
 * et est accessible à `http://localhost:3000/chaine-navale.pdf` ou
 * directement sur disque.
 *
 * NOTE: Tailwind `print:` est inactif ici parce qu'on émule le média `screen`
 * (sinon les utilities responsive ne s'appliquent pas à la mise en page A4).
 * On retire donc manuellement les éléments tagués `[data-pdf-hide]` et on
 * injecte des règles de compaction côté script.
 */

import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, "..", "public", "chaine-navale.pdf");
const URL = process.env.CHAINE_NAVALE_URL || "http://localhost:3000/chaine-navale";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto(URL, { waitUntil: "networkidle" });

await page.evaluate(() => {
  document.documentElement.classList.remove("dark");
  document.querySelector("header.sticky")?.remove();
  document.querySelectorAll("[data-pdf-hide]").forEach((el) => el.remove());
  const main = document.querySelector("main");
  if (main) main.style.padding = "24px";
});

await page.addStyleTag({
  content: `
    .chaine-navale-print { gap: 2rem !important; }
    .chaine-navale-print [data-tier] { padding: 1rem !important; }
    .chaine-navale-print [data-tier] li[class*="rounded-md"] {
      padding: 0.5rem 0.75rem !important;
    }
    .chaine-navale-print [data-tier] [class*="rounded-lg"] [class*="p-6"] {
      padding: 0.75rem !important;
    }
  `,
});

await page.emulateMedia({ media: "screen" });

await page.pdf({
  path: OUTPUT,
  format: "A4",
  printBackground: true,
  margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
});

await browser.close();
console.log(`PDF généré : ${OUTPUT}`);
