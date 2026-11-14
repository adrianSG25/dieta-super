import {
  SUPERMARKET_IDS,
  type ComparedProduct,
  type SupermarketId,
  type SupermarketOffer,
} from "@/types/dietasuper";
import * as aldiAdapter from "./aldi";
import * as asdaAdapter from "./asda";
import * as lidlAdapter from "./lidl";
import * as morrisonsAdapter from "./morrisons";
import { searchOpenFoodFactsUK } from "./openfoodfacts";
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  matchesProductQuery,
  normalizeSearchText,
} from "./seed-data";

export interface SearchComparedProductsOptions {
  query?: string;
  category?: string;
  includeOpenFoodFacts?: boolean;
}

export interface SupermarketAdapter {
  SUPERMARKET_ID: SupermarketId;
  searchSupermarketCatalog: (query: string) => Promise<SupermarketOffer[]>;
  fetchSupermarketOffer: (query: string) => Promise<SupermarketOffer | null>;
}

export const SUPERMARKET_ADAPTERS: Record<SupermarketId, SupermarketAdapter> = {
  aldi: aldiAdapter,
  lidl: lidlAdapter,
  asda: asdaAdapter,
  morrisons: morrisonsAdapter,
};

export function getDefaultCatalog(): ComparedProduct[] {
  return SEED_PRODUCTS;
}

export function getCategories(): string[] {
  return SEED_CATEGORIES;
}

function isCategoryMatch(productCategory: string, selectedCategory?: string): boolean {
  if (!selectedCategory) return true;
  const normalized = normalizeSearchText(selectedCategory);
  if (!normalized || normalized === "all" || normalized === "todas") {
    return true;
  }
  return normalizeSearchText(productCategory) === normalized;
}

function deduplicateWithSeed(
  seedMatches: ComparedProduct[],
  offProducts: ComparedProduct[],
): ComparedProduct[] {
  const seenBarcodes = new Set<string>();
  const seenNames = new Set<string>();

  for (const item of seedMatches) {
    if (item.barcode) {
      seenBarcodes.add(item.barcode.trim());
    }
    seenNames.add(normalizeSearchText(item.canonicalName));
    for (const supermarket of SUPERMARKET_IDS) {
      const offer = item.offers[supermarket];
      if (offer?.productName) {
        seenNames.add(normalizeSearchText(offer.productName));
      }
    }
  }

  const uniqueOff: ComparedProduct[] = [];
  for (const product of offProducts) {
    const barcode = product.barcode?.trim();
    const normalizedName = normalizeSearchText(product.canonicalName);

    if (barcode && seenBarcodes.has(barcode)) continue;
    if (normalizedName && seenNames.has(normalizedName)) continue;

    if (barcode) seenBarcodes.add(barcode);
    if (normalizedName) seenNames.add(normalizedName);
    uniqueOff.push(product);
  }

  return [...seedMatches, ...uniqueOff];
}

export async function searchComparedProducts(
  options: SearchComparedProductsOptions = {},
): Promise<ComparedProduct[]> {
  const query = options.query?.trim() ?? "";
  const category = options.category?.trim();

  const seedMatches = SEED_PRODUCTS.filter((product) => {
    if (!isCategoryMatch(product.category, category)) return false;
    if (!query) return true;
    return matchesProductQuery(product, query);
  });

  if (options.includeOpenFoodFacts && query.length >= 2) {
    const offProducts = await searchOpenFoodFactsUK(query, 8);
    return deduplicateWithSeed(seedMatches, offProducts);
  }

  return seedMatches;
}

export { getEnglishProductName } from "./seed-helpers";
export { searchOpenFoodFactsUK };
