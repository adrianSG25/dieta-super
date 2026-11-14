import {
  SUPERMARKET_IDS,
  type ComparedProduct,
  type NutritionInfo,
  type SupermarketId,
  type SupermarketOffer,
} from "@/types/dietasuper";

interface OpenFoodFactsNutriments {
  "energy-kcal_100g"?: number | string;
  "energy-kcal"?: number | string;
  proteins_100g?: number | string;
  carbohydrates_100g?: number | string;
  fat_100g?: number | string;
  fiber_100g?: number | string;
}

interface OpenFoodFactsProductRaw {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  stores_tags?: string[];
  image_front_small_url?: string;
  quantity?: string;
  product_quantity?: number | string;
  nutriments?: OpenFoodFactsNutriments;
}

interface OpenFoodFactsSearchResponse {
  products?: OpenFoodFactsProductRaw[];
}

function toFiniteNumber(value: number | string | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundMacro(value: number): number {
  return Math.max(0, Math.round(value * 10) / 10);
}

function parseWeightGrams(raw: OpenFoodFactsProductRaw): number {
  const numericQty = toFiniteNumber(raw.product_quantity);
  if (numericQty !== null && numericQty > 0) {
    return Math.round(numericQty);
  }

  const qtyText = (raw.quantity ?? "").toLowerCase().trim();
  const match = qtyText.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)\b/);
  if (match) {
    const amount = Number(match[1].replace(",", "."));
    const unit = match[2];
    if (Number.isFinite(amount) && amount > 0) {
      if (unit === "kg" || unit === "l") {
        return Math.round(amount * 1000);
      }
      return Math.round(amount);
    }
  }

  return 500;
}

function extractNutrition(
  nutriments: OpenFoodFactsNutriments | undefined,
): NutritionInfo | null {
  if (!nutriments) return null;

  const protein = toFiniteNumber(nutriments.proteins_100g) ?? 0;
  const carbs = toFiniteNumber(nutriments.carbohydrates_100g) ?? 0;
  const fat = toFiniteNumber(nutriments.fat_100g) ?? 0;
  const fiber = toFiniteNumber(nutriments.fiber_100g);

  let calories =
    toFiniteNumber(nutriments["energy-kcal_100g"]) ??
    toFiniteNumber(nutriments["energy-kcal"]);

  if (calories === null) {
    const hasMacros = protein > 0 || carbs > 0 || fat > 0;
    if (!hasMacros) return null;
    calories = protein * 4 + carbs * 4 + fat * 9;
  }

  return {
    caloriesPer100g: Math.max(0, Math.round(calories)),
    proteinPer100g: roundMacro(protein),
    carbsPer100g: roundMacro(carbs),
    fatPer100g: roundMacro(fat),
    ...(fiber !== null ? { fiberPer100g: roundMacro(fiber) } : {}),
  };
}

function extractCategory(raw: OpenFoodFactsProductRaw): string {
  const firstTag = raw.categories_tags?.find((tag) => tag.startsWith("en:"));
  if (firstTag) {
    const cleaned = firstTag.replace(/^en:/, "").replace(/-/g, " ").trim();
    if (cleaned) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }
  const firstCategory = raw.categories?.split(",")[0]?.trim();
  return firstCategory || "Open Food Facts UK";
}

function detectStoreMatches(storesTags: string[] | undefined): Set<SupermarketId> {
  const detected = new Set<SupermarketId>();
  if (!storesTags || storesTags.length === 0) return detected;

  for (const rawTag of storesTags) {
    const tag = rawTag.toLowerCase();
    for (const supermarket of SUPERMARKET_IDS) {
      if (tag === supermarket || tag.includes(supermarket)) {
        detected.add(supermarket);
      }
    }
  }
  return detected;
}

export async function searchOpenFoodFactsUK(
  query: string,
  limit = 8,
): Promise<ComparedProduct[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const pageSize = Math.min(Math.max(Math.trunc(limit), 1), 24);
  const url = `https://uk.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    trimmed,
  )}&search_simple=1&action=process&json=1&page_size=${pageSize}`;

  try {
    const isBrowser = typeof window !== "undefined";
    const headers: Record<string, string> = isBrowser
      ? { Accept: "application/json" }
      : {
          "User-Agent": "DietaSuperUK/0.1",
          Accept: "application/json",
        };

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(4500),
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as OpenFoodFactsSearchResponse;
    if (!Array.isArray(data.products)) {
      return [];
    }

    const nowIso = new Date().toISOString();
    const mapped: ComparedProduct[] = [];

    for (const raw of data.products) {
      const name = (raw.product_name || raw.product_name_en || "").trim();
      if (!name) continue;

      const nutrition = extractNutrition(raw.nutriments);
      if (!nutrition) continue;

      const barcode = raw.code?.trim() || undefined;
      const weightGrams = parseWeightGrams(raw);
      const stores = detectStoreMatches(raw.stores_tags);
      const displayName =
        raw.brands && !name.toLowerCase().includes(raw.brands.toLowerCase())
          ? `${raw.brands.split(",")[0].trim()} ${name}`
          : name;

      const offers: Record<SupermarketId, SupermarketOffer | null> = {
        aldi: null,
        lidl: null,
        asda: null,
        morrisons: null,
      };

      for (const supermarket of stores) {
        offers[supermarket] = {
          supermarket,
          productName: displayName,
          priceGbp: 0,
          unitPriceText: "Sin precio en Open Food Facts (ver tienda)",
          weightGrams,
          // Open Food Facts no incluye precio GBP fiable; inStock=false evita sumar £0.00 en cesta.
          inStock: false,
          ...(barcode
            ? { productUrl: `https://uk.openfoodfacts.org/product/${barcode}` }
            : {}),
          lastUpdated: nowIso,
          source: "openfoodfacts",
        };
      }

      mapped.push({
        id: `off-${barcode ?? mapped.length + 1}`,
        canonicalName: displayName,
        category: extractCategory(raw),
        ...(barcode ? { barcode } : {}),
        ...(raw.image_front_small_url
          ? { imageUrl: raw.image_front_small_url }
          : {}),
        nutrition,
        offers,
      });
    }

    return mapped;
  } catch {
    return [];
  }
}
