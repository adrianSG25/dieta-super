import type {
  ComparedProduct,
  SupermarketId,
  SupermarketOffer,
} from "@/types/dietasuper";

const SEED_UPDATED_AT = "2026-03-01T09:00:00.000Z";

interface OfferInput {
  productName: string;
  priceGbp: number;
  promoPriceGbp?: number;
  weightGrams: number;
  unitLabel?: "kg" | "L";
  inStock?: boolean;
  productUrl?: string;
}

function buildOffer(
  supermarket: SupermarketId,
  input: OfferInput,
): SupermarketOffer {
  const effectivePrice = input.promoPriceGbp ?? input.priceGbp;
  const perKgOrLitre = Number(
    ((effectivePrice / input.weightGrams) * 1000).toFixed(2),
  );
  const unit = input.unitLabel ?? "kg";

  return {
    supermarket,
    productName: input.productName,
    priceGbp: input.priceGbp,
    ...(input.promoPriceGbp !== undefined
      ? { promoPriceGbp: input.promoPriceGbp }
      : {}),
    unitPriceText: `£${perKgOrLitre.toFixed(2)}/${unit}`,
    pricePerKgOrLitreGbp: perKgOrLitre,
    weightGrams: input.weightGrams,
    inStock: input.inStock ?? true,
    ...(input.productUrl ? { productUrl: input.productUrl } : {}),
    lastUpdated: SEED_UPDATED_AT,
    source: "catalog-seed",
  };
}

