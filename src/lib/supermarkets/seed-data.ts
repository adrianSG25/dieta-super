import type {
  ComparedProduct,
  SupermarketId,
  SupermarketOffer,
} from "@/types/dietasuper";
import { DAIRY_EGGS_PROTEIN_PRODUCTS } from "./catalog/dairy-eggs-protein";
import { FRUITS_AND_VEG_PRODUCTS } from "./catalog/fruits-veg";
import { MEATS_AND_FISH_PRODUCTS } from "./catalog/meats-fish";
import { PANTRY_BAKERY_DRINKS_PRODUCTS } from "./catalog/pantry-bakery-drinks";

export function normalizeSearchText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mergeSeedCatalogs(groups: ComparedProduct[][]): ComparedProduct[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const merged: ComparedProduct[] = [];

  for (const group of groups) {
    for (const product of group) {
      const normalizedName = normalizeSearchText(product.canonicalName);
      if (seenIds.has(product.id) || seenNames.has(normalizedName)) {
        continue;
      }
      seenIds.add(product.id);
      seenNames.add(normalizedName);
      merged.push(product);
    }
  }

  return merged;
}

export const SEED_PRODUCTS: ComparedProduct[] = mergeSeedCatalogs([
  MEATS_AND_FISH_PRODUCTS,
  DAIRY_EGGS_PROTEIN_PRODUCTS,
  FRUITS_AND_VEG_PRODUCTS,
  PANTRY_BAKERY_DRINKS_PRODUCTS,
]);

export const SEED_CATEGORIES: string[] = Array.from(
  new Set(SEED_PRODUCTS.map((product) => product.category)),
);

const BILINGUAL_ALIASES: Record<string, string[]> = {
  pollo: ["chicken", "pechuga", "muslos", "contramuslos"],
  pechuga: ["chicken", "breast", "pollo", "turkey"],
  pavo: ["turkey", "picado", "mince"],
  ternera: ["beef", "mince", "steak", "carne"],
  cerdo: ["pork", "lomo", "solomillo", "chuleta", "bacon"],
  carne: ["beef", "turkey", "chicken", "pork", "mince"],
  pescado: ["fish", "cod", "haddock", "hake", "salmon", "tuna", "trout", "sea bass"],
  bacalao: ["cod"],
  merluza: ["hake"],
  lubina: ["sea bass"],
  langostinos: ["prawns", "king prawns"],
  gambas: ["prawns", "king prawns"],
  jamon: ["ham", "serrano", "prosciutto"],
  salchichas: ["sausages", "sausage"],
  huevos: ["eggs", "egg", "camperos", "free range"],
  huevo: ["eggs", "egg"],
  claras: ["egg whites", "whites"],
  leche: ["milk", "almond", "semi-skimmed", "almendras", "oat", "soya"],
  yogur: ["yogurt", "yoghurt", "greek", "skyr", "griego", "kvarg"],
  griego: ["greek", "yogurt", "yogur"],
  queso: ["cheese", "cottage", "mozzarella", "cheddar", "halloumi", "feta"],
  avena: ["oats", "porridge", "oatmeal", "oat"],
  arroz: ["rice", "basmati", "jasmine"],
  pan: ["bread", "loaf", "wholemeal", "sourdough", "bagels", "pitta", "wraps"],
  salmon: ["salmon"],
  atun: ["tuna"],
  platano: ["banana", "bananas"],
  platanos: ["banana", "bananas"],
  manzana: ["apples", "apple"],
  manzanas: ["apples", "apple"],
  fresas: ["strawberries"],
  arandanos: ["blueberries"],
  frambuesas: ["raspberries"],
  uvas: ["grapes"],
  brocoli: ["broccoli", "tenderstem"],
  aguacate: ["avocado", "avocados"],
  aguacates: ["avocado", "avocados"],
  patata: ["potato", "potatoes", "baking"],
  patatas: ["potato", "potatoes", "baking", "wedges"],
  boniato: ["sweet potatoes", "sweet potato"],
  boniatos: ["sweet potatoes", "sweet potato"],
  tomate: ["tomato", "tomatoes", "cherry", "passata"],
  tomates: ["tomato", "tomatoes", "cherry"],
  espinacas: ["spinach", "baby"],
  pimientos: ["peppers", "mixed peppers"],
  zanahoria: ["carrots"],
  zanahorias: ["carrots"],
  cebolla: ["onions", "onion"],
  cebollas: ["onions", "onion"],
  ajo: ["garlic"],
  ajos: ["garlic", "ajo"],
  esparragos: ["asparagus"],
  garbanzos: ["chickpeas"],
  lentejas: ["lentils"],
  alubias: ["beans", "kidney", "black beans"],
  aceite: ["oil", "olive oil", "spray"],
  cacahuete: ["peanut", "peanut butter"],
  mantequilla: ["butter", "peanut butter", "almond butter"],
  almendras: ["almond", "almonds"],
  nueces: ["walnuts"],
  cafe: ["coffee", "ground coffee", "roast"],
  pudin: ["pudding", "protein"],
  batido: ["shake", "protein"],
  congelado: ["frozen"],
  congelados: ["frozen"],
  pesto: ["pesto", "genovese"],
  soja: ["soy", "soya", "soy sauce"],
  proteina: ["protein", "proteico", "skyr", "yogurt", "chicken", "turkey", "kvarg"],
  chicken: ["pollo", "pechuga"],
  turkey: ["pavo"],
  beef: ["ternera"],
  pork: ["cerdo"],
  eggs: ["huevos"],
  milk: ["leche"],
  oats: ["avena", "porridge"],
  yogurt: ["yogur", "griego", "skyr"],
  rice: ["arroz"],
  tuna: ["atun"],
  banana: ["platanos", "platano"],
  broccoli: ["brocoli"],
  avocado: ["aguacates", "aguacate"],
  potatoes: ["patatas"],
  tomatoes: ["tomates"],
  spinach: ["espinacas"],
  coffee: ["cafe"],
  frozen: ["congelados", "congelado"],
  garlic: ["ajo", "ajos"],
  asparagus: ["esparragos"],
  soy: ["soja", "soya", "soy sauce"],
};

