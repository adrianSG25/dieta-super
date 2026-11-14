import type {
  ComparedProduct,
  SupermarketId,
} from "@/types/dietasuper";
import { SUPERMARKET_IDS } from "@/types/dietasuper";
import { getEffectiveOfferPrice } from "@/lib/optimizer/basket";

export type RecipeCategory =
  | "all"
  | "steaks-sweet-potato"
  | "pasta"
  | "fish-veg";

export interface WeeklyRecipeIngredient {
  productId: string;
  quantity: number;
  usageNote: string;
}

export interface WeeklyRecipe {
  id: string;
  title: string;
  englishSubtitle: string;
  category: Exclude<RecipeCategory, "all">;
  prepMinutes: number;
  servings: number;
  tags: string[];
  steps: string[];
  ingredients: WeeklyRecipeIngredient[];
}

export type BudgetProfileId =
  | "balanced-couple"
  | "high-protein"
  | "max-savings";

export interface BudgetRecommendationItem {
  product: ComparedProduct;
  quantity: number;
  cheapestSupermarket: SupermarketId;
  unitPriceGbp: number;
  lineTotalGbp: number;
  reason: string;
}

export interface BudgetRecommendationResult {
  targetBudgetGbp: number;
  totalCostGbp: number;
  remainingBudgetGbp: number;
  totalCalories: number;
  totalProteinGrams: number;
  estimatedDaysCouple: number;
  items: BudgetRecommendationItem[];
}

export interface RecipeResolvedIngredient {
  ingredient: WeeklyRecipeIngredient;
  product: ComparedProduct | null;
  cheapestSupermarket: SupermarketId | null;
  unitPriceGbp: number;
  lineTotalGbp: number;
  totalGrams: number;
  calories: number;
  proteinGrams: number;
}

export interface RecipeMetricsResult {
  recipeId: string;
  totalCostGbp: number;
  costPerServingGbp: number;
  totalCalories: number;
  caloriesPerServing: number;
  totalProteinGrams: number;
  proteinPerServing: number;
  resolvedIngredients: RecipeResolvedIngredient[];
}

export interface BudgetProfileInfo {
  id: BudgetProfileId;
  name: string;
  description: string;
  badge: string;
}

export const BUDGET_PROFILE_INFOS: BudgetProfileInfo[] = [
  {
    id: "balanced-couple",
    name: "Equilibrado Pareja",
    description:
      "Balance óptimo entre proteínas magras, hidratos saciantes, verduras frescas y fruta diaria.",
    badge: "Más equilibrado",
  },
  {
    id: "high-protein",
    name: "Alto en Proteína",
    description:
      "Máxima densidad proteica por libra: pollo, ternera 5%, pavo, huevos, skyr y atún.",
    badge: "Fitness",
  },
  {
    id: "max-savings",
    name: "Ahorro Máximo",
    description:
      "Mayor volumen de comida y calorías por libra priorizando básicos económicos y discounters.",
    badge: "Máximo ahorro",
  },
];

function round2(value: number): number {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return rounded === 0 ? 0 : rounded;
}

function getProductItemWeight(
  product: ComparedProduct,
  preferredSupermarket?: SupermarketId | null,
): number {
  if (preferredSupermarket) {
    const offer = product.offers[preferredSupermarket];
    if (offer && offer.weightGrams > 0) return offer.weightGrams;
  }
  for (const s of SUPERMARKET_IDS) {
    const offer = product.offers[s];
    if (offer && offer.weightGrams > 0) return offer.weightGrams;
  }
  return 100;
}

/**
 * Devuelve la oferta más económica de un producto entre los supermercados analizados.
 * Prioriza ofertas con inStock: true. Si ninguna estuviera marcada en stock, usa la más barata existente.
 */
export function getCheapestOfferForProduct(product: ComparedProduct): {
  supermarket: SupermarketId;
  unitPriceGbp: number;
  weightGrams: number;
} | null {
  let bestInStock: {
    supermarket: SupermarketId;
    unitPriceGbp: number;
    weightGrams: number;
  } | null = null;

  let bestAny: {
    supermarket: SupermarketId;
    unitPriceGbp: number;
    weightGrams: number;
  } | null = null;

  for (const supermarket of SUPERMARKET_IDS) {
    const offer = product.offers[supermarket];
    if (!offer) continue;
    const price = getEffectiveOfferPrice(offer);
    if (price <= 0) continue;

    const candidate = {
      supermarket,
      unitPriceGbp: price,
      weightGrams: offer.weightGrams > 0 ? offer.weightGrams : 100,
    };

    if (offer.inStock) {
      if (!bestInStock || price < bestInStock.unitPriceGbp) {
        bestInStock = candidate;
      }
    }

    if (!bestAny || price < bestAny.unitPriceGbp) {
      bestAny = candidate;
    }
  }

  return bestInStock ?? bestAny;
}