export const SEED_PRODUCTS: ComparedProduct[] = [
  {
    id: "chicken-breast-1kg",
    canonicalName: "Pechuga de pollo (1kg)",
    category: "Carnes y Aves",
    barcode: "5057172001015",
    nutrition: {
      caloriesPer100g: 110,
      proteinPer100g: 23.1,
      carbsPer100g: 0,
      fatPer100g: 1.8,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Ashfield Farm British Chicken Breast Fillets 1kg",
        priceGbp: 6.29,
        weightGrams: 1000,
        productUrl: "https://groceries.aldi.co.uk/en-GB/Search?keywords=chicken+breast+1kg",
      }),
      lidl: buildOffer("lidl", {
        productName: "Birchwood British Chicken Breast Fillets 1kg",
        priceGbp: 6.25,
        weightGrams: 1000,
        productUrl: "https://www.lidl.co.uk/q/search?q=chicken+breast",
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Succulent British Chicken Breast Fillets 1kg",
        priceGbp: 6.75,
        promoPriceGbp: 6.0,
        weightGrams: 1000,
        productUrl: "https://groceries.asda.com/search/chicken%20breast%201kg",
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons British Chicken Breast Fillets 1kg",
        priceGbp: 6.89,
        weightGrams: 1000,
        productUrl: "https://groceries.morrisons.com/search?entry=chicken%20breast",
      }),
    },
  },
  {
    id: "turkey-mince-500g",
    canonicalName: "Pavo picado magro 5% (500g)",
    category: "Carnes y Aves",
    barcode: "5057172001022",
    nutrition: {
      caloriesPer100g: 132,
      proteinPer100g: 22.0,
      carbsPer100g: 0.5,
      fatPer100g: 4.7,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Ashfield Farm 5% Fat British Turkey Breast Mince 500g",
        priceGbp: 3.29,
        weightGrams: 500,
      }),
      lidl: buildOffer("lidl", {
        productName: "Birchwood Lean Turkey Mince 5% Fat 500g",
        priceGbp: 3.19,
        weightGrams: 500,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Lean Turkey Breast Mince 5% Fat 500g",
        priceGbp: 3.75,
        weightGrams: 500,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Lean Turkey Mince 5% Fat 500g",
        priceGbp: 3.69,
        promoPriceGbp: 3.25,
        weightGrams: 500,
      }),
    },
  },
  {
    id: "beef-mince-5-500g",
    canonicalName: "Carne picada ternera 5% (500g)",
    category: "Carnes y Aves",
    barcode: "5057172001039",
    nutrition: {
      caloriesPer100g: 137,
      proteinPer100g: 21.4,
      carbsPer100g: 0,
      fatPer100g: 5.0,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Ashfield Farm 5% Fat British Beef Mince 500g",
        priceGbp: 3.49,
        weightGrams: 500,
      }),
      lidl: buildOffer("lidl", {
        productName: "Birchwood 5% Fat Lean Beef Mince 500g",
        priceGbp: 3.45,
        weightGrams: 500,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA 5% Fat Lean Beef Mince 500g",
        priceGbp: 3.8,
        weightGrams: 500,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons The Best 5% Fat Beef Mince 500g",
        priceGbp: 3.85,
        weightGrams: 500,
      }),
    },
  },
  {
    id: "salmon-fillets-240g",
    canonicalName: "Filetes de salmón (240g)",
    category: "Pescado",
    barcode: "5057172002012",
    nutrition: {
      caloriesPer100g: 208,
      proteinPer100g: 20.4,
      carbsPer100g: 0,
      fatPer100g: 13.4,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "The Fishmonger Scottish Salmon Fillets 2 Pack 240g",
        priceGbp: 3.49,
        weightGrams: 240,
      }),
      lidl: buildOffer("lidl", {
        productName: "Lighthouse Bay 2 Scottish Salmon Fillets 240g",
        priceGbp: 3.45,
        weightGrams: 240,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Boneless Salmon Fillets 240g",
        priceGbp: 3.95,
        promoPriceGbp: 3.5,
        weightGrams: 240,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons 2 Scottish Salmon Fillets 240g",
        priceGbp: 4.0,
        weightGrams: 240,
      }),
    },
  },
  {
    id: "tuna-chunks-4pack",
    canonicalName: "Atún al natural pack 4 (4x145g)",
    category: "Pescado",
    barcode: "5057172002029",
    nutrition: {
      caloriesPer100g: 109,
      proteinPer100g: 25.0,
      carbsPer100g: 0,
      fatPer100g: 0.8,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Ocean Rise Tuna Chunks in Spring Water 4x145g",
        priceGbp: 2.69,
        weightGrams: 580,
      }),
      lidl: buildOffer("lidl", {
        productName: "Nixe Tuna Chunks in Spring Water 4x145g",
        priceGbp: 2.65,
        weightGrams: 580,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Tuna Chunks in Spring Water 4x145g",
        priceGbp: 3.25,
        weightGrams: 580,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Tuna Chunks in Spring Water 4x145g",
        priceGbp: 3.5,
        promoPriceGbp: 2.75,
        weightGrams: 580,
      }),
    },
  },
  {
    id: "free-range-eggs-12",
    canonicalName: "Huevos camperos 12 uds",
    category: "Huevos y Lácteos",
    barcode: "5057172003019",
    nutrition: {
      caloriesPer100g: 143,
      proteinPer100g: 12.6,
      carbsPer100g: 0.7,
      fatPer100g: 9.5,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Merevale British Free Range Medium Eggs 12 Pack",
        priceGbp: 2.65,
        weightGrams: 720,
      }),
      lidl: buildOffer("lidl", {
        productName: "Meadowfresh Free Range Medium Eggs 12 Pack",
        priceGbp: 2.59,
        weightGrams: 720,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Free Range Medium Eggs 12 Pack",
        priceGbp: 2.95,
        weightGrams: 720,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons British Free Range Eggs 12 Pack",
        priceGbp: 3.1,
        weightGrams: 720,
      }),
    },
  },
  {
    id: "semi-skimmed-milk-2l",
    canonicalName: "Leche semidesnatada 4 pints (2.27L)",
    category: "Huevos y Lácteos",
    barcode: "5057172003026",
    nutrition: {
      caloriesPer100g: 46,
      proteinPer100g: 3.5,
      carbsPer100g: 4.8,
      fatPer100g: 1.7,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Cowbelle British Semi-Skimmed Milk 4 Pints 2.27L",
        priceGbp: 1.45,
        weightGrams: 2272,
        unitLabel: "L",
      }),
      lidl: buildOffer("lidl", {
        productName: "Meadow Fresh Semi-Skimmed Milk 4 Pints 2.27L",
        priceGbp: 1.45,
        weightGrams: 2272,
        unitLabel: "L",
      }),
      asda: buildOffer("asda", {
        productName: "ASDA British Semi-Skimmed Milk 4 Pints 2.27L",
        priceGbp: 1.5,
        weightGrams: 2272,
        unitLabel: "L",
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons British Semi-Skimmed Milk 4 Pints 2.27L",
        priceGbp: 1.55,
        weightGrams: 2272,
        unitLabel: "L",
      }),
    },
  },
  {
    id: "greek-yogurt-0-500g",
    canonicalName: "Yogur Griego 0% grasa (500g)",
    category: "Huevos y Lácteos",
    barcode: "5057172003033",
    nutrition: {
      caloriesPer100g: 57,
      proteinPer100g: 10.0,
      carbsPer100g: 3.8,
      fatPer100g: 0.2,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Brooklea Authentic 0% Fat Greek Yogurt 500g",
        priceGbp: 1.49,
        weightGrams: 500,
      }),
      lidl: buildOffer("lidl", {
        productName: "Milbona 0% Fat Greek Style Natural Yogurt 500g",
        priceGbp: 1.45,
        weightGrams: 500,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA 0% Fat Authentic Greek Yogurt 500g",
        priceGbp: 1.75,
        weightGrams: 500,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Fat Free Greek Style Yogurt 500g",
        priceGbp: 1.85,
        promoPriceGbp: 1.5,
        weightGrams: 500,
      }),
    },
  },
  {
    id: "skyr-yogurt-450g",
    canonicalName: "Skyr alto en proteína (450g)",
    category: "Huevos y Lácteos",
    barcode: "5057172003040",
    nutrition: {
      caloriesPer100g: 63,
      proteinPer100g: 11.0,
      carbsPer100g: 4.0,
      fatPer100g: 0.2,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Brooklea Icelandic Style Skyr Natural 450g",
        priceGbp: 1.39,
        weightGrams: 450,
      }),
      lidl: buildOffer("lidl", {
        productName: "Milbona Icelandic Style Skyr Natural 450g",
        priceGbp: 1.35,
        weightGrams: 450,
      }),
      asda: buildOffer("asda", {
        productName: "Arla Skyr Icelandic Style Yogurt Natural 450g",
        priceGbp: 1.65,
        weightGrams: 450,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Arla Skyr Natural Yogurt 450g",
        priceGbp: 1.75,
        weightGrams: 450,
      }),
    },
  },
  {
    id: "cottage-cheese-300g",
    canonicalName: "Queso Cottage bajo en grasa (300g)",
    category: "Huevos y Lácteos",
    barcode: "5057172003057",
    nutrition: {
      caloriesPer100g: 81,
      proteinPer100g: 11.5,
      carbsPer100g: 3.5,
      fatPer100g: 2.0,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Emporium Reduced Fat Natural Cottage Cheese 300g",
        priceGbp: 1.09,
        weightGrams: 300,
      }),
      lidl: buildOffer("lidl", {
        productName: "Milbona Light Cottage Cheese Natural 300g",
        priceGbp: 1.05,
        weightGrams: 300,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Low Fat Natural Cottage Cheese 300g",
        priceGbp: 1.35,
        weightGrams: 300,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Savers Natural Cottage Cheese 300g",
        priceGbp: 1.4,
        weightGrams: 300,
      }),
    },
  },
  {
    id: "mozzarella-light-125g",
    canonicalName: "Queso Mozzarella Light (125g)",
    category: "Huevos y Lácteos",
    barcode: "5057172003064",
    nutrition: {
      caloriesPer100g: 162,
      proteinPer100g: 19.5,
      carbsPer100g: 1.5,
      fatPer100g: 8.5,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Cucina Reduced Fat Mozzarella Ball 125g",
        priceGbp: 0.79,
        weightGrams: 125,
      }),
      lidl: buildOffer("lidl", {
        productName: "Lovilio Light Mozzarella 125g",
        priceGbp: 0.75,
        weightGrams: 125,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Lighter Mozzarella Ball 125g",
        priceGbp: 0.95,
        weightGrams: 125,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Reduced Fat Mozzarella 125g",
        priceGbp: 1.05,
        weightGrams: 125,
      }),
    },
  },
  {
    id: "porridge-oats-1kg",
    canonicalName: "Avena Porridge (1kg)",
    category: "Cereales y Panadería",
    barcode: "5057172004016",
    nutrition: {
      caloriesPer100g: 374,
      proteinPer100g: 11.0,
      carbsPer100g: 62.0,
      fatPer100g: 7.2,
      fiberPer100g: 9.0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Kavanagh's Organic Scottish Porridge Oats 1kg",
        priceGbp: 0.9,
        weightGrams: 1000,
      }),
      lidl: buildOffer("lidl", {
        productName: "Crownfield Scottish Porridge Oats 1kg",
        priceGbp: 0.89,
        weightGrams: 1000,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Just Essentials Porridge Oats 1kg",
        priceGbp: 1.15,
        weightGrams: 1000,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Scottish Porridge Oats 1kg",
        priceGbp: 1.25,
        weightGrams: 1000,
      }),
    },
  },
  {
    id: "basmati-rice-1kg",
    canonicalName: "Arroz Basmati (1kg)",
    category: "Cereales y Panadería",
    barcode: "5057172004023",
    nutrition: {
      caloriesPer100g: 349,
      proteinPer100g: 8.2,
      carbsPer100g: 77.5,
      fatPer100g: 0.8,
      fiberPer100g: 1.4,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Worldwide Foods Basmati Rice 1kg",
        priceGbp: 1.35,
        weightGrams: 1000,
      }),
      lidl: buildOffer("lidl", {
        productName: "Golden Sun Basmati Rice 1kg",
        priceGbp: 1.35,
        weightGrams: 1000,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Pure Basmati Rice 1kg",
        priceGbp: 1.6,
        weightGrams: 1000,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Basmati Rice 1kg",
        priceGbp: 1.75,
        promoPriceGbp: 1.4,
        weightGrams: 1000,
      }),
    },
  },
  {
    id: "wholemeal-bread-800g",
    canonicalName: "Pan integral proteico (800g)",
    category: "Cereales y Panadería",
    barcode: "5057172004030",
    nutrition: {
      caloriesPer100g: 228,
      proteinPer100g: 10.5,
      carbsPer100g: 39.0,
      fatPer100g: 2.4,
      fiberPer100g: 6.8,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Village Bakery Soft Wholemeal Bread 800g",
        priceGbp: 0.75,
        weightGrams: 800,
      }),
      lidl: buildOffer("lidl", {
        productName: "Rowan Hill Bakery Soft Wholemeal Loaf 800g",
        priceGbp: 0.75,
        weightGrams: 800,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Wholemeal Medium Sliced Bread 800g",
        priceGbp: 0.95,
        weightGrams: 800,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Wholemeal Medium Bread 800g",
        priceGbp: 1.05,
        weightGrams: 800,
      }),
    },
  },
  {
    id: "bananas-5pack",
    canonicalName: "Plátanos pack 5 uds (~650g)",
    category: "Frutas y Verduras",
    barcode: "5057172005013",
    nutrition: {
      caloriesPer100g: 89,
      proteinPer100g: 1.1,
      carbsPer100g: 22.8,
      fatPer100g: 0.3,
      fiberPer100g: 2.6,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Nature's Pick Fairtrade Bananas 5 Pack",
        priceGbp: 0.78,
        weightGrams: 650,
      }),
      lidl: buildOffer("lidl", {
        productName: "Oaklands Fairtrade Bananas 5 Pack",
        priceGbp: 0.78,
        weightGrams: 650,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Fairtrade Bananas 5 Pack",
        priceGbp: 0.85,
        weightGrams: 650,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Fairtrade Bananas 5 Pack",
        priceGbp: 0.9,
        weightGrams: 650,
      }),
    },
  },
  {
    id: "broccoli-350g",
    canonicalName: "Brócoli fresco (350g)",
    category: "Frutas y Verduras",
    barcode: "5057172005020",
    nutrition: {
      caloriesPer100g: 34,
      proteinPer100g: 2.8,
      carbsPer100g: 6.6,
      fatPer100g: 0.4,
      fiberPer100g: 2.6,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Nature's Pick Broccoli 350g",
        priceGbp: 0.79,
        weightGrams: 350,
      }),
      lidl: buildOffer("lidl", {
        productName: "Oaklands Broccoli Crown 350g",
        priceGbp: 0.75,
        weightGrams: 350,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Fresh Broccoli 350g",
        priceGbp: 0.82,
        weightGrams: 350,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Broccoli 350g",
        priceGbp: 0.89,
        weightGrams: 350,
      }),
    },
  },
  {
    id: "avocados-2pack",
    canonicalName: "Aguacates x2 (~300g)",
    category: "Frutas y Verduras",
    barcode: "5057172005037",
    nutrition: {
      caloriesPer100g: 160,
      proteinPer100g: 2.0,
      carbsPer100g: 8.5,
      fatPer100g: 14.7,
      fiberPer100g: 6.7,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Nature's Pick Ripe & Ready Avocados 2 Pack",
        priceGbp: 1.39,
        weightGrams: 300,
      }),
      lidl: buildOffer("lidl", {
        productName: "Oaklands Ripe & Ready Avocados 2 Pack",
        priceGbp: 1.35,
        weightGrams: 300,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Ripe & Ready Avocados 2 Pack",
        priceGbp: 1.65,
        promoPriceGbp: 1.4,
        weightGrams: 300,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Ripe Avocados 2 Pack",
        priceGbp: 1.75,
        weightGrams: 300,
      }),
    },
  },
  {
    id: "baking-potatoes-2500g",
    canonicalName: "Patatas baking (2.5kg)",
    category: "Frutas y Verduras",
    barcode: "5057172005044",
    nutrition: {
      caloriesPer100g: 77,
      proteinPer100g: 2.0,
      carbsPer100g: 17.5,
      fatPer100g: 0.1,
      fiberPer100g: 2.2,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Nature's Pick British White Baking Potatoes 2.5kg",
        priceGbp: 1.49,
        weightGrams: 2500,
      }),
      lidl: buildOffer("lidl", {
        productName: "Oaklands British Baking Potatoes 2.5kg",
        priceGbp: 1.45,
        weightGrams: 2500,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA White Baking Potatoes 2.5kg",
        priceGbp: 1.75,
        weightGrams: 2500,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Baking Potatoes 2.5kg",
        priceGbp: 1.85,
        weightGrams: 2500,
      }),
    },
  },
  {
    id: "cherry-tomatoes-250g",
    canonicalName: "Tomates cherry (250g)",
    category: "Frutas y Verduras",
    barcode: "5057172005051",
    nutrition: {
      caloriesPer100g: 18,
      proteinPer100g: 0.9,
      carbsPer100g: 3.9,
      fatPer100g: 0.2,
      fiberPer100g: 1.2,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Nature's Pick Sweet Cherry Tomatoes 250g",
        priceGbp: 0.85,
        weightGrams: 250,
      }),
      lidl: buildOffer("lidl", {
        productName: "Oaklands Cherry Tomatoes 250g",
        priceGbp: 0.85,
        weightGrams: 250,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Sweet & Juicy Cherry Tomatoes 250g",
        priceGbp: 0.95,
        weightGrams: 250,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Cherry Tomatoes 250g",
        priceGbp: 1.05,
        weightGrams: 250,
      }),
    },
  },
  {
    id: "baby-spinach-240g",
    canonicalName: "Espinacas baby (240g)",
    category: "Frutas y Verduras",
    barcode: "5057172005068",
    nutrition: {
      caloriesPer100g: 23,
      proteinPer100g: 2.9,
      carbsPer100g: 3.6,
      fatPer100g: 0.4,
      fiberPer100g: 2.2,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Nature's Pick Baby Spinach 240g",
        priceGbp: 0.99,
        weightGrams: 240,
      }),
      lidl: buildOffer("lidl", {
        productName: "Oaklands Baby Leaf Spinach 240g",
        priceGbp: 0.95,
        weightGrams: 240,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Baby Spinach 240g",
        priceGbp: 1.15,
        weightGrams: 240,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Baby Spinach 240g",
        priceGbp: 1.25,
        weightGrams: 240,
      }),
    },
  },
  {
    id: "peanut-butter-340g",
    canonicalName: "Mantequilla de cacahuete 100% (340g)",
    category: "Despensa y Proteína",
    barcode: "5057172006010",
    nutrition: {
      caloriesPer100g: 598,
      proteinPer100g: 26.0,
      carbsPer100g: 12.0,
      fatPer100g: 49.0,
      fiberPer100g: 8.5,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Foodie Market 100% Smooth Peanut Butter 340g",
        priceGbp: 1.89,
        weightGrams: 340,
      }),
      lidl: buildOffer("lidl", {
        productName: "Mister Choc 100% Peanuts Smooth Butter 340g",
        priceGbp: 1.79,
        weightGrams: 340,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA 100% Roasted Smooth Peanut Butter 340g",
        priceGbp: 2.25,
        weightGrams: 340,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Whole Earth 100% Smooth Peanut Butter 340g",
        priceGbp: 2.4,
        promoPriceGbp: 1.95,
        weightGrams: 340,
      }),
    },
  },
  {
    id: "ground-coffee-227g",
    canonicalName: "Café molido (227g)",
    category: "Bebidas y Café",
    barcode: "5057172007017",
    nutrition: {
      caloriesPer100g: 2,
      proteinPer100g: 0.1,
      carbsPer100g: 0.3,
      fatPer100g: 0,
      fiberPer100g: 0,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Alcafe Rich Roast & Ground Coffee 227g",
        priceGbp: 2.49,
        weightGrams: 227,
      }),
      lidl: buildOffer("lidl", {
        productName: "Bellarom Medium Roast Ground Coffee 227g",
        priceGbp: 2.39,
        weightGrams: 227,
      }),
      asda: buildOffer("asda", {
        productName: "ASDA Smooth Roast & Ground Coffee 227g",
        priceGbp: 2.85,
        weightGrams: 227,
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons The Best Roast Ground Coffee 227g",
        priceGbp: 3.0,
        weightGrams: 227,
      }),
    },
  },
  {
    id: "almond-milk-1l",
    canonicalName: "Leche de almendras sin azúcar (1L)",
    category: "Bebidas y Café",
    barcode: "5057172007024",
    nutrition: {
      caloriesPer100g: 13,
      proteinPer100g: 0.5,
      carbsPer100g: 0.1,
      fatPer100g: 1.1,
      fiberPer100g: 0.4,
    },
    offers: {
      aldi: buildOffer("aldi", {
        productName: "Acti Leaf Unsweetened Almond Drink 1L",
        priceGbp: 1.09,
        weightGrams: 1000,
        unitLabel: "L",
      }),
      lidl: buildOffer("lidl", {
        productName: "Vemondo Unsweetened Almond Drink 1L",
        priceGbp: 1.09,
        weightGrams: 1000,
        unitLabel: "L",
      }),
      asda: buildOffer("asda", {
        productName: "Alpro Unsweetened Roasted Almond Drink 1L",
        priceGbp: 1.35,
        promoPriceGbp: 1.1,
        weightGrams: 1000,
        unitLabel: "L",
      }),
      morrisons: buildOffer("morrisons", {
        productName: "Morrisons Unsweetened Almond Drink 1L",
        priceGbp: 1.45,
        weightGrams: 1000,
        unitLabel: "L",
      }),
    },
  },
];

