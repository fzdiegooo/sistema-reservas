## Sistema de reservas escolares

Interfaz en Next.js 16 que consume la API externa de reservas para colegios. Incluye flujos de autenticación, panel administrativo y panel de usuario final.

### Características clave

- **Autenticación JWT**: login y registro (rol USER por defecto) consumiendo `/api/auth/*`.
- **Gestión de salas**: alta, edición y baja desde `/api/salas` (solo ADMIN).
- **Reservas**: creación, filtrado por fecha e históricos usando `/api/reservas*`.
- **Contexto global**: almacenamiento seguro del token y rol en `localStorage`.
- **UI responsiva**: dashboards diferenciados para ADMIN y USER.

### Requisitos previos

- Node.js 18.18+ o 20+.
- Backend disponible con los endpoints descritos por el usuario.

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto e incluye la URL base del backend:

```env
NEXT_PUBLIC_API_BASE_URL=https://tu-backend.com
```

> El valor debe incluir protocolo y no llevar `/` al final (el código elimina el último slash automáticamente).

### Scripts disponibles

```bash
npm run dev      # arranca el entorno de desarrollo
npm run build    # genera la versión optimizada de producción
npm run start    # sirve la build en modo producción
npm run lint     # ejecuta ESLint sobre todo el proyecto
```

### Flujo de trabajo

1. **Registro/Login**: usa `/register` o `/login` para obtener el JWT.
2. **Dashboard**: `/dashboard` detecta el rol y despliega la vista correspondiente.
3. **Gestión de salas** (ADMIN): crea, renombra o elimina salas y revisa el histórico completo.
4. **Reservas de usuario** (USER): genera nuevas reservas y consulta el historial personal.

### Integración con la API

El cliente HTTP reside en `src/lib/api.ts` y usa siempre el host configurado mediante `NEXT_PUBLIC_API_BASE_URL`. Los endpoints consumidos son:

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/api/auth/register` | Crea usuarios USER |
| POST | `/api/auth/login` | Devuelve JWT y rol |
| GET/POST/PUT/DELETE | `/api/salas` | CRUD de salas (ADMIN) |
| POST | `/api/reservas` | Nueva reserva |
| GET | `/api/reservas?fecha=YYYY-MM-DD` | Reservas por fecha |
| GET | `/api/reservas/historico` | Histórico completo (ADMIN) |
| GET | `/api/reservas/mis-reservas` | Historial del usuario |

### Estructura relevante

- `src/app/page.tsx`: landing y CTA hacia los flujos.
- `src/app/(login|register)/page.tsx`: formularios con manejo de errores.
- `src/app/dashboard/page.tsx`: tablero principal con gestión de salas y reservas.
- `src/context/auth-context.tsx`: contexto de sesión y helpers.
- `src/lib/api.ts`: cliente de la API REST.

### Próximos pasos sugeridos

- Conectar el backend real y validar los data contracts.
- Añadir control granular de estados de reserva (aprobada, rechazada, etc.).
- Incluir tests E2E o de componentes para los flujos críticos.
