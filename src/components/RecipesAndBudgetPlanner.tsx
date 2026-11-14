"use client";

import { useId, useMemo, useState } from "react";
import {
  PoundSterling,
  ChefHat,
  Check,
  Plus,
  Sparkles,
  Clock,
  Users,
  ShoppingBasket,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ComparedProduct, CoupleGoals } from "@/types/dietasuper";
import { getDefaultCatalog, getEnglishProductName } from "@/lib/supermarkets";
import {
  BUDGET_PROFILE_INFOS,
  WEEKLY_RECIPES,
  buildBudgetRecommendation,
  computeRecipeMetrics,
  type BudgetProfileId,
  type RecipeCategory,
  type WeeklyRecipe,
} from "@/lib/recipes/weekly-recipes";
import { SupermarketBadge, formatGbp } from "./SupermarketBadge";

export interface RecipesAndBudgetPlannerProps {
  activeName: string;
  goals: CoupleGoals;
  quantities: Record<string, number>;
  onAddProduct: (product: ComparedProduct, quantity?: number) => void;
  onAddBatch: (entries: { product: ComparedProduct; quantity: number }[]) => void;
}

type SectionView = "all" | "budget" | "recipes";

const QUICK_BUDGET_AMOUNTS = [30, 40, 50, 60, 75, 100];

const RECIPE_CATEGORY_TABS: { id: RecipeCategory; label: string }[] = [
  { id: "all", label: "Todas (10)" },
  { id: "steaks-sweet-potato", label: "🥩 Filetes & Sweet Potato" },
  { id: "pasta", label: "🍝 Pastas" },
  { id: "fish-veg", label: "🐟 Pescado & Otros" },
];

