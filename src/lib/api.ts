import {
  CredentialsPayload,
  LoginResponse,
  Reservation,
  ReservationPayload,
  Room,
} from "@/lib/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

const ensureBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error(
      "Configura la variable NEXT_PUBLIC_API_BASE_URL en tu entorno (.env.local)."
    );
  }
  return API_BASE_URL;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const raw = await response.text();

  let data: unknown = null;

  if (raw) {
    if (isJson) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
    } else {
      data = raw;
    }
  }

  const extractMessage = (): string => {
    if (typeof data === "object" && data !== null) {
      const payload = data as Record<string, unknown>;
      if (typeof payload.message === "string") return payload.message;
      if (typeof payload.error === "string") return payload.error;
    }
    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }
    if (raw.trim().length > 0) {
      return raw;
    }
    return `Error ${response.status}`;
  };

  if (!response.ok) {
    throw new Error(extractMessage());
  }

  return (data ?? undefined) as T;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${ensureBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

export const api = {
  login: (payload: CredentialsPayload) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: CredentialsPayload) =>
    request<void>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getRooms: (token: string) =>
    request<Room[]>("/api/salas", { method: "GET" }, token),

  createRoom: (token: string, nombre: string) =>
    request<Room>(
      "/api/salas",
      {
        method: "POST",
        body: JSON.stringify({ nombre }),
      },
      token
    ),

  updateRoom: (token: string, id: string, nombre: string) =>
    request<Room>(
      `/api/salas/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ nombre }),
      },
      token
    ),

  deleteRoom: (token: string, id: string) =>
    request<void>(`/api/salas/${id}`, { method: "DELETE" }, token),

  createReservation: (token: string, payload: ReservationPayload) => {
    const { salaId, ...rest } = payload;
    return request<Reservation>(
      "/api/reservas",
      {
        method: "POST",
        body: JSON.stringify({
          ...rest,
          sala: { id: salaId },
        }),
      },
      token
    );
  },

  getReservationsByDate: (token: string, fecha?: string) => {
    const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
    return request<Reservation[]>(`/api/reservas${query}`, { method: "GET" }, token);
  },

  getReservationHistory: (token: string) =>
    request<Reservation[]>("/api/reservas/historico", { method: "GET" }, token),

  getMyReservations: (token: string) =>
    request<Reservation[]>("/api/reservas/mis-reservas", { method: "GET" }, token),
};

export type ApiClient = typeof api;
