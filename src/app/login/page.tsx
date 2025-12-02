"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { CredentialsPayload, LoginResponse } from "@/lib/types";

const apiConfigured = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);
const isProduction = process.env.NODE_ENV === "production"; 

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  
  // NUEVO: Estado para el checkbox
  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState<CredentialsPayload>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof CredentialsPayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Nota: Aquí podrías enviar 'rememberMe' a tu API si el backend lo soporta
      // Ejemplo: await api.login({ ...form, remember: rememberMe });
      const response: LoginResponse = await api.login(form);
      setSession(response);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50">
      {/* Fondo decorativo */}
      <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[100px]" />

      <div className="z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="mx-4 overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-8 shadow-xl backdrop-blur-xl sm:px-10">
          
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h1>
            <p className="mt-2 text-sm text-slate-500">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {!apiConfigured && !isProduction && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800">
              ⚠️ Configura <code>NEXT_PUBLIC_API_BASE_URL</code> en .env.local
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="group">
              <label className="mb-1 block text-xs font-medium text-slate-500 uppercase tracking-wider" htmlFor="username">
                Usuario
              </label>
              <div className="relative transition-all duration-300 focus-within:scale-[1.01]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange("username")}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 pl-11 pr-4 py-3 text-sm text-slate-900 outline-none ring-offset-2 transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  placeholder="Ej: coordinacion"
                />
              </div>
            </div>

            <div className="group">
              <label className="mb-1 block text-xs font-medium text-slate-500 uppercase tracking-wider" htmlFor="password">
                Contraseña
              </label>
              <div className="relative transition-all duration-300 focus-within:scale-[1.01]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange("password")}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 pl-11 pr-11 py-3 text-sm text-slate-900 outline-none ring-offset-2 transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-4 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.68 0 1.356-.06 2-.17"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* --- NUEVO BLOQUE: Checkbox Recordarme --- */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                Recordarme
              </label>
              {/* Opcional: Link de olvidé contraseña alineado a la derecha */}
              <Link href="#" className="text-sm font-medium text-primary hover:text-primary-strong hover:underline">
                ¿Olvidaste tu clave?
              </Link>
            </div>
            {/* ----------------------------------------- */}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-strong hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? "Verificando..." : "Ingresar al sistema"}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            ¿No tienes credenciales?{" "}
            <Link href="/register" className="font-semibold text-primary transition hover:text-primary-strong hover:underline">
              Contacta a soporte
            </Link>
          </p>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400 opacity-60">
          © {new Date().getFullYear()} Sistema de Reservas. Todos los derechos reservados.
        </p>
      </div>
    </section>
  );
}