/**
 * Catálogo de exactamente 10 recetas semanales sencillas con ingredientes disponibles en supermercados UK.
 */
export const WEEKLY_RECIPES: WeeklyRecipe[] = [
  {
    id: "rec-sirloin-sweet-potato",
    title:
      "Filetes de Ternera Sirloin con Sweet Potato al Horno y Brócoli Tenderstem",
    englishSubtitle:
      "Sirloin Steak with Baked Sweet Potato & Tenderstem Broccoli",
    category: "steaks-sweet-potato",
    prepMinutes: 25,
    servings: 2,
    tags: ["Alta en proteína", "Cena rápida", "Sin complicaciones"],
    ingredients: [
      {
        productId: "mf-beef-sirloin-steak-227g",
        quantity: 2,
        usageNote: "2 filetes sirloin (454g)",
      },
      {
        productId: "fv-sweet-potatoes-1kg",
        quantity: 1,
        usageNote: "2 boniatos medianos al horno o air-fryer",
      },
      {
        productId: "fv-tenderstem-broccoli-200g",
        quantity: 1,
        usageNote: "1 paquete salteado o al vapor",
      },
      {
        productId: "pbd-oil-cooking-spray-200ml",
        quantity: 1,
        usageNote: "Spray 1 kcal para sellar y hornear",
      },
    ],
    steps: [
      "Corta el boniato en bastones o rodajas, aplica spray de aceite y salpimienta. Cocina 20 min en air-fryer a 195°C o al horno hasta que dore.",
      "Seca los filetes sirloin con papel y calienta la sartén a fuego vivo con un toque de spray. Séllalos 2-3 min por lado al punto deseado.",
      "En la misma sartén o al vapor, saltea el brócoli tenderstem durante 4 min hasta que quede al dente con un toque crujiente.",
    ],
  },
  {
    id: "rec-rump-sweet-potato-mash",
    title:
      "Filetes Rump Steak a la Plancha con Puré de Sweet Potato y Espárragos",
    englishSubtitle: "Rump Steak with Sweet Potato Mash & Asparagus",
    category: "steaks-sweet-potato",
    prepMinutes: 25,
    servings: 2,
    tags: ["Filetes + Sweet Potato", "Saciante"],
    ingredients: [
      {
        productId: "mf-beef-rump-steak-250g",
        quantity: 2,
        usageNote: "2 filetes rump (500g)",
      },
      {
        productId: "fv-sweet-potatoes-1kg",
        quantity: 1,
        usageNote: "600g para puré suave",
      },
      {
        productId: "fv-asparagus-tips-250g",
        quantity: 1,
        usageNote: "1 manojo a la plancha",
      },
      {
        productId: "dep-salted-butter-250g",
        quantity: 1,
        usageNote: "1 nuez de mantequilla para el puré",
      },
    ],
    steps: [
      "Pela y hierve o asa el boniato 15 min hasta que esté tierno. Cháfalo con un tenedor añadiendo la nuez de mantequilla y sal al gusto.",
      "Cocina los filetes rump steak en plancha muy caliente durante 2.5 min por cara para mantener la carne tierna y jugosa.",
      "Saltea los espárragos trigueros a fuego vivo 3-4 min con sal y pimienta negra recién molida antes de emplatar.",
    ],
  },
  {
    id: "rec-chicken-sweet-potato-spinach",
    title:
      "Filetes de Pechuga de Pollo con Dados de Sweet Potato en Air-Fryer y Espinacas",
    englishSubtitle:
      "Chicken Breast Fillets with Air-Fryer Sweet Potato & Baby Spinach",
    category: "steaks-sweet-potato",
    prepMinutes: 20,
    servings: 2,
    tags: ["Bajo en grasa", "Meal prep", "Fitness"],
    ingredients: [
      {
        productId: "mf-chicken-breast-650g",
        quantity: 1,
        usageNote: "2-3 filetes de pechuga (650g)",
      },
      {
        productId: "fv-sweet-potatoes-1kg",
        quantity: 1,
        usageNote: "500g en dados crujientes",
      },
      {
        productId: "fv-baby-spinach-240g",
        quantity: 1,
        usageNote: "Media bolsa salteada con ajo/limón",
      },
      {
        productId: "fv-lemons-unwaxed-4pack",
        quantity: 1,
        usageNote: "Zumo de medio limón al final",
      },
    ],
    steps: [
      "Corta el boniato en dados pequeños y hazlo en air-fryer 15-18 min a 200°C con spray de aceite hasta que queden crujientes.",
      "Filetea las pechugas de pollo y cocínalas a la plancha 3-4 min por cara hasta dorar bien por fuera y jugoso dentro.",
      "Saltea las espinacas baby 1-2 min en la sartén caliente, retira y aliña con el zumo de medio limón fresco.",
    ],
  },
  {
    id: "rec-turkey-steaks-sweet-potato",
    title:
      "Filetes de Pechuga de Pavo con Sweet Potato Rústico y Pimientos Asados",
    englishSubtitle:
      "Turkey Breast Steaks with Roast Sweet Potato & Mixed Peppers",
    category: "steaks-sweet-potato",
    prepMinutes: 22,
    servings: 2,
    tags: ["Extra magra", "Todo en bandeja"],
    ingredients: [
      {
        productId: "mf-turkey-breast-steaks-400g",
        quantity: 1,
        usageNote: "Pack 400g filetes de pavo",
      },
      {
        productId: "fv-sweet-potatoes-1kg",
        quantity: 1,
        usageNote: "500g en gajos",
      },
      {
        productId: "fv-peppers-mixed-3pack",
        quantity: 1,
        usageNote: "2 pimientos en tiras",
      },
      {
        productId: "fv-onions-red-3pack",
        quantity: 1,
        usageNote: "1 cebolla roja en gajos",
      },
    ],
    steps: [
      "Coloca en una bandeja o cesta de air-fryer el boniato en gajos, los pimientos en tiras y la cebolla roja con especias 18 min.",
      "Sazona los filetes de pavo con orégano, sal y pimienta. Dóralos en sartén con spray 3 min por lado sin secarlos.",
      "Sirve los filetes junto a la guarnición asada de boniato rústico y pimientos caramelizados.",
    ],
  },
  {
    id: "rec-penne-bolognese-5pct",
    title: "Pasta Penne Boloñesa Fitness con Ternera Magra 5%",
    englishSubtitle: "Lean 5% Beef Penne Bolognese",
    category: "pasta",
    prepMinutes: 20,
    servings: 4,
    tags: ["4 raciones", "Tupper semana", "Alta en proteína"],
    ingredients: [
      {
        productId: "pbd-penne-pasta-500g",
        quantity: 1,
        usageNote: "250-350g pasta penne",
      },
      {
        productId: "mf-lean-beef-mince-5pct-500g",
        quantity: 1,
        usageNote: "1 bandeja ternera picada 5% (500g)",
      },
      {
        productId: "pbd-passata-500g",
        quantity: 1,
        usageNote: "1 brick de passata de tomate",
      },
      {
        productId: "fv-onions-brown-1kg",
        quantity: 1,
        usageNote: "1 cebolla picada",
      },
      {
        productId: "dep-grated-lighter-cheddar-250g",
        quantity: 1,
        usageNote: "Puñado ligero por encima",
      },
    ],
    steps: [
      "Hierve la pasta penne en agua abundante con sal durante 10-11 min al dente; reserva medio vaso de agua de cocción.",
      "Pica la cebolla y póchala 3 min; añade la ternera picada 5% y cocina hasta dorar bien. Vierte la passata y reduce 8 min a fuego medio.",
      "Mezcla la pasta con la salsa boloñesa y sirve caliente con una lluvia de cheddar ligero rallado.",
    ],
  },
  {
    id: "rec-fusilli-chicken-pesto",
    title:
      "Pasta Fusilli Integral con Pollo, Pesto Verde, Cherrys y Mozzarella Light",
    englishSubtitle:
      "Wholewheat Chicken Pesto Pasta with Cherry Tomatoes & Light Mozzarella",
    category: "pasta",
    prepMinutes: 15,
    servings: 3,
    tags: ["15 min", "Sencilla", "Integral"],
    ingredients: [
      {
        productId: "pbd-wholegrain-fusilli-500g",
        quantity: 1,
        usageNote: "300g fusilli integral",
      },
      {
        productId: "mf-chicken-breast-650g",
        quantity: 1,
        usageNote: "450g en tiras doradas",
      },
      {
        productId: "pbd-pesto-green-190g",
        quantity: 1,
        usageNote: "3 cucharadas de pesto verde",
      },
      {
        productId: "fv-cherry-tomatoes-250g",
        quantity: 1,
        usageNote: "1 tarrina partidos por la mitad",
      },
      {
        productId: "dep-mozzarella-light-125g",
        quantity: 1,
        usageNote: "1 bola troceada",
      },
    ],
    steps: [
      "Hierve el fusilli integral 9-10 min en agua con sal. Mientras, saltea las tiras de pechuga con sal y pimienta 5 min hasta dorar.",
      "Añade los tomates cherry cortados por la mitad a la sartén del pollo durante 2 min para que suelten su jugo.",
      "Escurre la pasta, integra el pesto verde, el pollo con los cherrys y termina con dados de mozzarella light fresca.",
    ],
  },
  {
    id: "rec-spaghetti-creamy-turkey",
    title: "Espaguetis Cremosos con Pavo Picado 5%, Champiñones y Espinacas",
    englishSubtitle: "Creamy Turkey Mince Spaghetti with Mushrooms & Spinach",
    category: "pasta",
    prepMinutes: 18,
    servings: 3,
    tags: ["Cremosa ligera", "Alta en proteína"],
    ingredients: [
      {
        productId: "pbd-spaghetti-500g",
        quantity: 1,
        usageNote: "300g espaguetis",
      },
      {
        productId: "mf-turkey-mince-5pct-500g",
        quantity: 1,
        usageNote: "1 bandeja pavo picado 5% (500g)",
      },
      {
        productId: "fv-mushrooms-closed-cup-300g",
        quantity: 1,
        usageNote: "1 tarrina laminados",
      },
      {
        productId: "dep-lighter-cream-cheese-200g",
        quantity: 1,
        usageNote: "2-3 cucharadas con agua de cocción",
      },
      {
        productId: "fv-baby-spinach-240g",
        quantity: 1,
        usageNote: "2 puñados grandes al final",
      },
    ],
    steps: [
      "Cuece los espaguetis al dente 8-9 min y reserva una taza de agua de cocción con almidón.",
      "Dora el pavo picado 5% junto a los champiñones laminados en una sartén amplia durante 6-7 min hasta que evaporen el agua.",
      "Agrega el queso crema ligero con un chorro de agua de cocción para formar la salsa cremosa; añade las espinacas hasta que reduzcan y mezcla la pasta.",
    ],
  },
  {
    id: "rec-tuna-pasta-bake",
    title: "Tuna Pasta Bake Proteico con Tomate y Mozzarella Gratinada",
    englishSubtitle: "High-Protein Cheesy Tuna Pasta Bake",
    category: "pasta",
    prepMinutes: 25,
    servings: 4,
    tags: ["Muy económica", "4 raciones", "Despensa"],
    ingredients: [
      {
        productId: "pbd-penne-pasta-500g",
        quantity: 1,
        usageNote: "350g pasta penne",
      },
      {
        productId: "mf-tuna-in-springwater-4x145g",
        quantity: 1,
        usageNote: "2-3 latas de atún al natural",
      },
      {
        productId: "pbd-chopped-tomatoes-4pk",
        quantity: 1,
        usageNote: "2 latas de tomate troceado",
      },
      {
        productId: "dep-grated-mozzarella-250g",
        quantity: 1,
        usageNote: "100g para gratinar",
      },
      {
        productId: "fv-peppers-mixed-3pack",
        quantity: 1,
        usageNote: "1-2 pimientos en dados",
      },
    ],
    steps: [
      "Hierve el penne 2 min menos del tiempo indicado para que termine su cocción en el horno; sofríe los pimientos en dados 4 min.",
      "Mezcla la pasta con el tomate troceado, el atún escurrido, orégano y los pimientos; pasa todo a una fuente de horno.",
      "Cubre con la mozzarella rallada y hornea a 200°C durante 12-15 min hasta que el queso esté dorado y burbujeante.",
    ],
  },
  {
    id: "rec-salmon-sweet-potato",
    title: "Salmón Escocés al Horno con Sweet Potato y Brócoli",
    englishSubtitle: "Baked Scottish Salmon with Sweet Potato & Broccoli",
    category: "fish-veg",
    prepMinutes: 22,
    servings: 2,
    tags: ["Omega 3", "Sin complicaciones"],
    ingredients: [
      {
        productId: "mf-fresh-salmon-fillets-240g",
        quantity: 1,
        usageNote: "1 pack (2 filetes frescos)",
      },
      {
        productId: "fv-sweet-potatoes-1kg",
        quantity: 1,
        usageNote: "500g en cubos asados",
      },
      {
        productId: "fv-broccoli-fresh-350g",
        quantity: 1,
        usageNote: "1 pieza en ramilletes",
      },
      {
        productId: "fv-lemons-unwaxed-4pack",
        quantity: 1,
        usageNote: "Rodajas de limón y pimienta",
      },
    ],
    steps: [
      "Asa los cubos de boniato 15 min a 200°C en air-fryer u horno con sal y pimienta.",
      "Coloca los lomos de salmón en una bandeja con rodajas de limón encima y los ramilletes de brócoli alrededor.",
      "Hornea todo junto durante 10-12 min hasta que el salmón esté tierno y el brócoli tostado en las puntas.",
    ],
  },
  {
    id: "rec-pork-loin-wedges",
    title: "Filetes de Lomo de Cerdo con Patatas Gajo y Ensalada Bistró",
    englishSubtitle: "Pork Loin Steaks with Seasoned Wedges & Bistro Salad",
    category: "fish-veg",
    prepMinutes: 20,
    servings: 2,
    tags: ["Económica", "Rápida"],
    ingredients: [
      {
        productId: "mf-pork-loin-steaks-500g",
        quantity: 1,
        usageNote: "Pack 500g filetes de lomo",
      },
      {
        productId: "fv-frozen-potato-wedges-750g",
        quantity: 1,
        usageNote: "1 bolsa al horno/air-fryer",
      },
      {
        productId: "fv-bistro-salad-mix-160g",
        quantity: 1,
        usageNote: "1 bolsa ensalada lista",
      },
      {
        productId: "fv-cherry-tomatoes-250g",
        quantity: 1,
        usageNote: "1 puñado de tomates cherry",
      },
    ],
    steps: [
      "Cocina las patatas gajo congeladas en air-fryer u horno a 200°C durante 16-18 min hasta que estén doradas y crujientes.",
      "Marca los filetes de lomo de cerdo en sartén o parrilla bien caliente 2-3 min por lado con ajo en polvo y sal.",
      "Monta el plato con la ensalada bistró fresca y los tomates cherry como guarnición ligera y refrescante.",
    ],
  },
];

