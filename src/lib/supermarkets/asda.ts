import type { SupermarketId, SupermarketOffer } from "@/types/dietasuper";
import { fetchSupermarketOffersWithFallback } from "./seed-data";

export const SUPERMARKET_ID: SupermarketId = "asda";

/**
 * Adaptador para ASDA Groceries UK.
 * Los endpoints internos de ASDA requieren cookies de tienda/entrega y tokens
 * protegidos contra scraping; si ASDA_UK_SEARCH_ENDPOINT no está activo o falla,
 * responde con el catálogo semilla en GBP sin interrumpir la búsqueda.
 */
const ASDA_CONFIG = {
  supermarket: SUPERMARKET_ID,
  endpointEnvVar: "ASDA_UK_SEARCH_ENDPOINT",
  userAgent: "DietaSuperUK/0.1",
};

export async function searchSupermarketCatalog(
  query: string,
): Promise<SupermarketOffer[]> {
  return fetchSupermarketOffersWithFallback(ASDA_CONFIG, query);
}

export async function fetchSupermarketOffer(
  query: string,
): Promise<SupermarketOffer | null> {
  const offers = await searchSupermarketCatalog(query);
  return offers[0] ?? null;
}
