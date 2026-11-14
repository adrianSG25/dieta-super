"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import {
  SUPERMARKET_IDS,
  type BasketOptimizationResult,
  type CoupleGoals,
  type CoupleMemberRole,
  type ShoppingListItem,
  type SupermarketId,
} from "@/types/dietasuper";
import { SUPERMARKET_META, SupermarketBadge, formatGbp } from "./SupermarketBadge";

export interface SharedShoppingListProps {
  items: ShoppingListItem[];
  goals: CoupleGoals;
  optimization: BasketOptimizationResult;
  onToggleChecked: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onPreferredSupermarketChange: (itemId: string, supermarket: SupermarketId | undefined) => void;
  onClearChecked: () => void;
}

type ViewMode = "grouped" | "flat";

function roleName(role: CoupleMemberRole, goals: CoupleGoals): string {
  return role === "yo" ? goals.member1Name || "Yo" : goals.member2Name || "Pareja";
}

export default function SharedShoppingList({
  items,
  goals,
  optimization,
  onToggleChecked,
  onQuantityChange,
  onRemove,
  onPreferredSupermarketChange,
  onClearChecked,
}: SharedShoppingListProps) {
  const [view, setView] = useState<ViewMode>("grouped");

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
        <ShoppingBasket className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm font-medium text-slate-700">La lista está vacía</p>
        <p className="text-xs text-slate-500">Añade productos desde la pestaña Comparar.</p>
      </div>
    );
  }

  const assignmentByItem = new Map(optimization.splitAssignments.map((a) => [a.itemId, a]));
  const checkedCount = items.filter((i) => i.checked).length;

  const renderItem = (item: ShoppingListItem) => {
    const a = assignmentByItem.get(item.id);
    return (
      <li
        key={item.id}
        className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${item.checked ? "opacity-60" : ""}`}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => onToggleChecked(item.id)}
            aria-label={`Marcar ${item.product.canonicalName} como comprado`}
            className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={`text-sm font-medium text-slate-900 ${item.checked ? "line-through" : ""}`}
              >
                {item.product.canonicalName}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  item.addedBy === "yo" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700"
                }`}
              >
                {roleName(item.addedBy, goals)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {a ? (
                <>
                  <SupermarketBadge id={a.supermarket} size="xs" />
                  <span className="font-semibold text-slate-800">{formatGbp(a.lineTotalGbp)}</span>
                  <span>({formatGbp(a.unitPriceGbp)} × {a.quantity})</span>
                  {a.savingsVsWorstGbp > 0.004 && (
                    <span className="font-medium text-emerald-700">
                      ahorras {formatGbp(a.savingsVsWorstGbp)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-amber-600">Sin oferta disponible en stock</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="Eliminar"
            className="rounded-full p-2 text-slate-400 active:bg-red-50 active:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 pl-8">
          <select
            value={item.preferredSupermarket ?? ""}
            onChange={(e) =>
              onPreferredSupermarketChange(
                item.id,
                (e.target.value || undefined) as SupermarketId | undefined,
              )
            }
            aria-label="Supermercado"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs"
          >
            <option value="">Automático (el más barato)</option>
            {SUPERMARKET_IDS.map((id) => (
              <option key={id} value={id}>
                Forzar {SUPERMARKET_META[id].label}
              </option>
            ))}
          </select>
          <div className="flex items-center rounded-full border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              aria-label="Menos"
              className="p-2 text-slate-600 disabled:opacity-30"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              aria-label="Más"
              className="p-2 text-slate-600"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </li>
    );
  };

  const itemById = new Map(items.map((i) => [i.id, i]));

  return (
    <section className="space-y-3" aria-label="Lista de la compra compartida">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-full bg-slate-200 p-0.5 text-xs font-medium">
          {(
            [
              ["grouped", "Agrupada por Súper óptimo"],
              ["flat", "Lista unificada"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-full px-3 py-1.5 ${
                view === mode ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {checkedCount > 0 && (
          <button
            type="button"
            onClick={onClearChecked}
            className="text-xs font-medium text-slate-500 underline underline-offset-2"
          >
            Quitar comprados ({checkedCount})
          </button>
        )}
      </div>

      {view === "flat" ? (
        <ul className="space-y-2">{items.map(renderItem)}</ul>
      ) : (
        <div className="space-y-4">
          {SUPERMARKET_IDS.map((id) => {
            const group = (optimization.splitGroupedBySupermarket?.[id] ?? [])
              .map((a) => itemById.get(a.itemId))
              .filter((i): i is ShoppingListItem => Boolean(i));
            if (group.length === 0) return null;
            const subtotal = (optimization.splitGroupedBySupermarket[id] ?? []).reduce(
              (s, a) => s + a.lineTotalGbp,
              0,
            );
            return (
              <div key={id} className="space-y-2">
                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold"
                  style={{ backgroundColor: SUPERMARKET_META[id].bg, color: SUPERMARKET_META[id].fg }}
                >
                  <span>
                    {SUPERMARKET_META[id].label} · {group.length} ítem{group.length === 1 ? "" : "s"}
                  </span>
                  <span>{formatGbp(subtotal)}</span>
                </div>
                <ul className="space-y-2">{group.map(renderItem)}</ul>
              </div>
            );
          })}
          {(() => {
            const rest = items.filter((i) => !assignmentByItem.has(i.id));
            if (rest.length === 0) return null;
            return (
              <div className="space-y-2">
                <div className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800">
                  Sin disponibilidad ({rest.length})
                </div>
                <ul className="space-y-2">{rest.map(renderItem)}</ul>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
}
