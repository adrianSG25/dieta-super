import {
  CoupleGoals,
  CoupleMemberRole,
  ShoppingListItem,
} from "@/types/dietasuper";

export interface CoupleSharedState {
  list: ShoppingListItem[];
  goals: CoupleGoals;
  updatedAt: string;
  updatedBy: CoupleMemberRole;
  roomCode: string;
}

export const DEFAULT_COUPLE_GOALS: CoupleGoals = {
  member1Name: "Yo",
  member2Name: "Pareja",
  dailyCaloriesTargetTotal: 4200,
  dailyProteinTargetGrams: 260,
  weeklyBudgetGbp: 75,
  optimizationMode: "cheapest-total",
};

export interface SyncTransportInfo {
  mode: "local-realtime" | "supabase-cloud";
  label: string;
  details: string;
}

const DEFAULT_ROOM_CODE = "DIETA-UK";
const LAST_ROOM_STORAGE_KEY = "dietasuper:last-room";
const ROOM_STORAGE_PREFIX = "dietasuper:room:";
const BROADCAST_PREFIX = "dietasuper-sync-";
const SUPABASE_TABLE = "dietasuper_rooms";
const SUPABASE_POLL_INTERVAL_MS = 5000;

const TAB_ID =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `tab-${Math.random().toString(36).slice(2)}`;

const latestSavedAtByRoom = new Map<string, string>();

interface BroadcastPayload {
  type: "state-update";
  senderTabId: string;
  state: CoupleSharedState;
}

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return null;
  }
  return {
    url: url.replace(/\/+$/, ""),
    anonKey,
  };
}

export function getSyncTransportInfo(): SyncTransportInfo {
  if (getSupabaseConfig()) {
    return {
      mode: "supabase-cloud",
      label: "Cloud Sync",
      details:
        "Sincronización entre dispositivos vía Supabase REST + BroadcastChannel local.",
    };
  }
  return {
    mode: "local-realtime",
    label: "En vivo local",
    details:
      "Persistencia localStorage y sincronización instantánea entre pestañas con BroadcastChannel.",
  };
}

export function normalizeRoomCode(roomCode: string): string {
  const cleaned = roomCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
  return cleaned || DEFAULT_ROOM_CODE;
}

function getRoomStorageKey(roomCode: string): string {
  return `${ROOM_STORAGE_PREFIX}${normalizeRoomCode(roomCode)}`;
}

function getBroadcastChannelName(roomCode: string): string {
  return `${BROADCAST_PREFIX}${normalizeRoomCode(roomCode)}`;
}

export function createDefaultSharedState(roomCode: string): CoupleSharedState {
  return {
    list: [],
    goals: { ...DEFAULT_COUPLE_GOALS },
    updatedAt: new Date().toISOString(),
    updatedBy: "yo",
    roomCode: normalizeRoomCode(roomCode),
  };
}

function parseSharedState(
  raw: unknown,
  fallbackRoomCode: string
): CoupleSharedState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const candidate = raw as Partial<CoupleSharedState>;
  if (!Array.isArray(candidate.list) || !candidate.goals || typeof candidate.goals !== "object") {
    return null;
  }

  return {
    list: candidate.list,
    goals: {
      ...DEFAULT_COUPLE_GOALS,
      ...candidate.goals,
    },
    updatedAt:
      typeof candidate.updatedAt === "string"
        ? candidate.updatedAt
        : new Date().toISOString(),
    updatedBy: candidate.updatedBy === "pareja" ? "pareja" : "yo",
    roomCode: normalizeRoomCode(candidate.roomCode || fallbackRoomCode),
  };
}

export function getInitialRoomCode(): string {
  if (typeof window === "undefined") {
    return DEFAULT_ROOM_CODE;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room");
    if (urlRoom && urlRoom.trim().length > 0) {
      const normalized = normalizeRoomCode(urlRoom);
      window.localStorage.setItem(LAST_ROOM_STORAGE_KEY, normalized);
      return normalized;
    }

    const storedRoom = window.localStorage.getItem(LAST_ROOM_STORAGE_KEY);
    if (storedRoom && storedRoom.trim().length > 0) {
      return normalizeRoomCode(storedRoom);
    }

    window.localStorage.setItem(LAST_ROOM_STORAGE_KEY, DEFAULT_ROOM_CODE);
  } catch {
    // Ignorar errores de acceso a localStorage en navegadores restrictivos.
  }

  return DEFAULT_ROOM_CODE;
}

export function loadState(roomCode: string): CoupleSharedState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const normalizedRoom = normalizeRoomCode(roomCode);
  try {
    const raw = window.localStorage.getItem(getRoomStorageKey(normalizedRoom));
    if (!raw) {
      return null;
    }
    return parseSharedState(JSON.parse(raw), normalizedRoom);
  } catch {
    return null;
  }
}

function buildFetchTimeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  return undefined;
}

