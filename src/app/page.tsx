import Link from "next/link";

const highlights = [
  {
    title: "Panel Administrativo",
    bullets: [
      "Crea, renombra o desactiva salas en segundos",
      "Consulta el histórico de reservas por fecha",
      "Detecta choques horarios antes de aprobar",
    ],
  },
  {
    title: "Portal Docente",
    bullets: [
      "Reserva desde cualquier dispositivo",
      "Revisa tus próximos préstamos",
      "Recibe confirmaciones en tiempo real",
    ],
  },
  {
    title: "API Unificada",
    bullets: [
      "JWT seguro con roles ADMIN / USER",
      "Endpoints REST listos para integrar",
      "Mismo backend para web y móvil",
    ],
  },
];

const steps = [
  {
    title: "1. Regístrate",
    description: "Crea tu usuario o entrega accesos a los administradores del colegio.",
  },
  {
    title: "2. Configura salas",
    description:
      "El panel permite cargar auditorios, laboratorios o cualquier espacio compartido.",
  },
  {
    title: "3. Comienza a reservar",
    description: "Los docentes eligen sala, fecha y horario; el sistema se encarga del resto.",
  },
];

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-12 px-5 py-16 lg:py-24">
      <section className="glass-panel rounded-3xl p-10 text-center shadow-2xl md:text-left">
        <p className="mx-auto mb-4 w-fit bg-surface-alt text-primary md:mx-0 text-5xl font-bold">
          Sistema integral de reservas escolares
        </p>
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-center">
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Agenda los salones del colegio sin llamadas ni planillas.
            </h1>
            <p className="text-lg text-slate-600">
              Una sola aplicación para que el equipo directivo gestione la disponibilidad
              y los docentes puedan reservar laboratorios, auditorios o salas especiales con
              total visibilidad.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-white hover:text-primary hover:border hover:border-primary hover:scale-[1.03] hover:shadow-blue-500/20"
              >
                Ingresar al panel
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-primary px-6 py-3 font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-white hover:scale-[1.03] hover:border-primary"
              >
                Crear cuenta docente
              </Link>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/60 bg-surface p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Roles</p>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-slate-900/90 p-4 text-white">
                <p className="text-sm text-slate-300">Administrador</p>
                <p className="text-2xl font-semibold">Control total de salas</p>
              </div>
              <div className="rounded-2xl bg-blue-100 p-4">
                <p className="text-sm text-blue-700">Usuario</p>
                <p className="text-xl font-semibold text-blue-900">Reservas en segundos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {highlights.map((block) => (
          <article
            key={block.title}
            className="rounded-3xl border border-white/60 bg-surface p-6 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-slate-900">{block.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {block.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-white/50 bg-surface p-8 shadow-xl">
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="space-y-2">
              <p className="text-sm font-semibold text-primary">{step.title}</p>
              <p className="text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
