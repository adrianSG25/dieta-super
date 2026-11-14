import {
  BasketNutritionSummary,
  BasketOptimizationResult,
  CoupleGoals,
  ShoppingListItem,
  SplitBasketAssignment,
  SUPERMARKET_IDS,
  SupermarketBasketBreakdown,
  SupermarketId,
  SupermarketOffer,
} from "@/types/dietasuper";

export interface OptimizeBasketOptions {
  /**
   * Por defecto `true` para planificar el coste y las macros totales de toda la cesta semanal,
   * incluyendo productos ya marcados como comprados. Pasa `false` para calcular solo lo pendiente.
   */
  includeChecked?: boolean;
}

const SUPERMARKET_LABELS: Record<SupermarketId, string> = {
  aldi: "Aldi",
  lidl: "Lidl",
  asda: "Asda",
  morrisons: "Morrisons",
};

function round2(value: number): number {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return rounded === 0 ? 0 : rounded;
}

export function getEffectiveOfferPrice(offer: SupermarketOffer): number {
  return offer.promoPriceGbp ?? offer.priceGbp;
}

function getFallbackWeightGrams(item: ShoppingListItem): number {
  for (const supermarket of SUPERMARKET_IDS) {
    const offer = item.product.offers[supermarket];
    if (offer && offer.weightGrams > 0) {
      return offer.weightGrams;
    }
  }
  return 100;
}

function createEmptySingleTotals(): Record<
  SupermarketId,
  SupermarketBasketBreakdown
> {
  return {
    aldi: {
      supermarket: "aldi",
      totalGbp: 0,
      availableItemsCount: 0,
      missingItemsCount: 0,
      missingProductIds: [],
    },
    lidl: {
      supermarket: "lidl",
      totalGbp: 0,
      availableItemsCount: 0,
      missingItemsCount: 0,
      missingProductIds: [],
    },
    asda: {
      supermarket: "asda",
      totalGbp: 0,
      availableItemsCount: 0,
      missingItemsCount: 0,
      missingProductIds: [],
    },
    morrisons: {
      supermarket: "morrisons",
      totalGbp: 0,
      availableItemsCount: 0,
      missingItemsCount: 0,
      missingProductIds: [],
    },
  };
}

function createEmptyGroupedAssignments(): Record<
  SupermarketId,
  SplitBasketAssignment[]
> {
  return {
    aldi: [],
    lidl: [],
    asda: [],
    morrisons: [],
  };
}

interface AvailableOfferEntry {
  supermarket: SupermarketId;
  offer: SupermarketOffer;
  effectivePrice: number;
}

function pickOptimalOffer(
  item: ShoppingListItem,
  availableOffers: AvailableOfferEntry[],
  goals: CoupleGoals
): AvailableOfferEntry {
  if (item.preferredSupermarket) {
    const preferred = availableOffers.find(
      (entry) => entry.supermarket === item.preferredSupermarket
    );
    if (preferred) {
      return preferred;
    }
  }

  const preferLargerPackOnTie =
    goals.optimizationMode === "high-protein-budget" ||
    goals.optimizationMode === "best-calories-per-pound";

  return availableOffers.reduce((best, current) => {
    if (current.effectivePrice < best.effectivePrice) {
      return current;
    }
    if (
      preferLargerPackOnTie &&
      current.effectivePrice === best.effectivePrice &&
      current.offer.weightGrams > best.offer.weightGrams
    ) {
      return current;
    }
    return best;
  });
}

