export type UserRole = "ADMIN" | "USER";

export interface AuthUser {
  username: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface Room {
  id: string;
  nombre: string;
  capacidad?: number;
  descripcion?: string;
}

export interface Reservation {
  id: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  dniEncargado?: string;
  nombresEncargado?: string;
  apellidosEncargado?: string;
  asistentes?: string;
  descripcion?: string;
  estado?: string;
  createdAt?: string;
  sala: Room;
  usuario?: {
    id?: string;
    username: string;
  };
}

export interface CredentialsPayload {
  username: string;
  password: string;
}

export interface ReservationPayload {
  salaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  dniEncargado: string;
  nombresEncargado: string;
  apellidosEncargado: string;
  asistentes?: string;
  descripcion?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
