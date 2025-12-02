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
    description: "El panel permite cargar auditorios, laboratorios o cualquier espacio compartido.",
  },
  {
    title: "3. Comienza a reservar",
    description: "Los docentes eligen sala, fecha y horario; el sistema se encarga del resto.",
  },
];

export default function Home() {
  return (
    <>
      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-16 px-5 py-16 lg:py-24">
        {/* Sección principal */}
        <section
          className="glass-panel rounded-3xl p-10 text-center shadow-2xl md:text-left bg-gradient-to-r from-blue-50 to-white"
          role="region"
          aria-labelledby="titulo-principal"
        >
          <p
            id="titulo-principal"
            className="mx-auto mb-6 w-fit md:mx-0 text-6xl sm:text-7xl font-extrabold leading-tight tracking-tight text-primary"
          >
            Sistema integral de reservas escolares
          </p>

          <div className="grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-center max-w-[90%] mx-auto">
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-800 leading-snug">
                Agenda los salones del colegio sin llamadas ni planillas.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-prose">
                Una sola aplicación para que el equipo directivo gestione la disponibilidad
                y los docentes puedan reservar laboratorios, auditorios o salas especiales con
                total visibilidad.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:bg-white hover:text-primary hover:border hover:border-primary hover:scale-105 hover:shadow-lg focus:outline-none focus:ring focus:ring-primary/50 active:scale-95 motion-safe:transform-gpu"
                  aria-label="Ingresar al panel administrativo"
                >
                  Ingresar al panel
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-2xl border border-primary px-6 py-3 font-medium text-primary shadow-md transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 hover:border-primary focus:outline-none focus:ring focus:ring-primary/50 active:scale-95 motion-safe:transform-gpu"
                  aria-label="Crear cuenta para docente"
                >
                  Crear cuenta docente
                </Link>
              </div>
            </div>

            <div
              className="space-y-4 rounded-2xl border border-white/60 bg-surface p-6 shadow-xl"
              role="region"
              aria-labelledby="titulo-roles"
            >
              <p
                id="titulo-roles"
                className="text-2xl font-semibold uppercase tracking-wide text-slate-400"
              >
                Roles
              </p>
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-slate-900/90 p-4 text-white min-h-[120px] transition-all duration-300 hover:shadow-lg hover:bg-opacity-90">
                  <p className="text-2xl font-semibold text-slate-300">Administrador</p>
                  <p className="text-2xl font-semibold">Control total de salas</p>
                </div>
                <div className="rounded-2xl bg-blue-100 p-4 min-h-[120px] transition-all duration-300 hover:shadow-lg hover:bg-blue-200">
                  <p className="text-2xl font-semibold text-blue-700">Usuario</p>
                  <p className="text-2xl font-semibold text-blue-900">Reservas en segundos</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section
          className="grid gap-6 lg:grid-cols-3 max-w-[90%] mx-auto"
          role="region"
          aria-labelledby="titulo-highlights"
        >
          <h2 id="titulo-highlights" className="sr-only">Características principales</h2>
          {highlights.map((block) => (
            <article
              key={block.title}
              className="rounded-3xl border border-white/60 bg-surface p-6 shadow-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">{block.title}</h3>
              <ul className="mt-4 space-y-2 text-sm sm:text-base text-slate-600">
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

        {/* Steps */}
        <section
          className="rounded-3xl border border-white/50 bg-surface p-8 shadow-xl max-w-[90%] mx-auto"
          role="region"
          aria-labelledby="titulo-steps"
        >
          <h2 id="titulo-steps" className="sr-only">Pasos para comenzar</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="space-y-2 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                <p className="text-sm sm:text-base font-semibold text-primary">{step.title}</p>
                <p className="text-base sm:text-lg text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo o nombre */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Reservas Escolares</h3>
            <p className="text-sm text-slate-300">
              Simplificando la gestión de salas para colegios y docentes.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Enlaces</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Ingresar
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Crear cuenta
                </Link>
              </li>
              <li>
                <a href="#contacto" className="hover:text-primary transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Derechos */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Legal</h4>
            <p className="text-sm text-slate-400">© {new Date().getFullYear()} Reservas Escolares. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}