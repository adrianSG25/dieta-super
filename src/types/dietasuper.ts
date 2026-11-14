export type SupermarketId = "aldi" | "lidl" | "asda" | "morrisons";

export const SUPERMARKET_IDS: SupermarketId[] = [
  "aldi",
  "lidl",
  "asda",
  "morrisons",
];

export interface NutritionInfo {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
}

export interface SupermarketOffer {
  supermarket: SupermarketId;
  productName: string;
  priceGbp: number;
  promoPriceGbp?: number;
  unitPriceText: string;
  pricePerKgOrLitreGbp?: number;
  weightGrams: number;
  inStock: boolean;
  productUrl?: string;
  lastUpdated: string;
  source: "live-api" | "openfoodfacts" | "catalog-seed";
}

export interface ComparedProduct {
  id: string;
  canonicalName: string;
  category: string;
  barcode?: string;
  imageUrl?: string;
  nutrition: NutritionInfo;
  offers: Record<SupermarketId, SupermarketOffer | null>;
}

export type CoupleMemberRole = "yo" | "pareja";

export interface ShoppingListItem {
  id: string;
  productId: string;
  product: ComparedProduct;
  quantity: number;
  addedBy: CoupleMemberRole;
  checked: boolean;
  preferredSupermarket?: SupermarketId;
  notes?: string;
}

export type OptimizationMode =
  | "cheapest-total"
  | "single-supermarket"
  | "best-calories-per-pound"
  | "high-protein-budget";

export interface CoupleGoals {
  member1Name: string;
  member2Name: string;
  dailyCaloriesTargetTotal: number;
  dailyProteinTargetGrams: number;
  weeklyBudgetGbp: number;
  optimizationMode: OptimizationMode;
}

export interface SupermarketBasketBreakdown {
  supermarket: SupermarketId;
  totalGbp: number;
  availableItemsCount: number;
  missingItemsCount: number;
  missingProductIds: string[];
}

export interface SplitBasketAssignment {
  itemId: string;
  productId: string;
  canonicalName: string;
  quantity: number;
  supermarket: SupermarketId;
  unitPriceGbp: number;
  lineTotalGbp: number;
  savingsVsWorstGbp: number;
}

export interface BasketNutritionSummary {
  totalCalories: number;
  totalProteinGrams: number;
  totalCarbsGrams: number;
  totalFatGrams: number;
  totalWeightGrams: number;
  costPer1000KcalGbp: number;
  costPer100gProteinGbp: number;
  estimatedDaysCoveredCalories: number;
  estimatedDaysCoveredProtein: number;
}

export interface BasketOptimizationResult {
  singleSupermarketTotals: Record<SupermarketId, SupermarketBasketBreakdown>;
  bestSingleSupermarket: SupermarketId | null;
  bestSingleSupermarketTotalGbp: number;
  splitBasketTotalGbp: number;
  splitSavingsVsBestSingleGbp: number;
  splitAssignments: SplitBasketAssignment[];
  splitGroupedBySupermarket: Record<SupermarketId, SplitBasketAssignment[]>;
  nutritionSummary: BasketNutritionSummary;
  budgetRemainingGbp: number;
  isOverBudget: boolean;
  recommendations: string[];
}