/**
 * Calcula las métricas nutricionales y de coste de una receta semanal.
 */
export function computeRecipeMetrics(
  recipe: WeeklyRecipe,
  catalogById: Map<string, ComparedProduct>,
): RecipeMetricsResult {
  let totalCostGbp = 0;
  let totalCalories = 0;
  let totalProteinGrams = 0;

  const resolvedIngredients: RecipeResolvedIngredient[] = [];

  for (const ing of recipe.ingredients) {
    const product = catalogById.get(ing.productId) ?? null;
    const cheapest = product ? getCheapestOfferForProduct(product) : null;
    const unitPriceGbp = cheapest ? cheapest.unitPriceGbp : 0;
    const lineTotalGbp = round2(unitPriceGbp * ing.quantity);
    const weightGrams = product
      ? getProductItemWeight(product, cheapest?.supermarket)
      : 100;
    const totalGrams = weightGrams * ing.quantity;

    const calories = product
      ? Math.round((totalGrams * product.nutrition.caloriesPer100g) / 100)
      : 0;
    const proteinGrams = product
      ? round2((totalGrams * product.nutrition.proteinPer100g) / 100)
      : 0;

    totalCostGbp += lineTotalGbp;
    totalCalories += calories;
    totalProteinGrams += proteinGrams;

    resolvedIngredients.push({
      ingredient: ing,
      product,
      cheapestSupermarket: cheapest ? cheapest.supermarket : null,
      unitPriceGbp,
      lineTotalGbp,
      totalGrams,
      calories,
      proteinGrams,
    });
  }

  const servings = Math.max(recipe.servings, 1);
  const costTotal = round2(totalCostGbp);

  return {
    recipeId: recipe.id,
    totalCostGbp: costTotal,
    costPerServingGbp: round2(costTotal / servings),
    totalCalories: Math.round(totalCalories),
    caloriesPerServing: Math.round(totalCalories / servings),
    totalProteinGrams: round2(totalProteinGrams),
    proteinPerServing: round2(totalProteinGrams / servings),
    resolvedIngredients,
  };
}

