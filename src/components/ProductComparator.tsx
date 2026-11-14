"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Wifi } from "lucide-react";
import {
  SUPERMARKET_IDS,
  type ComparedProduct,
  type CoupleMemberRole,
  type SupermarketId,
  type SupermarketOffer,
} from "@/types/dietasuper";
import {
  getCategories,
  getDefaultCatalog,
  getEnglishProductName,
  searchComparedProducts,
} from "@/lib/supermarkets";
import { SupermarketBadge, formatGbp } from "./SupermarketBadge";

type SortMode = "price" | "protein-per-pound" | "calories";

export interface ProductComparatorProps {
  activeRole: CoupleMemberRole;
  activeName: string;
  /** Catálogo semilla opcional para pintar al instante antes del primer fetch. */
  initialProducts?: ComparedProduct[];
  onAdd: (product: ComparedProduct) => void;
  /** Cantidad ya en la lista por productId (para feedback visual). */
  quantities?: Record<string, number>;
}

function effectivePrice(o: SupermarketOffer): number {
  return o.promoPriceGbp ?? o.priceGbp;
}

function cheapestOffer(p: ComparedProduct): SupermarketOffer | null {
  let best: SupermarketOffer | null = null;
  for (const id of SUPERMARKET_IDS) {
    const o = p.offers?.[id];
    if (o && o.inStock && (!best || effectivePrice(o) < effectivePrice(best))) best = o;
  }
  return best;
}

/** Gramos de proteína por £ en la oferta más barata. */
function proteinPerPound(p: ComparedProduct): number {
  const o = cheapestOffer(p);
  if (!o) return 0;
  const grams = (o.weightGrams / 100) * p.nutrition.proteinPer100g;
  return grams / Math.max(effectivePrice(o), 0.01);
}

const PAGE_SIZE = 36;

