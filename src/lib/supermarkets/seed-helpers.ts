import type {
  ComparedProduct,
  SupermarketId,
  SupermarketOffer,
} from "@/types/dietasuper";

export const SEED_UPDATED_AT = "2026-11-14T00:00:00.000Z";

export type CompactOfferTuple = [
  productName: string,
  priceGbp: number,
  promoPriceGbp?: number,
  weightOverrideGrams?: number,
];

export interface CompactSeedProductInput {
  id: string;
  canonicalName: string;
  category: string;
  barcode?: string;
  unitLabel?: "kg" | "L";
  weightGrams: number;
  nutrition: [
    caloriesPer100g: number,
    proteinPer100g: number,
    carbsPer100g: number,
    fatPer100g: number,
    fiberPer100g?: number,
  ];
  aldi: CompactOfferTuple;
  lidl: CompactOfferTuple;
  asda: CompactOfferTuple;
  morrisons: CompactOfferTuple;
}

function buildCompactOffer(
  supermarket: SupermarketId,
  tuple: CompactOfferTuple,
  defaultWeightGrams: number,
  unitLabel: "kg" | "L",
): SupermarketOffer {
  const [productName, priceGbp, promoPriceGbp, weightOverride] = tuple;
  const weightGrams = weightOverride ?? defaultWeightGrams;
  const effectivePrice = promoPriceGbp ?? priceGbp;
  const perKgOrLitre = Number(
    ((effectivePrice / Math.max(weightGrams, 1)) * 1000).toFixed(2),
  );
  return {
    supermarket,
    productName,
    priceGbp,
    ...(promoPriceGbp !== undefined ? { promoPriceGbp } : {}),
    unitPriceText: `£${perKgOrLitre.toFixed(2)}/${unitLabel}`,
    pricePerKgOrLitreGbp: perKgOrLitre,
    weightGrams,
    inStock: true,
    lastUpdated: SEED_UPDATED_AT,
    source: "catalog-seed",
  };
}

export function makeSeedProduct(input: CompactSeedProductInput): ComparedProduct {
  const unitLabel = input.unitLabel ?? "kg";
  const [
    caloriesPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    fiberPer100g = 0,
  ] = input.nutrition;
  return {
    id: input.id,
    canonicalName: input.canonicalName,
    category: input.category,
    ...(input.barcode ? { barcode: input.barcode } : {}),
    nutrition: {
      caloriesPer100g,
      proteinPer100g,
      carbsPer100g,
      fatPer100g,
      fiberPer100g,
    },
    offers: {
      aldi: buildCompactOffer("aldi", input.aldi, input.weightGrams, unitLabel),
      lidl: buildCompactOffer("lidl", input.lidl, input.weightGrams, unitLabel),
      asda: buildCompactOffer("asda", input.asda, input.weightGrams, unitLabel),
      morrisons: buildCompactOffer(
        "morrisons",
        input.morrisons,
        input.weightGrams,
        unitLabel,
      ),
    },
  };
}

const BRAND_PREFIXES: string[] = [
  "Just Essentials by ASDA",
  "Just Essentials",
  "ASDA Extra Special",
  "Morrisons Savers",
  "Morrisons The Best",
  "ASDA",
  "Morrisons",
  "Ashfield Farm",
  "Birchwood",
  "Nature's Pick",
  "Oaklands",
  "Everyday Essentials",
  "Crownfield",
  "Brooklea",
  "Milbona",
  "Merevale",
  "Warren & Sons",
  "Specially Selected",
  "Deluxe",
  "The Best",
  "Savers",
  "Vemondo",
  "Acti Leaf",
  "Baresa",
  "Newgate",
  "Cucina",
  "Village Bakery",
  "Rowan Hill",
  "Alcafe",
  "Bellarom",
  "Foodie Market",
  "Four Seasons",
  "Freshona",
  "Ocean Trader",
  "The Fishmonger",
  "Cowbelle",
  "Emporium",
  "Worldwide Foods",
  "World Foods",
  "Woodgate",
  "Snackrite",
  "Oakhurst",
  "Broadfields",
  "Bramwells",
  "Harvest Morn",
  "Belbake",
  "Meadow Fresh",
  "Valley Spire",
  "Solesta",
  "Kania",
  "Pilos",
  "British",
  "Scottish",
  "Fairtrade",
  "Succulent",
  "Tender",
];

const SORTED_BRAND_PREFIXES = [...BRAND_PREFIXES].sort(
  (a, b) => b.length - a.length,
);

export function getEnglishProductName(product: ComparedProduct): string {
  const raw =
    product.offers.asda?.productName ||
    product.offers.morrisons?.productName ||
    product.offers.aldi?.productName ||
    product.offers.lidl?.productName ||
    "";

  const originalTrimmed = raw.trim();
  if (!originalTrimmed) return "";

  let cleaned = originalTrimmed;
  let changed = true;

  while (changed) {
    changed = false;
    for (const prefix of SORTED_BRAND_PREFIXES) {
      const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^${escaped}\\b`, "i");
      if (regex.test(cleaned)) {
        const after = cleaned.replace(regex, "").trim();
        const withoutPunct = after.replace(/^[-–—:,.\s]+/, "").trim();
        if (withoutPunct.length > 0) {
          cleaned = withoutPunct;
          changed = true;
          break;
        }
      }
    }
  }

  return cleaned || originalTrimmed;
}
