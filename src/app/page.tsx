"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cloud, Radio, ShoppingCart, Search, HeartPulse, Users } from "lucide-react";
import type {
  ComparedProduct,
  CoupleGoals,
  CoupleMemberRole,
  ShoppingListItem,
  SupermarketId,
} from "@/types/dietasuper";
import { optimizeShoppingList } from "@/lib/optimizer/basket";
import {
  DEFAULT_COUPLE_GOALS,
  getInitialRoomCode,
  getSyncTransportInfo,
  loadState,
  normalizeRoomCode,
  saveState,
  subscribeToState,
  type CoupleSharedState,
} from "@/lib/sync/couple-sync";
import ProductComparator from "@/components/ProductComparator";
import SharedShoppingList from "@/components/SharedShoppingList";
import CoupleNutritionPanel from "@/components/CoupleNutritionPanel";
import { formatGbp } from "@/components/SupermarketBadge";

type Tab = "compare" | "list" | "diet";

function newId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("compare");
  const [role, setRole] = useState<CoupleMemberRole>("yo");
  const [roomCode, setRoomCode] = useState("DIETA-UK");
  const [roomDraft, setRoomDraft] = useState("DIETA-UK");
  const [list, setList] = useState<ShoppingListItem[]>([]);
  const [goals, setGoals] = useState<CoupleGoals>(DEFAULT_COUPLE_GOALS);
  const [ready, setReady] = useState(false);

  const stateRef = useRef<CoupleSharedState | null>(null);
  const roleRef = useRef(role);
  roleRef.current = role;

  const transport = useMemo(() => getSyncTransportInfo(), []);

  // Sala inicial (solo en cliente, para evitar desajustes de hidratación).
  useEffect(() => {
    const initial = getInitialRoomCode();
    setRoomCode(initial);
    setRoomDraft(initial);
  }, []);

  // Carga + suscripción a la sala activa.
  useEffect(() => {
    const stored = loadState(roomCode);
    const base: CoupleSharedState = stored ?? {
      list: [],
      goals: { ...DEFAULT_COUPLE_GOALS },
      updatedAt: new Date(0).toISOString(),
      updatedBy: "yo",
      roomCode,
    };
    stateRef.current = base;
    setList(base.list);
    setGoals(base.goals);
    setReady(true);

    return subscribeToState(roomCode, (incoming) => {
      stateRef.current = incoming;
      setList(incoming.list);
      setGoals(incoming.goals);
    });
  }, [roomCode]);

  const commit = useCallback(
    (patch: { list?: ShoppingListItem[]; goals?: CoupleGoals }) => {
      const prev = stateRef.current;
      const next: CoupleSharedState = {
        list: patch.list ?? prev?.list ?? [],
        goals: patch.goals ?? prev?.goals ?? DEFAULT_COUPLE_GOALS,
        updatedAt: new Date().toISOString(),
        updatedBy: roleRef.current,
        roomCode: normalizeRoomCode(roomCode),
      };
      stateRef.current = next;
      setList(next.list);
      setGoals(next.goals);
      saveState(roomCode, next);
    },
    [roomCode],
  );

  const updateList = useCallback(
    (fn: (l: ShoppingListItem[]) => ShoppingListItem[]) => {
      commit({ list: fn(stateRef.current?.list ?? []) });
    },
    [commit],
  );

  const addProduct = useCallback(
    (product: ComparedProduct) => {
      const by = roleRef.current;
      updateList((l) => {
        const existing = l.find((i) => i.productId === product.id && i.addedBy === by && !i.checked);
        if (existing) {
          return l.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [
          ...l,
          { id: newId(), productId: product.id, product, quantity: 1, addedBy: by, checked: false },
        ];
      });
    },
    [updateList],
  );

  const optimization = useMemo(() => optimizeShoppingList(list, goals), [list, goals]);
  const activeTotal =
    goals.optimizationMode === "single-supermarket"
      ? optimization.bestSingleSupermarketTotalGbp
      : optimization.splitBasketTotalGbp;

  const quantities = useMemo(() => {
    const q: Record<string, number> = {};
    for (const i of list) q[i.productId] = (q[i.productId] ?? 0) + i.quantity;
    return q;
  }, [list]);

  const activeName = role === "yo" ? goals.member1Name || "Yo" : goals.member2Name || "Pareja";

  const applyRoom = () => {
    const next = normalizeRoomCode(roomDraft);
    setRoomDraft(next);
    if (next !== roomCode) {
      setReady(false);
      setRoomCode(next);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "compare", label: "Comparar", icon: <Search className="h-5 w-5" /> },
    { id: "list", label: `Lista (${list.length})`, icon: <ShoppingCart className="h-5 w-5" /> },
    { id: "diet", label: "Dieta & Ahorro", icon: <HeartPulse className="h-5 w-5" /> },
  ];

  const isCloud = transport.mode === "supabase-cloud";

  return (
    <div className="mx-auto min-h-screen max-w-3xl pb-24 md:pb-8">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 pb-3 pt-3 backdrop-blur [padding-top:max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base font-bold text-slate-900">
            Dieta<span className="text-emerald-600">Super</span> UK
          </h1>
          <span
            title={transport.details}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
              isCloud ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isCloud ? <Cloud className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
            {isCloud ? "Cloud" : "En vivo local"}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="inline-flex shrink-0 rounded-full bg-slate-200 p-0.5 text-xs font-semibold" role="group" aria-label="Perfil activo">
            {(["yo", "pareja"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`rounded-full px-3 py-1.5 ${
                  role === r ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600"
                }`}
              >
                {r === "yo" ? goals.member1Name || "Yo" : goals.member2Name || "Pareja"}
              </button>
            ))}
          </div>
          <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs">
            <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="sr-only">Código de sala</span>
            <input
              value={roomDraft}
              onChange={(e) => setRoomDraft(e.target.value)}
              onBlur={applyRoom}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              maxLength={24}
              spellCheck={false}
              autoCapitalize="characters"
              aria-label="Código de sala compartida"
              className="w-full min-w-0 bg-transparent font-mono text-base uppercase outline-none sm:text-xs"
            />
          </label>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Summary label="Total optimizado" value={formatGbp(activeTotal)} accent />
          <Summary label="Calorías" value={`${Math.round(optimization.nutritionSummary.totalCalories).toLocaleString("en-GB")} kcal`} />
          <Summary label="Proteína" value={`${Math.round(optimization.nutritionSummary.totalProteinGrams)} g`} />
        </div>

        <nav className="mt-3 hidden gap-1 md:flex" aria-label="Secciones">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                tab === t.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={`px-4 pt-4 ${ready ? "" : "opacity-60"}`}>
        {tab === "compare" && (
          <ProductComparator
            activeRole={role}
            activeName={activeName}
            onAdd={addProduct}
            quantities={quantities}
          />
        )}
        {tab === "list" && (
          <SharedShoppingList
            items={list}
            goals={goals}
            optimization={optimization}
            onToggleChecked={(id) =>
              updateList((l) => l.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
            }
            onQuantityChange={(id, qty) =>
              updateList((l) => l.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)))
            }
            onRemove={(id) => updateList((l) => l.filter((i) => i.id !== id))}
            onPreferredSupermarketChange={(id, sm: SupermarketId | undefined) =>
              updateList((l) => l.map((i) => (i.id === id ? { ...i, preferredSupermarket: sm } : i)))
            }
            onClearChecked={() => updateList((l) => l.filter((i) => !i.checked))}
          />
        )}
        {tab === "diet" && (
          <CoupleNutritionPanel
            goals={goals}
            optimization={optimization}
            itemCount={list.length}
            onGoalsChange={(g) => commit({ goals: g })}
          />
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden [padding-bottom:env(safe-area-inset-bottom)]"
        aria-label="Secciones"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              tab === t.id ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl px-2 py-1.5 ${accent ? "bg-emerald-50" : "bg-slate-50"}`}>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-sm font-bold ${accent ? "text-emerald-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
