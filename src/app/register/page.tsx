"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { CredentialsPayload, LoginResponse } from "@/lib/types";

const apiConfigured = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [form, setForm] = useState<CredentialsPayload & { confirmPassword: string }>(
    {
      username: "",
      password: "",
      confirmPassword: "",
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await api.register({ username: form.username, password: form.password });
      const response: LoginResponse = await api.login({
        username: form.username,
        password: form.password,
      });
      setSession(response);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-xl flex-col justify-center px-4 py-12">
      <div className="glass-panel rounded-3xl p-8">
        <p className="tag mb-4 bg-surface-alt text-primary">Crear usuario</p>
        <h1 className="text-3xl font-semibold text-slate-900">Registro docente</h1>
        <p className="mt-2 text-sm text-slate-500">
          Los nuevos usuarios reciben permisos de tipo USER. Los roles ADMIN se asignan desde
          la API.
        </p>

        {!apiConfigured && (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Configura la variable <code>NEXT_PUBLIC_API_BASE_URL</code> en tu archivo .env.local.
          </p>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={form.username}
              onChange={handleChange("username")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="profe.ciencias"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange("password")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="********"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
              Repetir contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="********"
            />
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes usuario?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