function buildRecommendations(params: {
  validItemsCount: number;
  unavailableEverywhereCount: number;
  goals: CoupleGoals;
  bestSingleSupermarket: SupermarketId | null;
  singleSupermarketTotals: Record<SupermarketId, SupermarketBasketBreakdown>;
  splitAssignments: SplitBasketAssignment[];
  splitGroupedBySupermarket: Record<SupermarketId, SplitBasketAssignment[]>;
  splitSavingsVsBestSingleGbp: number;
  totalSavingsVsWorstGbp: number;
  nutritionSummary: BasketNutritionSummary;
  budgetRemainingGbp: number;
  isOverBudget: boolean;
}): string[] {
  const {
    validItemsCount,
    unavailableEverywhereCount,
    goals,
    bestSingleSupermarket,
    singleSupermarketTotals,
    splitAssignments,
    splitGroupedBySupermarket,
    splitSavingsVsBestSingleGbp,
    totalSavingsVsWorstGbp,
    nutritionSummary,
    budgetRemainingGbp,
    isOverBudget,
  } = params;

  if (validItemsCount === 0) {
    return [
      "Añade productos a la lista compartida para calcular el reparto óptimo entre Aldi, Lidl, Asda y Morrisons.",
    ];
  }

  const usedSupers = SUPERMARKET_IDS.filter(
    (s) => splitGroupedBySupermarket[s].length > 0
  );

  let topSuper: SupermarketId | null = null;
  let topSuperCount = 0;
  let topSuperTotal = 0;
  for (const s of usedSupers) {
    const group = splitGroupedBySupermarket[s];
    if (group.length > topSuperCount) {
      topSuper = s;
      topSuperCount = group.length;
      topSuperTotal = round2(group.reduce((sum, a) => sum + a.lineTotalGbp, 0));
    }
  }

  const modeTip = (() => {
    switch (goals.optimizationMode) {
      case "high-protein-budget": {
        const weeklyTarget = goals.dailyProteinTargetGrams * 7;
        const gap = Math.round(weeklyTarget - nutritionSummary.totalProteinGrams);
        const efficiency =
          nutritionSummary.costPer100gProteinGbp > 0
            ? `Coste proteico actual: £${nutritionSummary.costPer100gProteinGbp.toFixed(2)} por cada 100 g de proteína.`
            : "Añade alimentos proteicos para calcular el coste por 100 g de proteína.";
        if (goals.dailyProteinTargetGrams > 0 && gap > 0) {
          return `${efficiency} Faltan ~${gap} g para cubrir 7 días (${nutritionSummary.estimatedDaysCoveredProtein} días cubiertos); prioriza pechuga de pollo, skyr, huevos o atún.`;
        }
        return `${efficiency} Objetivo semanal de proteína cubierto (${nutritionSummary.estimatedDaysCoveredProtein} días).`;
      }
      case "best-calories-per-pound": {
        const kcalCost =
          nutritionSummary.costPer1000KcalGbp > 0
            ? `Rendimiento energético: £${nutritionSummary.costPer1000KcalGbp.toFixed(2)} por cada 1.000 kcal.`
            : "Añade productos con información nutricional para calcular £/1.000 kcal.";
        return `${kcalCost} La cesta cubre ~${nutritionSummary.estimatedDaysCoveredCalories} días de energía para la pareja.`;
      }
      case "single-supermarket": {
        if (!bestSingleSupermarket) {
          return "No hay un supermercado con disponibilidad para comparar compra única.";
        }
        const bestLabel = SUPERMARKET_LABELS[bestSingleSupermarket];
        const missing = singleSupermarketTotals[bestSingleSupermarket].missingItemsCount;
        if (missing > 0) {
          return `${bestLabel} es la mejor opción única, pero le faltan ${missing} producto(s). Dividir la cesta mejora la cobertura.`;
        }
        if (splitSavingsVsBestSingleGbp > 0) {
          return `En ${bestLabel} cubres toda la lista en un solo viaje; si divides entre ${usedSupers.length} súpers ahorraríais £${splitSavingsVsBestSingleGbp.toFixed(2)} extra.`;
        }
        return `En ${bestLabel} obtienes toda la lista al mejor precio de un único supermercado.`;
      }
      case "cheapest-total":
      default: {
        if (splitSavingsVsBestSingleGbp > 0 && bestSingleSupermarket) {
          return `Dividiendo la compra entre ${usedSupers.length} súpers ahorráis £${splitSavingsVsBestSingleGbp.toFixed(2)} frente a comprar todo en ${SUPERMARKET_LABELS[bestSingleSupermarket]} (y £${totalSavingsVsWorstGbp.toFixed(2)} frente a las opciones más caras).`;
        }
        return `Ahorro total de £${totalSavingsVsWorstGbp.toFixed(2)} frente a elegir las ofertas más caras de cada producto.`;
      }
    }
  })();

  const recommendations: string[] = [modeTip];

  if (topSuper && splitAssignments.length > 0) {
    recommendations.push(
      `${SUPERMARKET_LABELS[topSuper]} concentra la mayoría de la cesta (${topSuperCount} de ${splitAssignments.length} productos, £${topSuperTotal.toFixed(2)}).`
    );
  }

  if (unavailableEverywhereCount > 0) {
    recommendations.push(
      `${unavailableEverywhereCount} producto(s) no tienen stock en ninguno de los 4 supermercados y se excluyeron del total en £.`
    );
  } else if (
    bestSingleSupermarket &&
    goals.optimizationMode !== "single-supermarket" &&
    singleSupermarketTotals[bestSingleSupermarket].missingItemsCount > 0
  ) {
    const missing = singleSupermarketTotals[bestSingleSupermarket].missingItemsCount;
    recommendations.push(
      `Ningún supermercado tiene el 100% de la lista en stock (a ${SUPERMARKET_LABELS[bestSingleSupermarket]} le faltan ${missing}); la cesta dividida evita productos faltantes.`
    );
  }

  if (goals.weeklyBudgetGbp > 0) {
    if (isOverBudget) {
      recommendations.push(
        `Superáis el presupuesto semanal (£${goals.weeklyBudgetGbp.toFixed(2)}) por £${Math.abs(budgetRemainingGbp).toFixed(2)}.`
      );
    } else {
      recommendations.push(
        `Dentro del presupuesto semanal: os quedan £${budgetRemainingGbp.toFixed(2)} de margen.`
      );
    }
  }

  if (goals.optimizationMode !== "high-protein-budget" && goals.dailyProteinTargetGrams > 0) {
    const weeklyProteinTarget = goals.dailyProteinTargetGrams * 7;
    const proteinGap = Math.round(weeklyProteinTarget - nutritionSummary.totalProteinGrams);
    if (proteinGap > 0) {
      recommendations.push(
        `Faltan ~${proteinGap} g de proteína para cubrir los 7 días del objetivo conjunto (${nutritionSummary.estimatedDaysCoveredProtein} días cubiertos).`
      );
    } else {
      recommendations.push(
        `Objetivo de proteína semanal cubierto (${nutritionSummary.estimatedDaysCoveredProtein} días a ${goals.dailyProteinTargetGrams} g/día).`
      );
    }
  }

  return recommendations;
}