export const SEED_CATEGORIES: string[] = Array.from(
  new Set(SEED_PRODUCTS.map((product) => product.category)),
);

const BILINGUAL_ALIASES: Record<string, string[]> = {
  pollo: ["chicken", "pechuga"],
  pechuga: ["chicken", "breast", "pollo"],
  pavo: ["turkey", "picado", "mince"],
  ternera: ["beef", "mince", "carne"],
  carne: ["beef", "turkey", "chicken", "mince"],
  huevos: ["eggs", "egg", "camperos", "free range"],
  huevo: ["eggs", "egg"],
  leche: ["milk", "almond", "semi-skimmed", "almendras"],
  yogur: ["yogurt", "yoghurt", "greek", "skyr", "griego"],
  griego: ["greek", "yogurt", "yogur"],
  queso: ["cheese", "cottage", "mozzarella"],
  avena: ["oats", "porridge", "oatmeal"],
  arroz: ["rice", "basmati"],
  pan: ["bread", "loaf", "wholemeal"],
  salmon: ["salmon"],
  atun: ["tuna"],
  platano: ["banana", "bananas"],
  platanos: ["banana", "bananas"],
  brocoli: ["broccoli"],
  aguacate: ["avocado", "avocados"],
  aguacates: ["avocado", "avocados"],
  patata: ["potato", "potatoes", "baking"],
  patatas: ["potato", "potatoes", "baking"],
  tomate: ["tomato", "tomatoes", "cherry"],
  tomates: ["tomato", "tomatoes", "cherry"],
  espinacas: ["spinach", "baby"],
  cacahuete: ["peanut", "peanut butter"],
  mantequilla: ["butter", "peanut butter"],
  cafe: ["coffee", "ground coffee", "roast"],
  almendras: ["almond", "almond milk"],
  proteina: ["protein", "proteico", "skyr", "yogurt", "chicken", "turkey"],
  chicken: ["pollo", "pechuga"],
  turkey: ["pavo"],
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
};

export function normalizeSearchText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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
    return aliases.some((alias) => haystack.includes(normalizeSearchText(alias)));
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