export default function RecipesAndBudgetPlanner({
  activeName,
  goals,
  quantities,
  onAddProduct,
  onAddBatch,
}: RecipesAndBudgetPlannerProps) {
  const budgetInputId = useId();
  const [sectionView, setSectionView] = useState<SectionView>("all");
  const [budgetGbp, setBudgetGbp] = useState<number>(50);
  const [profile, setProfile] = useState<BudgetProfileId>("balanced-couple");
  const [recipeCategory, setRecipeCategory] = useState<RecipeCategory>("all");
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((cur) => (cur === message ? null : cur));
    }, 2800);
  };

  // Catálogo base de productos
  const catalog = useMemo(() => getDefaultCatalog(), []);
  const catalogById = useMemo(
    () => new Map<string, ComparedProduct>(catalog.map((p) => [p.id, p])),
    [catalog],
  );

  // Zona A: Recomendación inteligente de presupuesto
  const budgetRec = useMemo(() => {
    const safeDailyCalories = goals.dailyCaloriesTargetTotal || 4200;
    return buildBudgetRecommendation(budgetGbp, profile, catalog, safeDailyCalories);
  }, [budgetGbp, profile, catalog, goals.dailyCaloriesTargetTotal]);

  const missingBudgetEntries = useMemo(() => {
    return budgetRec.items
      .filter((item) => (quantities[item.product.id] ?? 0) === 0)
      .map((item) => ({ product: item.product, quantity: item.quantity }));
  }, [budgetRec.items, quantities]);

  const missingBudgetTotal = useMemo(() => {
    return budgetRec.items
      .filter((item) => (quantities[item.product.id] ?? 0) === 0)
      .reduce((acc, item) => acc + item.lineTotalGbp, 0);
  }, [budgetRec.items, quantities]);

  const handleAddMissingBudget = () => {
    if (missingBudgetEntries.length === 0) return;
    onAddBatch(missingBudgetEntries);
    showToast(`✓ Añadidos ${missingBudgetEntries.length} productos a la lista como ${activeName}`);
  };

  const handleAddFullBudget = () => {
    const fullEntries = budgetRec.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
    if (fullEntries.length === 0) return;
    onAddBatch(fullEntries);
    showToast(`✓ Añadida selección completa (${fullEntries.length} productos) como ${activeName}`);
  };

  // Zona B: Recetas semanales filtradas y con métricas calculadas
  const filteredRecipes = useMemo(() => {
    if (recipeCategory === "all") return WEEKLY_RECIPES;
    return WEEKLY_RECIPES.filter((r) => r.category === recipeCategory);
  }, [recipeCategory]);

  const recipesWithMetrics = useMemo(() => {
    return filteredRecipes.map((recipe) => ({
      recipe,
      metrics: computeRecipeMetrics(recipe, catalogById),
    }));
  }, [filteredRecipes, catalogById]);

  const toggleSteps = (recipeId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [recipeId]: !prev[recipeId],
    }));
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Toast flotante para feedback de inserción */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur"
        >
          {toastMessage}
        </div>
      )}

      {/* Navegación interna rápida superior */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-100 p-1.5 sm:p-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSectionView("all")}
            aria-pressed={sectionView === "all"}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              sectionView === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todo
          </button>
          <button
            type="button"
            onClick={() => setSectionView("budget")}
            aria-pressed={sectionView === "budget"}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              sectionView === "budget"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>💷</span> Presupuesto £50
          </button>
          <button
            type="button"
            onClick={() => setSectionView("recipes")}
            aria-pressed={sectionView === "recipes"}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              sectionView === "recipes"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🍳</span> Recetas (10)
          </button>
        </div>
        <span className="hidden text-[11px] text-slate-500 sm:inline-block">
          Añadiendo como: <strong className="text-slate-700">{activeName}</strong>
        </span>
      </div>

      {/* ========================================================================= */}
      {/* ZONA A: Recomendador Inteligente por Presupuesto (£50)                      */}
      {/* ========================================================================= */}
      {(sectionView === "all" || sectionView === "budget") && (
        <section
          aria-labelledby="budget-planner-heading"
          className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white p-4 sm:p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <PoundSterling className="h-5 w-5" />
              </span>
              <div>
                <h2 id="budget-planner-heading" className="text-base font-bold text-slate-900 sm:text-lg">
                  Cesta Inteligente por Presupuesto
                </h2>
                <p className="text-xs text-slate-600">
                  Ajusta tu presupuesto y maximiza el 95-99% en nutrientes con los súper más baratos.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 self-start rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 sm:self-auto">
              <Sparkles className="h-3.5 w-3.5" />
              Algoritmo UK
            </span>
          </div>

          {/* Selector de Presupuesto + Acciones rápidas */}
          <div className="mt-5 space-y-3 rounded-2xl bg-white p-3.5 sm:p-4 shadow-sm border border-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <label
                  htmlFor={budgetInputId}
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Presupuesto objetivo:
                </label>
                <div className="relative inline-flex items-center">
                  <span className="pointer-events-none absolute left-2.5 font-bold text-slate-400">
                    £
                  </span>
                  <input
                    id={budgetInputId}
                    type="number"
                    min={5}
                    max={500}
                    step={1}
                    value={Number.isNaN(budgetGbp) ? "" : budgetGbp}
                    onChange={(e) => {
                      const val = Number.parseFloat(e.target.value);
                      setBudgetGbp(Number.isNaN(val) ? 0 : val);
                    }}
                    className="w-24 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-6 pr-2 text-base font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Botones rápidos de presupuesto */}
              <div className="flex flex-wrap items-center gap-1.5">
                {QUICK_BUDGET_AMOUNTS.map((amt) => {
                  const isSelected = budgetGbp === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudgetGbp(amt)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      £{amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de perfil nutricional/económico */}
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Perfil de compra semanal:
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {BUDGET_PROFILE_INFOS.map((p) => {
                  const active = profile === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProfile(p.id)}
                      className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                        active
                          ? "border-emerald-500 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-500"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">{p.name}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            active
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {p.badge}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tarjetas resumen de métricas del presupuesto */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Coste estimado</p>
              <p className="text-base font-extrabold text-slate-900 sm:text-lg">
                {formatGbp(budgetRec.totalCostGbp)}
              </p>
              <p className="text-[11px] text-slate-500">
                de £{budgetRec.targetBudgetGbp.toFixed(0)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Margen sobrante</p>
              <p className="text-base font-extrabold text-emerald-600 sm:text-lg">
                {formatGbp(budgetRec.remainingBudgetGbp)}
              </p>
              <p className="text-[11px] text-slate-500">aprovechamiento óptimo</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Macros totales</p>
              <p className="text-sm font-extrabold text-slate-900 sm:text-base">
                {budgetRec.totalCalories.toLocaleString("en-GB")} kcal
              </p>
              <p className="text-[11px] font-semibold text-emerald-700">
                {Math.round(budgetRec.totalProteinGrams)} g prot
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Cobertura pareja</p>
              <p className="text-base font-extrabold text-slate-900 sm:text-lg">
                ~{budgetRec.estimatedDaysCouple} días
              </p>
              <p className="text-[11px] text-slate-500">calorías conjuntas</p>
            </div>
          </div>

          {/* Botones de acción rápida en cabecera de resultados */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddMissingBudget}
                disabled={missingBudgetEntries.length === 0}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
                  missingBudgetEntries.length > 0
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
                    : "cursor-not-allowed bg-emerald-100 text-emerald-800"
                }`}
              >
                {missingBudgetEntries.length > 0 ? (
                  <>
                    <ShoppingBasket className="h-4 w-4" />
                    <span>
                      Añadir los que faltan ({missingBudgetEntries.length}) · {formatGbp(missingBudgetTotal)}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>✓ Todo ya en tu cesta</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAddFullBudget}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 text-slate-500" />
                <span>Añadir selección completa ({formatGbp(budgetRec.totalCostGbp)})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500">
              {budgetRec.items.length} productos recomendados
            </span>
          </div>

          {/* Lista de ingredientes recomendados */}
          <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {budgetRec.items.map((item) => {
              const inCart = quantities[item.product.id] ?? 0;
              return (
                <div
                  key={item.product.id}
                  className="flex flex-col gap-2 p-3 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Indicador de estado en cesta */}
                    <div className="pt-0.5">
                      {inCart > 0 ? (
                        <span
                          title={`En cesta: ${inCart} unidad(es)`}
                          className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                        >
                          <Check className="h-3 w-3" />
                          <span>×{inCart}</span>
                        </span>
                      ) : (
                        <span
                          aria-hidden
                          className="inline-block h-4 w-4 rounded-full border-2 border-slate-200 bg-white"
                        />
                      )}
                    </div>

                    {/* Detalle producto */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 sm:text-sm">
                          {item.product.canonicalName}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-800">
                          ×{item.quantity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        🇬🇧 {getEnglishProductName(item.product)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-800">
                        💡 {item.reason}
                      </p>
                    </div>
                  </div>

                  {/* Supermercado más barato + Precio + Botón añadir */}
                  <div className="flex items-center justify-between gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <SupermarketBadge id={item.cheapestSupermarket} size="xs" />
                        <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                          {formatGbp(item.lineTotalGbp)}
                        </span>
                      </div>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-500">
                          {formatGbp(item.unitPriceGbp)}/ud
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onAddProduct(item.product, item.quantity);
                        showToast(`✓ +${item.quantity} ${item.product.canonicalName} para ${activeName}`);
                      }}
                      className="flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* ZONA B: Recetas Semanales Sencillas (10)                                   */}
      {/* ========================================================================= */}
      {(sectionView === "all" || sectionView === "recipes") && (
        <section aria-labelledby="weekly-recipes-heading" className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                <ChefHat className="h-5 w-5" />
              </span>
              <div>
                <h2 id="weekly-recipes-heading" className="text-base font-bold text-slate-900 sm:text-lg">
                  Recetas Semanales Sencillas (10)
                </h2>
                <p className="text-xs text-slate-600">
                  Filetes con sweet potato, pastas boloñesa y platos con ingredientes de súper UK.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {recipesWithMetrics.length} de {WEEKLY_RECIPES.length} recetas
            </span>
          </div>

          {/* Chips filtro por categoría */}
          <div className="flex flex-wrap items-center gap-1.5">
            {RECIPE_CATEGORY_TABS.map((tab) => {
              const isSelected = recipeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRecipeCategory(tab.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tarjetas de recetas */}
          <div className="space-y-4">
            {recipesWithMetrics.map(({ recipe, metrics }) => {
              const readyCount = metrics.resolvedIngredients.filter(
                (r) => r.product && (quantities[r.product.id] ?? 0) > 0,
              ).length;
              const totalCount = metrics.resolvedIngredients.length;
              const allReady = readyCount === totalCount && totalCount > 0;

              const missingIngs = metrics.resolvedIngredients.filter(
                (r) => r.product && (quantities[r.product.id] ?? 0) === 0,
              );
              const missingIngTotal = missingIngs.reduce((acc, r) => acc + r.lineTotalGbp, 0);

              const isStepsOpen = Boolean(expandedSteps[recipe.id]);

              const handleAddMissingRecipe = () => {
                if (missingIngs.length > 0) {
                  const batch = missingIngs.map((r) => ({
                    product: r.product!,
                    quantity: r.ingredient.quantity,
                  }));
                  onAddBatch(batch);
                  showToast(`✓ Añadidos ${batch.length} ingredientes de "${recipe.title.slice(0, 22)}..." como ${activeName}`);
                } else {
                  // Si ya están todos, añade otro lote
                  const batch = metrics.resolvedIngredients
                    .filter((r) => r.product)
                    .map((r) => ({
                      product: r.product!,
                      quantity: r.ingredient.quantity,
                    }));
                  onAddBatch(batch);
                  showToast(`✓ Añadido otro lote completo de la receta como ${activeName}`);
                }
              };

              const handleAddAllRecipe = () => {
                const batch = metrics.resolvedIngredients
                  .filter((r) => r.product)
                  .map((r) => ({
                    product: r.product!,
                    quantity: r.ingredient.quantity,
                  }));
                onAddBatch(batch);
                showToast(`✓ Añadidos todos los ingredientes de la receta como ${activeName}`);
              };

              return (
                <article
                  key={recipe.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-sm"
                >
                  {/* Cabecera de la tarjeta */}
                  <div className="border-b border-slate-100 p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                          {recipe.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          🇬🇧 {recipe.englishSubtitle}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span>{recipe.prepMinutes} min</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          <span>{recipe.servings} raciones</span>
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {recipe.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Banda de Métricas Clave */}
                  <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/70 p-3 text-center sm:p-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Coste receta</p>
                      <p className="text-sm font-extrabold text-slate-900 sm:text-base">
                        {formatGbp(metrics.totalCostGbp)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formatGbp(metrics.costPerServingGbp)}/rac
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Calorías</p>
                      <p className="text-sm font-extrabold text-slate-900 sm:text-base">
                        {metrics.caloriesPerServing} kcal
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {metrics.totalCalories} total
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Proteína</p>
                      <p className="text-sm font-extrabold text-emerald-700 sm:text-base">
                        {metrics.proteinPerServing} g
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {metrics.totalProteinGrams} g total
                      </p>
                    </div>
                  </div>

                  {/* Indicador de ingredientes listos en la cesta */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 sm:px-5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        allReady
                          ? "bg-emerald-100 text-emerald-800"
                          : readyCount > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>
                        ✓ {readyCount} de {totalCount} ingredientes en tu cesta
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleSteps(recipe.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      <span>
                        {isStepsOpen
                          ? "Ocultar preparación"
                          : `Ver preparación (${recipe.steps.length} pasos)`}
                      </span>
                      {isStepsOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Pasos de preparación colapsables */}
                  {isStepsOpen && (
                    <div className="border-b border-slate-100 bg-amber-50/40 p-4 sm:p-5">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                        Paso a paso ({recipe.prepMinutes} min):
                      </p>
                      <ol className="space-y-2 text-xs leading-relaxed text-slate-700">
                        {recipe.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-900">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Lista de ingredientes */}
                  <div className="divide-y divide-slate-100 px-4 sm:px-5">
                    {metrics.resolvedIngredients.map((r) => {
                      const inCart = r.product ? quantities[r.product.id] ?? 0 : 0;
                      return (
                        <div
                          key={r.ingredient.productId}
                          className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="pt-0.5">
                              {inCart > 0 ? (
                                <span
                                  title={`En cesta ×${inCart}`}
                                  className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>×{inCart}</span>
                                </span>
                              ) : (
                                <span
                                  aria-hidden
                                  className="inline-block h-4 w-4 rounded-full border-2 border-slate-200 bg-white"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">
                                  {r.product?.canonicalName ?? r.ingredient.productId}
                                </span>
                                {r.ingredient.quantity > 1 && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                    ×{r.ingredient.quantity}
                                  </span>
                                )}
                              </div>
                              {r.product && (
                                <p className="text-[11px] text-slate-500">
                                  🇬🇧 {getEnglishProductName(r.product)}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-600">
                                📝 {r.ingredient.usageNote}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 self-end sm:self-center">
                            <div className="flex items-center gap-1.5">
                              {r.cheapestSupermarket && (
                                <SupermarketBadge id={r.cheapestSupermarket} size="xs" />
                              )}
                              <span className="text-xs font-extrabold text-slate-900">
                                {formatGbp(r.lineTotalGbp)}
                              </span>
                            </div>

                            {r.product && (
                              <button
                                type="button"
                                title={`Añadir ${r.ingredient.quantity} unidad(es)`}
                                onClick={() => {
                                  onAddProduct(r.product!, r.ingredient.quantity);
                                  showToast(`✓ +${r.ingredient.quantity} ${r.product!.canonicalName} para ${activeName}`);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white active:scale-95 transition-all"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Acciones al pie de la tarjeta */}
                  <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <button
                      type="button"
                      onClick={handleAddMissingRecipe}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      {missingIngs.length > 0 ? (
                        <>
                          <ShoppingBasket className="h-4 w-4" />
                          <span>
                            Añadir los que faltan ({missingIngs.length}) · {formatGbp(missingIngTotal)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>✓ Todos en la cesta · Añadir otro lote</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleAddAllRecipe}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4 text-slate-500" />
                      <span>Añadir todos ({formatGbp(metrics.totalCostGbp)})</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
