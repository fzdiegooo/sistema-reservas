"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Reservation, ReservationPayload, Room } from "@/lib/types";

const reservationTemplate: ReservationPayload = {
  salaId: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  dniEncargado: "",
  nombresEncargado: "",
  apellidosEncargado: "",
  asistentes: "",
  descripcion: "",
};

const createReservationForm = (): ReservationPayload => ({
  ...reservationTemplate,
});

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

const formatHour = (value?: string) => (value ? value.slice(0, 5) : "--:--");

export default function DashboardPage() {
  const router = useRouter();
  const { session, logout, isAdmin } = useAuth();
  const token = session?.token ?? "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [reservationForm, setReservationForm] = useState<ReservationPayload>(() =>
    createReservationForm()
  );
  const [reservationStatus, setReservationStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [calendarLink, setCalendarLink] = useState<string | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  useEffect(() => {
    if (!reservationStatus) return;
    const timer = window.setTimeout(() => setReservationStatus(null), 4000);
    return () => window.clearTimeout(timer);
  }, [reservationStatus]);

  const [historyDate, setHistoryDate] = useState<string>("");
  const [history, setHistory] = useState<Reservation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [session, router]);

  const loadRooms = useCallback(async () => {
    if (!token) return;
    setRoomsLoading(true);
    setRoomsError(null);
    try {
      const data = await api.getRooms(token);
      setRooms(data);
    } catch (error) {
      setRoomsError(
        error instanceof Error ? error.message : "No se pudieron cargar las salas"
      );
    } finally {
      setRoomsLoading(false);
    }
  }, [token]);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      if (isAdmin) {
        const data = historyDate
          ? await api.getReservationsByDate(token, historyDate)
          : await api.getReservationHistory(token);
        setHistory(data);
      } else {
        const data = await api.getMyReservations(token);
        setHistory(data);
      }
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las reservas"
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [historyDate, isAdmin, token]);

  useEffect(() => {
    if (!token) return;
    loadRooms();
  }, [loadRooms, token]);

  useEffect(() => {
    if (!token) return;
    loadHistory();
  }, [loadHistory, token]);

  const upcomingReservation = useMemo(() => {
    if (!history.length) return null;
    const sorted = [...history].sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.horaInicio ?? "00:00"}`);
      const dateB = new Date(`${b.fecha}T${b.horaInicio ?? "00:00"}`);
      return dateA.getTime() - dateB.getTime();
    });
    const now = Date.now();
    return sorted.find((reservation) => {
      const date = new Date(`${reservation.fecha}T${reservation.horaInicio ?? "00:00"}`);
      return date.getTime() >= now;
    });
  }, [history]);

  const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    try {
      await api.createRoom(token, roomName);
      setRoomName("");
      loadRooms();
    } catch (error) {
      setRoomsError(
        error instanceof Error ? error.message : "No se pudo crear la sala"
      );
    }
  };

  const handleUpdateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !editingRoomId) return;
    try {
      await api.updateRoom(token, editingRoomId, editingName);
      setEditingRoomId(null);
      setEditingName("");
      loadRooms();
    } catch (error) {
      setRoomsError(
        error instanceof Error ? error.message : "No se pudo actualizar la sala"
      );
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!token) return;
    const confirmation = window.confirm("¿Eliminar sala definitivamente?");
    if (!confirmation) return;
    try {
      await api.deleteRoom(token, id);
      loadRooms();
    } catch (error) {
      setRoomsError(
        error instanceof Error ? error.message : "No se pudo eliminar la sala"
      );
    }
  };

  const handleReservationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setReservationStatus(null);
    setCalendarLink(null);
    setCalendarModalOpen(false);
    try {
      await api.createReservation(token, reservationForm);
      const roomName =
        rooms.find((room) => room.id === reservationForm.salaId)?.nombre ||
        "Sala reservada";
      const startDate = buildCalendarDateTime(
        reservationForm.fecha,
        reservationForm.horaInicio
      );
      const endDate = buildCalendarDateTime(
        reservationForm.fecha,
        reservationForm.horaFin
      );
      if (startDate && endDate) {
        const summary = `Reserva sala ${roomName}`;
        const details = formatCalendarDetails(reservationForm, roomName);
        setCalendarLink(createGoogleCalendarLink(summary, startDate, endDate, details));
        setCalendarModalOpen(true);
      }
      setReservationForm(createReservationForm());
      setReservationStatus({ type: "success", message: "Reserva generada" });
      loadHistory();
    } catch (error) {
      setReservationStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "No se pudo crear la reserva",
      });
    }
  };

  const stats = [
    { label: "Salas registradas", value: rooms.length },
    {
      label: isAdmin ? "Reservas totales" : "Mis reservas",
      value: history.length,
    },
    {
      label: "Próxima reserva",
      value: upcomingReservation
        ? `${formatDate(upcomingReservation.fecha)} · ${formatHour(
            upcomingReservation.horaInicio
          )}`
        : "Sin pendientes",
    },
  ];

  if (!session) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Redirigiendo al inicio de sesión...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/40 bg-surface p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tag mb-2 bg-surface-alt text-primary">
            {isAdmin ? "Rol ADMIN" : "Rol USER"}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            ¡Hola {session.user?.username ?? "usuario"}!
          </h1>
          <p className="text-sm text-slate-500">
            Gestiona las salas y monitorea las reservas desde un solo lugar.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-2xl border border-primary px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
            onClick={() => {
              loadRooms();
              loadHistory();
            }}
          >
            Sincronizar datos
          </button>
          <button
            type="button"
            className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-3xl border border-white/40 bg-surface p-6 shadow-lg"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {isAdmin && (
          <section className="rounded-3xl border border-white/40 bg-surface p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Salas</h2>
              {roomsLoading && <span className="text-xs text-slate-400">Actualizando...</span>}
            </div>
            {roomsError && (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {roomsError}
              </p>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleCreateRoom}>
              <div>
                <label className="text-sm font-semibold text-slate-600" htmlFor="roomName">
                  Nueva sala
                </label>
                <input
                  id="roomName"
                  type="text"
                  required
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/40"
                  placeholder="Laboratorio de ciencias"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                disabled={!roomName}
              >
                Registrar sala
              </button>
            </form>

            <ul className="mt-6 space-y-3">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{room.nombre}</p>
                    {room.descripcion && (
                      <p className="text-sm text-slate-500">{room.descripcion}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                      onClick={() => {
                        setEditingRoomId(room.id);
                        setEditingName(room.nombre);
                      }}
                    >
                      Renombrar
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
              {!rooms.length && (
                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                  Sin salas registradas todavía.
                </p>
              )}
            </ul>

            {editingRoomId && (
              <form className="mt-6 space-y-4 rounded-2xl border border-slate-200 p-4" onSubmit={handleUpdateRoom}>
                <p className="text-sm font-semibold text-slate-600">Renombrar sala</p>
                <input
                  type="text"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
                    onClick={() => {
                      setEditingRoomId(null);
                      setEditingName("");
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        <section className="rounded-3xl border border-white/40 bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Nueva reserva</h2>
            {reservationStatus && (
              <span
                className={`text-xs font-semibold ${
                  reservationStatus.type === "success"
                    ? "text-green-600"
                    : "text-rose-600"
                }`}
              >
                {reservationStatus.message}
              </span>
            )}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleReservationSubmit}>
            <div>
              <label className="text-sm font-semibold text-slate-600" htmlFor="salaId">
                Sala
              </label>
              <select
                id="salaId"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                required
                value={reservationForm.salaId}
                onChange={(event) =>
                  setReservationForm((prev) => ({
                    ...prev,
                    salaId: event.target.value,
                  }))
                }
              >
                <option value="">Selecciona una sala</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-600" htmlFor="fecha">
                  Fecha
                </label>
                <input
                  id="fecha"
                  type="date"
                  required
                  value={reservationForm.fecha}
                  onChange={(event) =>
                    setReservationForm((prev) => ({
                      ...prev,
                      fecha: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-600" htmlFor="horaInicio">
                    Desde
                  </label>
                  <input
                    id="horaInicio"
                    type="time"
                    required
                    value={reservationForm.horaInicio}
                    onChange={(event) =>
                      setReservationForm((prev) => ({
                        ...prev,
                        horaInicio: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600" htmlFor="horaFin">
                    Hasta
                  </label>
                  <input
                    id="horaFin"
                    type="time"
                    required
                    value={reservationForm.horaFin}
                    onChange={(event) =>
                      setReservationForm((prev) => ({
                        ...prev,
                        horaFin: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-slate-600" htmlFor="dniEncargado">
                  DNI del encargado
                </label>
                <input
                  id="dniEncargado"
                  type="text"
                  required
                  value={reservationForm.dniEncargado}
                  onChange={(event) =>
                    setReservationForm((prev) => ({
                      ...prev,
                      dniEncargado: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600" htmlFor="nombresEncargado">
                  Nombres
                </label>
                <input
                  id="nombresEncargado"
                  type="text"
                  required
                  value={reservationForm.nombresEncargado}
                  onChange={(event) =>
                    setReservationForm((prev) => ({
                      ...prev,
                      nombresEncargado: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  placeholder="María José"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600" htmlFor="apellidosEncargado">
                  Apellidos
                </label>
                <input
                  id="apellidosEncargado"
                  type="text"
                  required
                  value={reservationForm.apellidosEncargado}
                  onChange={(event) =>
                    setReservationForm((prev) => ({
                      ...prev,
                      apellidosEncargado: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  placeholder="Fernández López"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600" htmlFor="asistentes">
                Asistentes (opcional)
              </label>
              <input
                id="asistentes"
                type="text"
                value={reservationForm.asistentes ?? ""}
                onChange={(event) =>
                  setReservationForm((prev) => ({
                    ...prev,
                    asistentes: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                placeholder="Curso 5B"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                rows={3}
                value={reservationForm.descripcion}
                onChange={(event) =>
                  setReservationForm((prev) => ({
                    ...prev,
                    descripcion: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                placeholder="Clase de ciencias – laboratorio"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
              disabled={!rooms.length}
            >
              Crear reserva
            </button>
          </form>
        </section>

        {!isAdmin && (
          <section className="rounded-3xl border border-white/40 bg-surface p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="tag mb-2 bg-surface-alt text-primary">Histórico</p>
                <h2 className="text-xl font-semibold text-slate-900">Mis reservas</h2>
              </div>
              {historyLoading && <span className="text-xs text-slate-400">Actualizando...</span>}
            </div>

            {historyError && (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {historyError}
              </p>
            )}

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-2">Sala</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Horario</th>
                    <th className="px-4 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((reservation) => (
                    <tr
                      key={
                        reservation.id ??
                        `${reservation.sala?.id}-${reservation.fecha}-${reservation.horaInicio}`
                      }
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {reservation.sala?.nombre ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(reservation.fecha)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatHour(reservation.horaInicio)} - {formatHour(reservation.horaFin)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-slate-700">
                          {reservation.estado ?? "Solicitada"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!historyLoading && !history.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        Aún no hay reservas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {isAdmin && (
        <section className="mt-10 rounded-3xl border border-white/40 bg-surface p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="tag mb-2 bg-surface-alt text-primary">Histórico</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {isAdmin ? "Reservas del colegio" : "Mis reservas"}
            </h2>
            <p className="text-sm text-slate-500">
              Filtra por fecha para revisar la agenda diaria.
            </p>
          </div>
          {isAdmin && (
            <div>
              <label className="text-xs font-semibold text-slate-500" htmlFor="historyDate">
                Fecha
              </label>
              <input
                id="historyDate"
                type="date"
                value={historyDate}
                onChange={(event) => setHistoryDate(event.target.value)}
                className="mt-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          )}
        </div>

        {historyError && (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {historyError}
          </p>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-4 py-2">Sala</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Horario</th>
                <th className="px-4 py-2">Solicitante</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((reservation) => (
                <tr key={reservation.id ?? `${reservation.sala?.id}-${reservation.fecha}-${reservation.horaInicio}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {reservation.sala?.nombre ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(reservation.fecha)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatHour(reservation.horaInicio)} - {formatHour(reservation.horaFin)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {reservation.usuario?.username ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-slate-700">
                      {reservation.estado ?? (isAdmin ? "Pendiente" : "Solicitada")}
                    </span>
                  </td>
                </tr>
              ))}
              {!historyLoading && !history.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Aún no hay reservas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </section>
      )}

      {calendarModalOpen && calendarLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6">
            <h3 className="text-2xl font-semibold text-slate-900">
              Reserva creada
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Puedes añadir este evento a tu Google Calendar para no olvidarlo.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white hover:bg-primary-strong"
              >
                Abrir en Google Calendar
              </a>
              <button
                type="button"
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                onClick={() => {
                  setCalendarModalOpen(false);
                  setCalendarLink(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const buildCalendarDateTime = (date: string, time: string) => {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const createGoogleCalendarLink = (
  summary: string,
  start: string,
  end: string,
  details: string
) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${start}/${end}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const formatCalendarDetails = (reservation: ReservationPayload, roomName: string) => {
  const parts = [
    `Sala: ${roomName}`,
    `Encargado: ${reservation.nombresEncargado} ${reservation.apellidosEncargado}`,
    `DNI: ${reservation.dniEncargado}`,
  ];
  if (reservation.asistentes) parts.push(`Asistentes: ${reservation.asistentes}`);
  if (reservation.descripcion) parts.push(`Descripción: ${reservation.descripcion}`);
  return parts.join("\n");
};