export function expandQueryTerms(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const expanded = new Set<string>([normalized, ...tokens]);

  for (const token of tokens) {
    const aliases = BILINGUAL_ALIASES[token];
    if (aliases) {
      for (const alias of aliases) {
        expanded.add(normalizeSearchText(alias));
      }
    }
  }

  return Array.from(expanded);
}

export function matchesProductQuery(
  product: ComparedProduct,
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystackParts = [
    product.canonicalName,
    product.category,
    product.barcode ?? "",
    ...Object.values(product.offers).map((offer) => offer?.productName ?? ""),
  ];
  const haystack = normalizeSearchText(haystackParts.join(" "));

  if (haystack.includes(normalizedQuery)) {
    return true;
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return tokens.every((token) => {
    if (haystack.includes(token)) return true;
    const aliases = BILINGUAL_ALIASES[token] ?? [];
    return aliases.some((alias) =>
      haystack.includes(normalizeSearchText(alias)),
    );
  });
}

export interface SupermarketAdapterConfig {
  supermarket: SupermarketId;
  endpointEnvVar: string;
  userAgent?: string;
}

interface RawLiveOfferPayload {
  productName?: string;
  name?: string;
  priceGbp?: number | string;
  price?: number | string;
  promoPriceGbp?: number | string;
  promoPrice?: number | string;
  weightGrams?: number | string;
  unitPriceText?: string;
  pricePerKgOrLitreGbp?: number | string;
  inStock?: boolean;
  productUrl?: string;
  url?: string;
}

function toValidNumber(value: number | string | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function mapLiveOfferPayload(
  supermarket: SupermarketId,
  raw: RawLiveOfferPayload,
  nowIso: string,
): SupermarketOffer | null {
  const productName = (raw.productName ?? raw.name ?? "").trim();
  const priceGbp = toValidNumber(raw.priceGbp ?? raw.price);
  if (!productName || priceGbp === null || priceGbp <= 0) return null;

  const promoPriceGbp = toValidNumber(raw.promoPriceGbp ?? raw.promoPrice);
  const weightGrams = toValidNumber(raw.weightGrams) ?? 500;
  const effectivePrice = promoPriceGbp ?? priceGbp;
  const computedPerKg =
    weightGrams > 0
      ? Number(((effectivePrice / weightGrams) * 1000).toFixed(2))
      : undefined;
  const pricePerKgOrLitreGbp =
    toValidNumber(raw.pricePerKgOrLitreGbp) ?? computedPerKg;

  return {
    supermarket,
    productName,
    priceGbp,
    ...(promoPriceGbp !== null ? { promoPriceGbp } : {}),
    unitPriceText:
      raw.unitPriceText?.trim() ||
      (pricePerKgOrLitreGbp !== undefined
        ? `£${pricePerKgOrLitreGbp.toFixed(2)}/kg`
        : `£${effectivePrice.toFixed(2)}`),
    ...(pricePerKgOrLitreGbp !== undefined ? { pricePerKgOrLitreGbp } : {}),
    weightGrams,
    inStock: raw.inStock ?? true,
    ...(raw.productUrl || raw.url
      ? { productUrl: (raw.productUrl ?? raw.url)?.trim() }
      : {}),
    lastUpdated: nowIso,
    source: "live-api",
  };
}

export function searchSeedOffersForSupermarket(
  supermarket: SupermarketId,
  query: string,
): SupermarketOffer[] {
  const results: SupermarketOffer[] = [];
  for (const product of SEED_PRODUCTS) {
    if (!matchesProductQuery(product, query)) continue;
    const offer = product.offers[supermarket];
    if (offer) {
      results.push(offer);
    }
  }
  return results;
}

export async function fetchSupermarketOffersWithFallback(
  config: SupermarketAdapterConfig,
  query: string,
): Promise<SupermarketOffer[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const endpointUrl =
    typeof process !== "undefined"
      ? process.env?.[config.endpointEnvVar]?.trim()
      : undefined;

  if (endpointUrl) {
    try {
      const separator = endpointUrl.includes("?") ? "&" : "?";
      const response = await fetch(
        `${endpointUrl}${separator}q=${encodeURIComponent(trimmed)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": config.userAgent ?? "DietaSuperUK/0.1",
          },
          signal: AbortSignal.timeout(2500),
          cache: "no-store",
        },
      );

      if (response.ok) {
        const data = (await response.json()) as
          | RawLiveOfferPayload[]
          | { items?: RawLiveOfferPayload[]; products?: RawLiveOfferPayload[] };
        const rawList = Array.isArray(data)
          ? data
          : (data.items ?? data.products ?? []);
        const nowIso = new Date().toISOString();
        const liveOffers = rawList
          .map((item) => mapLiveOfferPayload(config.supermarket, item, nowIso))
          .filter((item): item is SupermarketOffer => item !== null);

        if (liveOffers.length > 0) {
          return liveOffers;
        }
      }
    } catch {
      // Fallback limpio al catálogo semilla si falla red, timeout o bloqueo anti-bot.
    }
  }

  return searchSeedOffersForSupermarket(config.supermarket, trimmed);
}