interface ProfileItemConfig {
  productId: string;
  reason: string;
  maxQty: number;
}

const BUDGET_CONFIGS: Record<BudgetProfileId, ProfileItemConfig[]> = {
  "balanced-couple": [
    {
      productId: "mf-chicken-breast-1kg",
      reason: "Proteína magra base para comidas y tuppers de la semana",
      maxQty: 2,
    },
    {
      productId: "mf-lean-beef-mince-5pct-500g",
      reason: "Ternera magra 5% para boloñesa o hamburguesas caseras",
      maxQty: 2,
    },
    {
      productId: "mf-beef-sirloin-steak-227g",
      reason: "Filetes de ternera sirloin para cena de pareja",
      maxQty: 2,
    },
    {
      productId: "mf-fresh-salmon-fillets-240g",
      reason: "Omega 3 y proteína de alta calidad para cena especial",
      maxQty: 1,
    },
    {
      productId: "dep-free-range-eggs-12",
      reason: "Básico diario indispensable para desayunos o cenas rápidas",
      maxQty: 2,
    },
    {
      productId: "dep-greek-style-yogurt-fat-free-500g",
      reason: "Yogur alto en proteína para meriendas, batidos o postres",
      maxQty: 2,
    },
    {
      productId: "dep-semi-skimmed-milk-2l",
      reason: "Leche fresca 2L para café, avena y batidos diarios",
      maxQty: 2,
    },
    {
      productId: "fv-sweet-potatoes-1kg",
      reason: "Guarnición limpia y saciante al horno, puré o air-fryer",
      maxQty: 2,
    },
    {
      productId: "pbd-basmati-rice-1kg",
      reason: "Arroz aromático base para meal prep y acompañamientos",
      maxQty: 1,
    },
    {
      productId: "pbd-wholegrain-fusilli-500g",
      reason: "Pasta integral saciante de absorción lenta",
      maxQty: 2,
    },
    {
      productId: "pbd-porridge-oats-1kg",
      reason: "Avena saciante para gachas y porridge matutino",
      maxQty: 2,
    },
    {
      productId: "pbd-wholemeal-bread-800g",
      reason: "Tostadas matutinas ricas en fibra natural",
      maxQty: 1,
    },
    {
      productId: "fv-broccoli-fresh-350g",
      reason: "Verdura verde rica en fibra, ácido fólico y micronutrientes",
      maxQty: 2,
    },
    {
      productId: "fv-baby-spinach-240g",
      reason: "Espinacas frescas para salteados, tortillas o ensaladas",
      maxQty: 2,
    },
    {
      productId: "fv-peppers-mixed-3pack",
      reason: "Pimientos ricos en vitamina C para sofritos y asados",
      maxQty: 1,
    },
    {
      productId: "fv-onions-brown-1kg",
      reason: "Base aromática indispensable para todas las recetas",
      maxQty: 1,
    },
    {
      productId: "pbd-passata-500g",
      reason: "Tomate colado limpio para salsas y platos de pasta",
      maxQty: 2,
    },
    {
      productId: "fv-bananas-5pack",
      reason: "Fruta energética rápida pre-entreno y desayuno",
      maxQty: 2,
    },
    {
      productId: "fv-apples-gala-6pack",
      reason: "Snack fresco y crujiente para media tarde",
      maxQty: 1,
    },
    {
      productId: "fv-avocados-ripe-2pack",
      reason: "Grasas cardiosaludables para ensaladas y tostadas",
      maxQty: 1,
    },
    {
      productId: "pbd-peanut-butter-smooth-340g",
      reason: "Grasa saludable y saciedad para fruta, tostadas o avena",
      maxQty: 1,
    },
  ],
  "high-protein": [
    {
      productId: "mf-chicken-breast-1kg",
      reason: "Máxima proteína magra por libra para ambos miembros",
      maxQty: 3,
    },
    {
      productId: "mf-lean-beef-mince-5pct-500g",
      reason: "Ternera picada 5% con altísimo ratio proteína/grasa",
      maxQty: 2,
    },
    {
      productId: "mf-turkey-mince-5pct-500g",
      reason: "Pavo picado 5% extra limpio para variar comidas proteicas",
      maxQty: 2,
    },
    {
      productId: "mf-beef-rump-steak-250g",
      reason: "Filetes rump ricos en hierro, creatina y proteína",
      maxQty: 2,
    },
    {
      productId: "dep-free-range-eggs-15",
      reason: "Pack familiar de 15 huevos camperos proteicos",
      maxQty: 2,
    },
    {
      productId: "dep-skyr-natural-450g",
      reason: "Skyr islandés con ~48g de proteína limpia por tarrina",
      maxQty: 3,
    },
    {
      productId: "dep-greek-style-yogurt-fat-free-500g",
      reason: "Yogur griego 0% cremoso y saciante",
      maxQty: 2,
    },
    {
      productId: "mf-tuna-in-springwater-4x145g",
      reason: "Pack 4 latas de atún al natural: proteína pura de despensa",
      maxQty: 2,
    },
    {
      productId: "dep-high-protein-tortilla-wraps-6x",
      reason: "Wraps proteicos para almuerzos y cenas fitness rápidas",
      maxQty: 2,
    },
    {
      productId: "dep-cottage-cheese-natural-300g",
      reason: "Queso cottage bajo en grasa con caseína de absorción lenta",
      maxQty: 2,
    },
    {
      productId: "dep-semi-skimmed-milk-2l",
      reason: "Leche fresca para batidos y gachas proteicas matutinas",
      maxQty: 1,
    },
    {
      productId: "fv-sweet-potatoes-1kg",
      reason: "Carbohidrato limpio para recarga muscular y saciedad",
      maxQty: 2,
    },
    {
      productId: "pbd-basmati-rice-1kg",
      reason: "Arroz blanco de digestión óptima post-entrenamiento",
      maxQty: 1,
    },
    {
      productId: "pbd-porridge-oats-1kg",
      reason: "Avena para bowls proteicos con fruta y requesón",
      maxQty: 2,
    },
    {
      productId: "fv-tenderstem-broccoli-200g",
      reason: "Brócoli tenderstem al vapor o plancha",
      maxQty: 2,
    },
    {
      productId: "fv-baby-spinach-240g",
      reason: "Espinacas baby para batidos verdes y tortillas",
      maxQty: 2,
    },
    {
      productId: "fv-bananas-5pack",
      reason: "Potasio y energía rápida previa a entrenamientos",
      maxQty: 2,
    },
    {
      productId: "pbd-peanut-butter-smooth-340g",
      reason: "Calorías y grasas buenas para el balance energético",
      maxQty: 1,
    },
    {
      productId: "pbd-oil-cooking-spray-200ml",
      reason: "Control milimétrico de aceite en sartén y horno",
      maxQty: 1,
    },
  ],
  "max-savings": [
    {
      productId: "dep-free-range-eggs-15",
      reason: "La proteína más económica y nutritiva por libra en el súper",
      maxQty: 2,
    },
    {
      productId: "pbd-porridge-oats-1kg",
      reason: "Desayuno saciante y nutritivo por menos de £1 por kilo",
      maxQty: 2,
    },
    {
      productId: "pbd-basmati-rice-1kg",
      reason: "Carbohidrato base ultrasaludable y económico para la semana",
      maxQty: 2,
    },
    {
      productId: "pbd-penne-pasta-500g",
      reason: "Pasta penne económica para comidas y tuppers rápidos",
      maxQty: 3,
    },
    {
      productId: "pbd-spaghetti-500g",
      reason: "Espaguetis de despensa a precio mínimo garantizado",
      maxQty: 2,
    },
    {
      productId: "mf-chicken-breast-1kg",
      reason: "Pechuga de pollo 1kg con mejor precio por gramo de carne",
      maxQty: 2,
    },
    {
      productId: "mf-pork-loin-steaks-500g",
      reason: "Filetes de lomo de cerdo: carne magra muy asequible",
      maxQty: 2,
    },
    {
      productId: "mf-turkey-mince-5pct-500g",
      reason: "Pavo picado 5% más asequible que la ternera para sofritos",
      maxQty: 2,
    },
    {
      productId: "mf-tuna-in-springwater-4x145g",
      reason: "Atún pack 4x versátil, proteico y de larga duración",
      maxQty: 2,
    },
    {
      productId: "dep-semi-skimmed-milk-2l",
      reason: "Leche 2L esencial con excelente ratio coste/calorías",
      maxQty: 2,
    },
    {
      productId: "pbd-wholemeal-bread-800g",
      reason: "Hogaza 800g integral para tostadas y sándwiches",
      maxQty: 2,
    },
    {
      productId: "fv-sweet-potatoes-1kg",
      reason: "Boniato 1kg saciante con excelente precio en discounters",
      maxQty: 2,
    },
    {
      productId: "fv-carrots-1kg",
      reason: "Zanahorias 1kg: verdura duradera, versátil y económica",
      maxQty: 1,
    },
    {
      productId: "fv-onions-brown-1kg",
      reason: "Bolsa de cebollas 1kg indispensable para cocinar barato",
      maxQty: 1,
    },
    {
      productId: "pbd-chopped-tomatoes-4pk",
      reason: "Pack 4 latas de tomate: base económica de salsas caseras",
      maxQty: 2,
    },
    {
      productId: "pbd-passata-500g",
      reason: "Tomate colado a precio accesible para enriquecer pastas",
      maxQty: 2,
    },
    {
      productId: "fv-broccoli-fresh-350g",
      reason: "Brócoli fresco para raciones de verdura equilibradas",
      maxQty: 2,
    },
    {
      productId: "fv-bananas-5pack",
      reason: "La fruta más económica y energética del carrito semanal",
      maxQty: 2,
    },
    {
      productId: "fv-apples-gala-6pack",
      reason: "Bolsa 6 manzanas para meriendas saludables y económicas",
      maxQty: 1,
    },
    {
      productId: "pbd-peanut-butter-smooth-340g",
      reason: "Gran densidad calórica y saciedad a coste mínimo",
      maxQty: 1,
    },
  ],
};