export default function ProductComparator({
  activeRole,
  activeName,
  initialProducts = [],
  onAdd,
  quantities = {},
}: ProductComparatorProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [live, setLive] = useState(false);
  const [sort, setSort] = useState<SortMode>("price");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [products, setProducts] = useState<ComparedProduct[]>(
    initialProducts.length ? initialProducts : getDefaultCatalog(),
  );
  const [categories] = useState<string[]>(getCategories());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category, sort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const delay = query || live ? 250 : 0;
    const timer = setTimeout(async () => {
      try {
        const results = await searchComparedProducts({
          query,
          category,
          includeOpenFoodFacts: live,
        });
        if (!cancelled) {
          setProducts(results);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar el catálogo. Reintenta en unos segundos.");
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, category, live]);

  const sorted = useMemo(() => {
    const list = [...products];
    list.sort((a, b) => {
      if (sort === "protein-per-pound") return proteinPerPound(b) - proteinPerPound(a);
      if (sort === "calories") return a.nutrition.caloriesPer100g - b.nutrition.caloriesPer100g;
      const pa = cheapestOffer(a);
      const pb = cheapestOffer(b);
      return (pa ? effectivePrice(pa) : Infinity) - (pb ? effectivePrice(pb) : Infinity);
    });
    return list;
  }, [products, sort]);

  const visibleProducts = useMemo(
    () => sorted.slice(0, visibleCount),
    [sorted, visibleCount],
  );
  const hasMore = visibleCount < sorted.length;

  return (
    <section className="space-y-3" aria-label="Comparador de productos">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto o código de barras (pollo, skyr, 5000…)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <span className="flex items-center gap-2 text-slate-700">
            <Wifi className="h-4 w-4 text-emerald-600" />
            Buscar también en Open Food Facts UK (en vivo)
          </span>
          <input
            type="checkbox"
            checked={live}
            onChange={(e) => setLive(e.target.checked)}
            className="h-5 w-5 accent-emerald-600"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por categoría"
            className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Ordenar por"
            className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm"
          >
            <option value="price">Mejor precio (£)</option>
            <option value="protein-per-pound">Mejor proteína/£</option>
            <option value="calories">Menos calorías/100g</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span>
          {sorted.length} producto{sorted.length === 1 ? "" : "s"}
          {sorted.length > visibleProducts.length && ` · mostrando ${visibleProducts.length}`}
        </span>
        {loading && (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> {live ? "Consultando Open Food Facts…" : "Buscando…"}
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {!loading && !error && sorted.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Sin resultados. Prueba otro nombre o activa la búsqueda en vivo.
        </p>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {visibleProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            activeRole={activeRole}
            activeName={activeName}
            inList={quantities[p.id] ?? 0}
            onAdd={onAdd}
          />
        ))}
      </ul>

      {hasMore && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
          >
            Mostrar {Math.min(PAGE_SIZE, sorted.length - visibleProducts.length)} más
          </button>
          <button
            type="button"
            onClick={() => setVisibleCount(sorted.length)}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 active:scale-95"
          >
            Ver los {sorted.length} productos
          </button>
        </div>
      )}
    </section>
  );
}

function ProductCard({
  product,
  activeRole,
  activeName,
  inList,
  onAdd,
}: {
  product: ComparedProduct;
  activeRole: CoupleMemberRole;
  activeName: string;
  inList: number;
  onAdd: (p: ComparedProduct) => void;
}) {
  const best = cheapestOffer(product);
  const bestId: SupermarketId | null = best ? best.supermarket : null;
  const ppp = proteinPerPound(product);

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug text-slate-900">{product.canonicalName}</h3>
          <p className="mt-0.5 text-xs font-medium text-indigo-700">
            🇬🇧 {getEnglishProductName(product)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{product.category}</p>
        </div>
        <div className="shrink-0 text-right text-xs">
          <p className="font-semibold text-slate-800">{Math.round(product.nutrition.caloriesPer100g)} kcal</p>
          <p className="text-emerald-700">{product.nutrition.proteinPer100g.toFixed(1)} g prot</p>
          <p className="text-[10px] text-slate-400">por 100 g</p>
        </div>
      </div>

      <table className="w-full text-xs">
        <tbody>
          {SUPERMARKET_IDS.map((id) => {
            const o = product.offers?.[id] ?? null;
            const isBest = bestId === id;
            return (
              <tr
                key={id}
                className={`border-t border-slate-100 first:border-t-0 ${isBest ? "bg-emerald-50" : ""}`}
              >
                <td className="align-top py-1.5 pl-1.5 pr-2">
                  <div className="flex flex-col">
                    <SupermarketBadge id={id} size="xs" />
                    {o && (
                      <p
                        className="mt-0.5 max-w-[165px] truncate text-[11px] text-slate-500 sm:max-w-[230px]"
                        title={o.productName}
                      >
                        {o.productName}
                      </p>
                    )}
                  </div>
                </td>
                {o ? (
                  <>
                    <td className="align-top py-1.5 text-right">
                      {o.promoPriceGbp != null ? (
                        <span>
                          <span
                            className={`font-semibold ${isBest ? "text-emerald-700" : "text-slate-900"}`}
                          >
                            {formatGbp(o.promoPriceGbp)}
                          </span>{" "}
                          <span className="text-slate-400 line-through">{formatGbp(o.priceGbp)}</span>
                        </span>
                      ) : (
                        <span className={`font-semibold ${isBest ? "text-emerald-700" : "text-slate-900"}`}>
                          {formatGbp(o.priceGbp)}
                        </span>
                      )}
                      {!o.inStock && <span className="ml-1 text-red-500">sin stock</span>}
                    </td>
                    <td className="align-top py-1.5 pl-2 pr-1.5 text-right text-slate-500">
                      {o.pricePerKgOrLitreGbp != null
                        ? `${formatGbp(o.pricePerKgOrLitreGbp)}/kg`
                        : o.unitPriceText}
                      {isBest && <span className="ml-1 font-semibold text-emerald-700">✓</span>}
                    </td>
                  </>
                ) : (
                  <td colSpan={2} className="align-top py-1.5 pr-1.5 text-right text-slate-400">
                    No disponible
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500">
          {ppp > 0 ? `${ppp.toFixed(0)} g proteína/£` : "—"}
          {inList > 0 && <span className="ml-2 font-medium text-emerald-700">· en lista ×{inList}</span>}
        </span>
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white active:scale-95 active:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir
          <span className="rounded bg-white/20 px-1" title={activeRole === "yo" ? "Yo" : "Pareja"}>
            como {activeName}
          </span>
        </button>
      </div>
    </li>
  );
}
