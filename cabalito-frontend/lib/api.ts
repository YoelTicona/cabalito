import type {
  EventOut,
  EventPage,
  EventTypeOut,
  LoginResponse,
  PriceHistoryOut,
  ProductOut,
  ProductPage,
  RadarProduct,
  RegionOut,
  ChatResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "cabalito_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { authed?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.authed) {
    const token = getToken();
    // Nota: el backend define el header como "authorization" (string libre).
    // Si tu FastAPI espera el prefijo "Bearer ", cambia la linea de abajo a:
    // headers.authorization = `Bearer ${token}`;
    if (token) headers.authorization = token;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail ? JSON.stringify(body.detail) : detail;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Auth ----
export const login = (username: string, password: string) =>
  request<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// ---- Public: radar / productos / chat / reportes ----
export const getRadar = () => request<RadarProduct[]>("/api/v1/products/radar");

export const getProductHistory = (productId: number) =>
  request<PriceHistoryOut[]>(`/api/v1/products/${productId}/history`);

export const reportEvent = (payload: {
  event_id: number;
  reported_price?: number;
  product_id?: number;
}) =>
  request<unknown>("/api/v1/events/report", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getActiveEvents = () => request<EventOut[]>("/api/v1/events/active");

export const askCasera = (productId: number, userMessage: string) =>
  request<ChatResponse>("/api/v1/chat/casera", {
    method: "POST",
    body: JSON.stringify({ productId, userMessage }),
  });

// ---- Admin: eventos ----
export const listEvents = (params: { search?: string; status?: string; page?: number; size?: number }) => {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  q.set("page", String(params.page ?? 1));
  q.set("size", String(params.size ?? 10));
  return request<EventPage>(`/api/v1/admin/events?${q.toString()}`, { authed: true });
};

export const getEvent = (id: number) =>
  request<EventOut>(`/api/v1/admin/events/${id}`, { authed: true });

export const createEvent = (payload: {
  region_id: number;
  event_type_id: number;
  description?: string;
  severity?: string;
}) =>
  request<EventOut>("/api/v1/admin/events", {
    method: "POST",
    authed: true,
    body: JSON.stringify(payload),
  });

export const patchEventStatus = (id: number) =>
  request<EventOut>(`/api/v1/admin/events/${id}/status`, { method: "PATCH", authed: true });

export const forceTrigger = (eventId: number) =>
  request<unknown>("/api/v1/admin/events/trigger-force", {
    method: "POST",
    authed: true,
    body: JSON.stringify({ event_id: eventId }),
  });

// ---- Admin: regiones ----
export const listRegions = (search?: string) => {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<RegionOut[]>(`/api/v1/admin/regions${q}`, { authed: true });
};

export const createRegion = (payload: {
  name: string;
  weather_api_location?: string;
  latitude?: number;
  longitude?: number;
}) =>
  request<RegionOut>("/api/v1/admin/regions", {
    method: "POST",
    authed: true,
    body: JSON.stringify(payload),
  });

export const updateRegion = (
  id: number,
  payload: { name: string; weather_api_location?: string; latitude?: number; longitude?: number }
) =>
  request<RegionOut>(`/api/v1/admin/regions/${id}`, {
    method: "PUT",
    authed: true,
    body: JSON.stringify(payload),
  });

export const patchRegionStatus = (id: number) =>
  request<RegionOut>(`/api/v1/admin/regions/${id}/status`, { method: "PATCH", authed: true });

// ---- Admin: tipos de evento ----
export const listEventTypes = (search?: string) => {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<EventTypeOut[]>(`/api/v1/admin/event-types${q}`, { authed: true });
};

export const createEventType = (name: string) =>
  request<EventTypeOut>("/api/v1/admin/event-types", {
    method: "POST",
    authed: true,
    body: JSON.stringify({ name }),
  });

export const patchEventTypeStatus = (id: number) =>
  request<EventTypeOut>(`/api/v1/admin/event-types/${id}/status`, { method: "PATCH", authed: true });

// ---- Admin: productos ----
export const listProducts = (params: { search?: string; status?: string; page?: number; size?: number }) => {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  q.set("page", String(params.page ?? 1));
  q.set("size", String(params.size ?? 10));
  return request<ProductPage>(`/api/v1/admin/products?${q.toString()}`, { authed: true });
};

export const createProduct = (payload: {
  name: string;
  origin_region_id: number;
  current_price: number;
  market_status?: string;
}) =>
  request<ProductOut>("/api/v1/admin/products", {
    method: "POST",
    authed: true,
    body: JSON.stringify(payload),
  });

export const updateProduct = (
  id: number,
  payload: { name: string; origin_region_id: number; current_price: number; market_status?: string }
) =>
  request<ProductOut>(`/api/v1/admin/products/${id}`, {
    method: "PUT",
    authed: true,
    body: JSON.stringify(payload),
  });

export const patchProductStatus = (id: number) =>
  request<ProductOut>(`/api/v1/admin/products/${id}/status`, { method: "PATCH", authed: true });