/**
 * Algoritmo de recomendación inteligente por presupuesto (ej. £50, £60, £75, £100).
 * Maximiza el aprovechamiento del presupuesto (~95%-99.5%) sin exceder targetBudgetGbp.
 */
export function buildBudgetRecommendation(
  budgetGbp: number,
  profile: BudgetProfileId,
  catalog: ComparedProduct[],
  dailyCaloriesTargetTotal = 4200,
): BudgetRecommendationResult {
  const targetBudgetGbp = Math.max(round2(budgetGbp), 0);

  if (targetBudgetGbp <= 0) {
    return {
      targetBudgetGbp: 0,
      totalCostGbp: 0,
      remainingBudgetGbp: 0,
      totalCalories: 0,
      totalProteinGrams: 0,
      estimatedDaysCouple: 0,
      items: [],
    };
  }

  const catalogMap = new Map<string, ComparedProduct>(
    catalog.map((p) => [p.id, p]),
  );

  const profileConfigs = BUDGET_CONFIGS[profile] ?? BUDGET_CONFIGS["balanced-couple"];

  // Indexamos las mejores ofertas disponibles para cada producto del perfil
  const eligibleProducts: {
    config: ProfileItemConfig;
    product: ComparedProduct;
    cheapest: {
      supermarket: SupermarketId;
      unitPriceGbp: number;
      weightGrams: number;
    };
  }[] = [];

  for (const cfg of profileConfigs) {
    const product = catalogMap.get(cfg.productId);
    if (!product) continue;
    const cheapest = getCheapestOfferForProduct(product);
    if (!cheapest || cheapest.unitPriceGbp <= 0) continue;
    eligibleProducts.push({ config: cfg, product, cheapest });
  }

  let remaining = targetBudgetGbp;
  const quantities = new Map<string, number>();

  // Fase 1: Añadir 1 unidad de cada producto que quepa en el presupuesto restante
  for (const item of eligibleProducts) {
    const price = item.cheapest.unitPriceGbp;
    if (price <= remaining) {
      quantities.set(item.config.productId, 1);
      remaining = round2(remaining - price);
    }
  }

  // Fase 2: Con el presupuesto sobrante, añadir unidades adicionales (hasta maxQty)
  // para aprovechar el 95-99.5% del presupuesto sin sobrepasar targetBudgetGbp.
  // Para presupuestos elevados (ej. £70-£120), escalamos el límite superior de unidades.
  const budgetMultiplier =
    targetBudgetGbp >= 90 ? 2.2 : targetBudgetGbp >= 65 ? 1.5 : 1;

  let addedAny = true;
  while (addedAny && remaining > 0.3) {
    addedAny = false;
    for (const item of eligibleProducts) {
      const pid = item.config.productId;
      const currentQty = quantities.get(pid) ?? 0;
      const effectiveMaxQty = Math.ceil(item.config.maxQty * budgetMultiplier);
      if (currentQty >= effectiveMaxQty) continue;

      const price = item.cheapest.unitPriceGbp;
      if (price <= remaining) {
        quantities.set(pid, currentQty + 1);
        remaining = round2(remaining - price);
        addedAny = true;
      }
    }
  }

  // Construir los ítems resultantes manteniendo el orden prioritario del perfil
  const items: BudgetRecommendationItem[] = [];
  let totalCostGbp = 0;

  for (const item of eligibleProducts) {
    const pid = item.config.productId;
    const qty = quantities.get(pid) ?? 0;
    if (qty <= 0) continue;

    const unitPriceGbp = item.cheapest.unitPriceGbp;
    const lineTotalGbp = round2(unitPriceGbp * qty);
    totalCostGbp = round2(totalCostGbp + lineTotalGbp);

    items.push({
      product: item.product,
      quantity: qty,
      cheapestSupermarket: item.cheapest.supermarket,
      unitPriceGbp,
      lineTotalGbp,
      reason: item.config.reason,
    });
  }

  // Salvaguarda: si por algún redondeo marginal totalCostGbp > targetBudgetGbp,
  // recortamos del último producto con qty > 1
  if (totalCostGbp > targetBudgetGbp) {
    for (let i = items.length - 1; i >= 0 && totalCostGbp > targetBudgetGbp; i--) {
      const it = items[i];
      if (it.quantity > 1) {
        it.quantity -= 1;
        it.lineTotalGbp = round2(it.unitPriceGbp * it.quantity);
        totalCostGbp = round2(
          items.reduce((acc, curr) => acc + curr.lineTotalGbp, 0),
        );
      }
    }
  }

  const remainingBudgetGbp = round2(targetBudgetGbp - totalCostGbp);

  // Calcular calorías, proteínas y días estimados para la pareja
  let totalCalories = 0;
  let totalProteinGrams = 0;

  for (const it of items) {
    const weightGrams = getProductItemWeight(it.product, it.cheapestSupermarket);
    const totalGrams = weightGrams * it.quantity;
    totalCalories += (totalGrams * it.product.nutrition.caloriesPer100g) / 100;
    totalProteinGrams += (totalGrams * it.product.nutrition.proteinPer100g) / 100;
  }

  const totalCaloriesInt = Math.round(totalCalories);
  const totalProteinInt = round2(totalProteinGrams);
  const safeDailyTarget = Math.max(dailyCaloriesTargetTotal, 1);
  const estimatedDaysCouple = round2(totalCaloriesInt / safeDailyTarget);

  return {
    targetBudgetGbp,
    totalCostGbp,
    remainingBudgetGbp,
    totalCalories: totalCaloriesInt,
    totalProteinGrams: totalProteinInt,
    estimatedDaysCouple,
    items,
  };
}
