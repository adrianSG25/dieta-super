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
