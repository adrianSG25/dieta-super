import type { SupermarketId, SupermarketOffer } from "@/types/dietasuper";
import { fetchSupermarketOffersWithFallback } from "./seed-data";

export const SUPERMARKET_ID: SupermarketId = "aldi";

/**
 * Adaptador para Aldi UK.
 * Aldi protege su tienda web con Cloudflare y cookies de sesión de tienda/código postal,
 * por lo que si ALDI_UK_SEARCH_ENDPOINT no está configurado o devuelve bloqueo/timeout,
 * se hace fallback limpio al catálogo semilla verificado en GBP.
 */
const ALDI_CONFIG = {
  supermarket: SUPERMARKET_ID,
  endpointEnvVar: "ALDI_UK_SEARCH_ENDPOINT",
  userAgent: "DietaSuperUK/0.1",
};

export async function searchSupermarketCatalog(
  query: string,
): Promise<SupermarketOffer[]> {
  return fetchSupermarketOffersWithFallback(ALDI_CONFIG, query);
}

export async function fetchSupermarketOffer(
  query: string,
): Promise<SupermarketOffer | null> {
  const offers = await searchSupermarketCatalog(query);
  return offers[0] ?? null;
}
