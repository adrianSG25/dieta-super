import type { SupermarketId, SupermarketOffer } from "@/types/dietasuper";
import { fetchSupermarketOffersWithFallback } from "./seed-data";

export const SUPERMARKET_ID: SupermarketId = "lidl";

/**
 * Adaptador para Lidl GB.
 * Lidl UK no expone una API pública abierta de precios por producto y utiliza
 * protección anti-bot / sesión regional; ante ausencia de endpoint o fallo HTTP
 * hace fallback limpio al catálogo semilla en GBP.
 */
const LIDL_CONFIG = {
  supermarket: SUPERMARKET_ID,
  endpointEnvVar: "LIDL_UK_SEARCH_ENDPOINT",
  userAgent: "DietaSuperUK/0.1",
};

export async function searchSupermarketCatalog(
  query: string,
): Promise<SupermarketOffer[]> {
  return fetchSupermarketOffersWithFallback(LIDL_CONFIG, query);
}

export async function fetchSupermarketOffer(
  query: string,
): Promise<SupermarketOffer | null> {
  const offers = await searchSupermarketCatalog(query);
  return offers[0] ?? null;
}
