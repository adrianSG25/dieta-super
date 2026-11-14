"use client";

import { Flame, Beef, PiggyBank, Lightbulb } from "lucide-react";
import {
  SUPERMARKET_IDS,
  type BasketOptimizationResult,
  type CoupleGoals,
  type OptimizationMode,
} from "@/types/dietasuper";
import { SUPERMARKET_META, SupermarketBadge, formatGbp } from "./SupermarketBadge";

export interface CoupleNutritionPanelProps {
  goals: CoupleGoals;
  optimization: BasketOptimizationResult;
  itemCount: number;
  onGoalsChange: (goals: CoupleGoals) => void;
}

const MODES: { value: OptimizationMode; label: string }[] = [
  { value: "cheapest-total", label: "Total más barato (dividir súpers)" },
  { value: "single-supermarket", label: "Un solo súper" },
  { value: "best-calories-per-pound", label: "Mejor kcal por £" },
  { value: "high-protein-budget", label: "Alta proteína con presupuesto" },
];

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const nf = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export default function CoupleNutritionPanel({
  goals,
  optimization,
  itemCount,
  onGoalsChange,
}: CoupleNutritionPanelProps) {
  const set = <K extends keyof CoupleGoals>(key: K, value: CoupleGoals[K]) =>
    onGoalsChange({ ...goals, [key]: value });
  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const o = optimization;
  const n = o.nutritionSummary;
  const activeTotal =
    goals.optimizationMode === "single-supermarket" ? o.bestSingleSupermarketTotalGbp : o.splitBasketTotalGbp;
  const budgetPct = goals.weeklyBudgetGbp > 0 ? Math.min(100, (activeTotal / goals.weeklyBudgetGbp) * 100) : 0;
  const best = o.bestSingleSupermarket;
  const savings = Math.max(0, o.splitSavingsVsBestSingleGbp);

  const maxTotal = Math.max(0.01, ...SUPERMARKET_IDS.map((id) => o.singleSupermarketTotals[id]?.totalGbp ?? 0));

  return (
    <div className="space-y-4">
      {/* Objetivos */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Objetivos de la pareja</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre 1 (Yo)">
            <input
              value={goals.member1Name}
              onChange={(e) => set("member1Name", e.target.value)}
              className={INPUT}
              maxLength={20}
            />
          </Field>
          <Field label="Nombre 2 (Pareja)">
            <input
              value={goals.member2Name}
              onChange={(e) => set("member2Name", e.target.value)}
              className={INPUT}
              maxLength={20}
            />
          </Field>
          <Field label="kcal diarias (pareja)">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={goals.dailyCaloriesTargetTotal}
              onChange={(e) => set("dailyCaloriesTargetTotal", num(e.target.value))}
              className={INPUT}
            />
          </Field>
          <Field label="Proteína diaria total (g)">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={goals.dailyProteinTargetGrams}
              onChange={(e) => set("dailyProteinTargetGrams", num(e.target.value))}
              className={INPUT}
            />
          </Field>
          <Field label="Presupuesto semanal (£)">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={goals.weeklyBudgetGbp}
              onChange={(e) => set("weeklyBudgetGbp", num(e.target.value))}
              className={INPUT}
            />
          </Field>
          <Field label="Modo de optimización">
            <select
              value={goals.optimizationMode}
              onChange={(e) => set("optimizationMode", e.target.value as OptimizationMode)}
              className={INPUT}
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Presupuesto */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Presupuesto semanal</h2>
          <span className={`text-xs font-semibold ${o.isOverBudget ? "text-red-600" : "text-emerald-700"}`}>
            {o.isOverBudget
              ? `Te pasas ${formatGbp(Math.abs(o.budgetRemainingGbp))}`
              : `Quedan ${formatGbp(o.budgetRemainingGbp)}`}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${o.isOverBudget ? "bg-red-500" : "bg-emerald-600"}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {formatGbp(activeTotal)} de {formatGbp(goals.weeklyBudgetGbp)}
        </p>
      </section>

      {/* Un súper vs dividida */}
      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Un solo súper</h3>
          {best ? (
            <>
              <div className="mt-2 flex items-center gap-2">
                <SupermarketBadge id={best} size="md" />
                <span className="text-xl font-bold text-slate-900">{formatGbp(o.bestSingleSupermarketTotalGbp)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Mejor opción comprando todo en un sitio</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Añade productos a la lista.</p>
          )}
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Cesta dividida entre 4 súpers
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-800">{formatGbp(o.splitBasketTotalGbp)}</span>
            {savings > 0.004 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                <PiggyBank className="h-3 w-3" /> ahorras {formatGbp(savings)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-emerald-700">Cada producto en su súper más barato</p>
        </div>
      </section>

      {/* Coste por súper */}
      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Coste de toda la lista por súper</h3>
        {SUPERMARKET_IDS.map((id) => {
          const b = o.singleSupermarketTotals[id];
          const total = b?.totalGbp ?? 0;
          const isBest = best === id;
          return (
            <div key={id}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <SupermarketBadge id={id} size="xs" />
                  {b && b.missingItemsCount > 0 && (
                    <span className="text-amber-600">faltan {b.missingItemsCount}</span>
                  )}
                </span>
                <span className={`font-semibold ${isBest ? "text-emerald-700" : "text-slate-800"}`}>
                  {formatGbp(total)}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(total / maxTotal) * 100}%`,
                    backgroundColor: SUPERMARKET_META[id].bg,
                  }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* Nutrición */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Resumen nutricional ({itemCount} ítems)</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat icon={<Flame className="h-4 w-4 text-orange-500" />} label="Calorías totales" value={`${nf.format(n.totalCalories)} kcal`} />
          <Stat icon={<Beef className="h-4 w-4 text-rose-500" />} label="Proteína total" value={`${nf.format(n.totalProteinGrams)} g`} />
          <Stat label="£ / 1000 kcal" value={formatGbp(n.costPer1000KcalGbp)} />
          <Stat label="£ / 100 g proteína" value={formatGbp(n.costPer100gProteinGbp)} />
          <Stat label="Días cubiertos (kcal)" value={nf1.format(n.estimatedDaysCoveredCalories)} />
          <Stat label="Días cubiertos (proteína)" value={nf1.format(n.estimatedDaysCoveredProtein)} />
        </div>
      </section>

      {o.recommendations.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <Lightbulb className="h-4 w-4" /> Recomendaciones
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {o.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="flex items-center gap-1 text-[11px] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}