export function optimizeShoppingList(
  items: ShoppingListItem[],
  goals: CoupleGoals,
  options: OptimizeBasketOptions = {}
): BasketOptimizationResult {
  const { includeChecked = true } = options;
  const activeItems = includeChecked
    ? items
    : items.filter((item) => !item.checked);
  const validItems = activeItems.filter((item) => item.quantity > 0);

  const singleSupermarketTotals = createEmptySingleTotals();
  const splitAssignments: SplitBasketAssignment[] = [];
  const splitGroupedBySupermarket = createEmptyGroupedAssignments();

  let totalCalories = 0;
  let totalProteinGrams = 0;
  let totalCarbsGrams = 0;
  let totalFatGrams = 0;
  let totalWeightGrams = 0;
  let totalSavingsVsWorstGbp = 0;
  let unavailableEverywhereCount = 0;

  for (const item of validItems) {
    const availableOffers: AvailableOfferEntry[] = [];

    for (const supermarket of SUPERMARKET_IDS) {
      const offer = item.product.offers[supermarket];
      const breakdown = singleSupermarketTotals[supermarket];

      if (offer && offer.inStock) {
        const effectivePrice = getEffectiveOfferPrice(offer);
        breakdown.totalGbp += effectivePrice * item.quantity;
        breakdown.availableItemsCount += 1;
        availableOffers.push({ supermarket, offer, effectivePrice });
      } else {
        breakdown.missingItemsCount += 1;
        breakdown.missingProductIds.push(item.productId);
      }
    }

    let unitWeightGrams: number;

    if (availableOffers.length > 0) {
      const chosen = pickOptimalOffer(item, availableOffers, goals);
      const worstPrice = Math.max(
        ...availableOffers.map((entry) => entry.effectivePrice)
      );
      const unitPriceGbp = round2(chosen.effectivePrice);
      const lineTotalGbp = round2(chosen.effectivePrice * item.quantity);
      const savingsVsWorstGbp = round2(
        Math.max(0, (worstPrice - chosen.effectivePrice) * item.quantity)
      );

      totalSavingsVsWorstGbp += savingsVsWorstGbp;

      const assignment: SplitBasketAssignment = {
        itemId: item.id,
        productId: item.productId,
        canonicalName: item.product.canonicalName,
        quantity: item.quantity,
        supermarket: chosen.supermarket,
        unitPriceGbp,
        lineTotalGbp,
        savingsVsWorstGbp,
      };

      splitAssignments.push(assignment);
      splitGroupedBySupermarket[chosen.supermarket].push(assignment);

      unitWeightGrams =
        chosen.offer.weightGrams > 0
          ? chosen.offer.weightGrams
          : getFallbackWeightGrams(item);
    } else {
      unavailableEverywhereCount += 1;
      unitWeightGrams = getFallbackWeightGrams(item);
    }

    const itemWeightGrams = unitWeightGrams * item.quantity;
    const factor = itemWeightGrams / 100;

    totalWeightGrams += itemWeightGrams;
    totalCalories += factor * item.product.nutrition.caloriesPer100g;
    totalProteinGrams += factor * item.product.nutrition.proteinPer100g;
    totalCarbsGrams += factor * item.product.nutrition.carbsPer100g;
    totalFatGrams += factor * item.product.nutrition.fatPer100g;
  }

  for (const supermarket of SUPERMARKET_IDS) {
    singleSupermarketTotals[supermarket].totalGbp = round2(
      singleSupermarketTotals[supermarket].totalGbp
    );
  }

  let bestSingleSupermarket: SupermarketId | null = null;
  let bestSingleSupermarketTotalGbp = 0;

  if (validItems.length > 0) {
    const sortedSupers = [...SUPERMARKET_IDS].sort((a, b) => {
      const bdA = singleSupermarketTotals[a];
      const bdB = singleSupermarketTotals[b];
      if (bdA.missingItemsCount !== bdB.missingItemsCount) {
        return bdA.missingItemsCount - bdB.missingItemsCount;
      }
      return bdA.totalGbp - bdB.totalGbp;
    });
    bestSingleSupermarket = sortedSupers[0];
    bestSingleSupermarketTotalGbp =
      singleSupermarketTotals[bestSingleSupermarket].totalGbp;
  }

  const splitBasketTotalGbp = round2(
    splitAssignments.reduce((sum, assignment) => sum + assignment.lineTotalGbp, 0)
  );

  const splitSavingsVsBestSingleGbp =
    bestSingleSupermarket !== null
      ? Math.max(0, round2(bestSingleSupermarketTotalGbp - splitBasketTotalGbp))
      : 0;

  const activeTotal =
    goals.optimizationMode === "single-supermarket" &&
    bestSingleSupermarket !== null
      ? bestSingleSupermarketTotalGbp
      : splitBasketTotalGbp;

  const roundedCalories = round2(totalCalories);
  const roundedProtein = round2(totalProteinGrams);
  const roundedCarbs = round2(totalCarbsGrams);
  const roundedFat = round2(totalFatGrams);
  const roundedWeight = round2(totalWeightGrams);

  const nutritionSummary: BasketNutritionSummary = {
    totalCalories: roundedCalories,
    totalProteinGrams: roundedProtein,
    totalCarbsGrams: roundedCarbs,
    totalFatGrams: roundedFat,
    totalWeightGrams: roundedWeight,
    costPer1000KcalGbp:
      roundedCalories > 0 ? round2((activeTotal / roundedCalories) * 1000) : 0,
    costPer100gProteinGbp:
      roundedProtein > 0 ? round2((activeTotal / roundedProtein) * 100) : 0,
    estimatedDaysCoveredCalories:
      goals.dailyCaloriesTargetTotal > 0
        ? round2(roundedCalories / goals.dailyCaloriesTargetTotal)
        : 0,
    estimatedDaysCoveredProtein:
      goals.dailyProteinTargetGrams > 0
        ? round2(roundedProtein / goals.dailyProteinTargetGrams)
        : 0,
  };

  const budgetRemainingGbp = round2(goals.weeklyBudgetGbp - activeTotal);
  const isOverBudget = budgetRemainingGbp < 0;

  const recommendations = buildRecommendations({
    validItemsCount: validItems.length,
    unavailableEverywhereCount,
    goals,
    bestSingleSupermarket,
    singleSupermarketTotals,
    splitAssignments,
    splitGroupedBySupermarket,
    splitSavingsVsBestSingleGbp,
    totalSavingsVsWorstGbp: round2(totalSavingsVsWorstGbp),
    nutritionSummary,
    budgetRemainingGbp,
    isOverBudget,
  });

  return {
    singleSupermarketTotals,
    bestSingleSupermarket,
    bestSingleSupermarketTotalGbp,
    splitBasketTotalGbp,
    splitSavingsVsBestSingleGbp,
    splitAssignments,
    splitGroupedBySupermarket,
    nutritionSummary,
    budgetRemainingGbp,
    isOverBudget,
    recommendations,
  };
}
