import type { SupermarketId, SupermarketOffer } from "@/types/dietasuper";
import { fetchSupermarketOffersWithFallback } from "./seed-data";

export const SUPERMARKET_ID: SupermarketId = "morrisons";

/**
 * Adaptador para Morrisons Groceries UK.
 * Morrisons bloquea peticiones sin cookies/sesión válida mediante WAF/Cloudflare,
 * por lo que usa fetch con timeout corto solo si MORRISONS_UK_SEARCH_ENDPOINT
 * está configurado y realiza fallback limpio al catálogo semilla en GBP.
 */
const MORRISONS_CONFIG = {
  supermarket: SUPERMARKET_ID,
  endpointEnvVar: "MORRISONS_UK_SEARCH_ENDPOINT",
  userAgent: "DietaSuperUK/0.1",
};

export async function searchSupermarketCatalog(
  query: string,
): Promise<SupermarketOffer[]> {
  return fetchSupermarketOffersWithFallback(MORRISONS_CONFIG, query);
}

export async function fetchSupermarketOffer(
  query: string,
): Promise<SupermarketOffer | null> {
  const offers = await searchSupermarketCatalog(query);
  return offers[0] ?? null;
}