async function pushStateToSupabase(
  roomCode: string,
  state: CoupleSharedState
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) {
    return;
  }

  try {
    await fetch(`${config.url}/rest/v1/${SUPABASE_TABLE}?on_conflict=room_code`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        room_code: normalizeRoomCode(roomCode),
        state,
        updated_at: state.updatedAt,
      }),
      signal: buildFetchTimeoutSignal(4500),
    });
  } catch {
    // La sincronización local permanece intacta aunque falle la red cloud.
  }
}

export async function fetchRemoteState(
  roomCode: string
): Promise<CoupleSharedState | null> {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const normalizedRoom = normalizeRoomCode(roomCode);
  try {
    const response = await fetch(
      `${config.url}/rest/v1/${SUPABASE_TABLE}?room_code=eq.${encodeURIComponent(
        normalizedRoom
      )}&select=state,updated_at&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Accept: "application/json",
        },
        signal: buildFetchTimeoutSignal(4500),
      }
    );

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as Array<{
      state?: unknown;
      updated_at?: string;
    }>;
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return parseSharedState(rows[0]?.state, normalizedRoom);
  } catch {
    return null;
  }
}

export function saveState(
  roomCode: string,
  state: CoupleSharedState
): CoupleSharedState {
  const normalizedRoom = normalizeRoomCode(roomCode);
  const nextState: CoupleSharedState = {
    list: state.list,
    goals: {
      ...DEFAULT_COUPLE_GOALS,
      ...state.goals,
    },
    updatedAt: state.updatedAt || new Date().toISOString(),
    updatedBy: state.updatedBy,
    roomCode: normalizedRoom,
  };

  latestSavedAtByRoom.set(normalizedRoom, nextState.updatedAt);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        getRoomStorageKey(normalizedRoom),
        JSON.stringify(nextState)
      );
      window.localStorage.setItem(LAST_ROOM_STORAGE_KEY, normalizedRoom);
    } catch {
      // Evita fallo fatal si localStorage está lleno o bloqueado.
    }

    if (typeof BroadcastChannel !== "undefined") {
      try {
        const channel = new BroadcastChannel(
          getBroadcastChannelName(normalizedRoom)
        );
        const payload: BroadcastPayload = {
          type: "state-update",
          senderTabId: TAB_ID,
          state: nextState,
        };
        channel.postMessage(payload);
        channel.close();
      } catch {
        // Ignorar si BroadcastChannel no está disponible en el contexto actual.
      }
    }
  }

  if (getSupabaseConfig()) {
    void pushStateToSupabase(normalizedRoom, nextState);
  }

  return nextState;
}

export function subscribeToState(
  roomCode: string,
  onUpdate: (state: CoupleSharedState) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const normalizedRoom = normalizeRoomCode(roomCode);
  const storageKey = getRoomStorageKey(normalizedRoom);
  let lastAppliedUpdatedAt = loadState(normalizedRoom)?.updatedAt ?? "";
  let disposed = false;

  const emitIfNewer = (incoming: CoupleSharedState | null) => {
    if (disposed || !incoming) {
      return;
    }
    const localSavedAt = latestSavedAtByRoom.get(normalizedRoom) ?? "";
    const latestKnown =
      localSavedAt > lastAppliedUpdatedAt ? localSavedAt : lastAppliedUpdatedAt;
    if (latestKnown && incoming.updatedAt <= latestKnown) {
      return;
    }
    lastAppliedUpdatedAt = incoming.updatedAt;
    onUpdate(incoming);
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) {
      return;
    }
    try {
      const parsed = parseSharedState(JSON.parse(event.newValue), normalizedRoom);
      emitIfNewer(parsed);
    } catch {
      // Ignorar JSON corrupto.
    }
  };

  window.addEventListener("storage", handleStorage);

  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    try {
      channel = new BroadcastChannel(getBroadcastChannelName(normalizedRoom));
      channel.onmessage = (event: MessageEvent<unknown>) => {
        const data = event.data as Partial<BroadcastPayload> | null;
        if (!data || data.type !== "state-update" || data.senderTabId === TAB_ID) {
          return;
        }
        const parsed = parseSharedState(data.state, normalizedRoom);
        emitIfNewer(parsed);
      };
    } catch {
      channel = null;
    }
  }

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  if (getSupabaseConfig()) {
    const syncRemote = async () => {
      const remote = await fetchRemoteState(normalizedRoom);
      if (!remote || disposed) {
        return;
      }
      if (!lastAppliedUpdatedAt || remote.updatedAt > lastAppliedUpdatedAt) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(remote));
        } catch {
          // Ignorar error de almacenamiento local.
        }
        emitIfNewer(remote);
      }
    };

    void syncRemote();
    pollTimer = setInterval(() => {
      void syncRemote();
    }, SUPABASE_POLL_INTERVAL_MS);
  }

  return () => {
    disposed = true;
    window.removeEventListener("storage", handleStorage);
    if (channel) {
      channel.close();
    }
    if (pollTimer) {
      clearInterval(pollTimer);
    }
  };
}
