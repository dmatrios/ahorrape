# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
     # Ahorrape — Frontend

    Documentación detallada (ES)

    Esta documentación explica la estructura del proyecto, cómo consumir las APIs desde el frontend, ejemplos prácticos con `axios`, flujos principales (login, dashboard, registro de transacciones), y notas de desarrollo pensadas para un desarrollador junior.

    ---

    **Índice**

    - Introducción rápida
    - Requisitos y setup
    - Scripts útiles
    - Estructura del proyecto
    - API client (autenticación y baseURL)
    - Endpoints (resumen por feature)
    - Ejemplos de consumo (axios + snippets desde componentes)
    - Flujo típico: login → dashboard → registrar transacción
    - UX / responsive (consideraciones implementadas)
    - Consejos de desarrollo y debugging
    - Mejoras sugeridas

    ---

    ## Introducción rápida

    Ahorrape es el frontend de una aplicación para gestionar ingresos y gastos personales. Está implementado con React + TypeScript y usa Vite como bundler. El frontend se comunica con un backend mediante una API REST expuesta en `http://localhost:8080/api` por defecto.

    El repositorio contiene features organizadas por dominio (auth, usuarios, categorias, transacciones, dashboard) y un cliente API central (`src/api/apiClient.ts`) que centraliza la configuración de `axios` y el envío del token.

    ## Requisitos y setup

    - Node.js (v16+ recomendado) y npm (o Yarn).

    Pasos básicos para arrancar en desarrollo:

    ```powershell
    npm install
    npm run dev
    ```

    Build para producción:

    ```powershell
    npm run build
    npm run preview
    ```

    ## Scripts útiles (en `package.json`)

    - `dev`: arranca Vite en modo desarrollo (`npm run dev`).
    - `build`: construye la app (`tsc -b && vite build`).
    - `preview`: sirve la build (`vite preview`).
    - `lint`: corre ESLint en el proyecto.

    ## Estructura del proyecto (resumen)

    - `src/`
      - `api/`
        - `apiClient.ts` — instancia de `axios` con `baseURL` y un interceptor para Authorization.
      - `features/`
        - `auth/` — login, auth API y páginas de autenticación.
        - `usuarios/` — registro y gestión de usuarios.
        - `categorias/` — CRUD de categorías.
        - `transacciones/` — listar/crear/editar/eliminar transacciones.
        - `dashboard/` — resumen mensual, componentes reutilizables.
      - `layout/` — `MainLayout`, `Navbar`, `Sidebar`.
      - `router/` — `AppRouter.tsx` con rutas principales.
      - `theme/` — provider de tema.
      - `assets/`, `components/`, etc.

    Cada feature suele contener una carpeta `api/` con funciones que encapsulan llamadas a endpoints.

    ## API client

    Archivo: `src/api/apiClient.ts`

    - `baseURL` está fijado a `http://localhost:8080/api`.
    - Hay un interceptor de request que añade la cabecera `Authorization: Bearer <token>` si existe `ahorrape-token` en `localStorage`.

    Ejemplo (resumen):

    ```ts
    import axios from 'axios';
    export const api = axios.create({ baseURL: 'http://localhost:8080/api' });
    // interceptor: añade Authorization con token desde localStorage
    ```

    Notas importantes para auth:
    - El login devuelve un token (JWT u otro) que el frontend guarda en `localStorage` bajo la clave `ahorrape-token`.
    - Además, el usuario autenticado se guarda en `localStorage` como `ahorrape-user` (usado para obtener `usuario.id`).

    ## Endpoints (resumen extraído del código)

    A continuación se listan los endpoints consumidos por el frontend, con su ruta, método, y shapes de request/response según tipos TS.

    ### Auth
    Archivo: `src/features/auth/api/authApi.ts`

    - POST `/auth/login`
      - Request: `{ email: string, password: string }`
      - Response: `{ token: string, usuario: { id:number, nombre:string, email:string } }`
      - Uso: `login({ email, password })` → guarda token y usuario en `localStorage`.

    ### Usuarios
    Archivo: `src/features/usuarios/api/usuariosApi.ts`

    - POST `/usuarios`
      - Request: `{ nombre:string, email:string, password:string }`
      - Response: `{ id:number, nombre:string, email:string }`
      - Uso: `registrarUsuario(data)`

    ### Categorías
    Archivo: `src/features/categorias/api/categoriasApi.ts`

    - GET `/categorias`
      - Response: `CategoriaResponse[]` donde `CategoriaResponse` tiene `id, nombre, descripcion, tipoCategoria, activa`.
      - Uso: `listarCategorias()`

    - POST `/categorias`
      - Request: `{ nombre, descripcion?, tipoCategoria }`
      - Response: `CategoriaResponse` (creada).
      - Uso: `crearCategoria(data)`

    - PUT `/categorias/{id}`
      - Request: `ActualizarCategoriaRequest` (puede incluir `activa` para activar/desactivar).
      - Response: `CategoriaResponse` (actualizada).
      - Uso: `actualizarCategoria(id, data)`

    > Nota: en la UI se implementó un toggle optimista para activar/desactivar categorías: la UI cambia inmediatamente y la petición `PUT` actualiza en segundo plano; si falla, se revierte.

    ### Transacciones
    Archivo: `src/features/transacciones/api/transaccionesApi.ts`

    - GET `/transacciones/usuario/{usuarioId}`
      - Response: `TransaccionResponse[]` con `id, usuarioId, usuarioNombre, categoriaId, categoriaNombre, tipo, monto, fecha, descripcion`.
      - Uso: `listarTransaccionesPorUsuario(usuarioId)`

    - POST `/transacciones`
      - Request: `CrearTransaccionRequest` (usuarioId, categoriaId, tipo ("INGRESO"|"GASTO"), monto, fecha (YYYY-MM-DD), descripcion)
      - Response: `TransaccionResponse` (nueva transacción)
      - Uso: `crearTransaccion(data)`

    - PUT `/transacciones/{id}`
      - Request: `ActualizarTransaccionRequest` (campos opcionales para actualizar)
      - Response: `TransaccionResponse` (actualizada)
      - Uso: `actualizarTransaccion(id, data)`

    - DELETE `/transacciones/{id}`
      - Response: 204/200 vacío
      - Uso: `eliminarTransaccion(id)`

    ### Dashboard / Resumen
    Archivo: `src/features/dashboard/api/resumenApi.ts`

    - GET `/resumen/usuario/{usuarioId}?mes={mes}&anio={anio}`
      - Response: `ResumenMensualResponse` con `totalIngresos, totalGastos, saldo, transaccionesDelMes[]`.
      - Uso: `obtenerResumenMensual(usuarioId, mes, anio)`

    ## Ejemplos de consumo desde el frontend

    A continuación hay ejemplos de cómo se consumen las APIs desde el código existente y cómo puedes hacerlo tú en nuevos componentes.

    1) Login (ejemplo en `LoginPage`):

    ```ts
    import { login } from '../features/auth/api/authApi';

    const handleLogin = async () => {
      const data = { email: 'user@example.com', password: 'pass' };
      const res = await login(data);
      // guardar token y usuario en localStorage
      localStorage.setItem('ahorrape-token', res.token);
      localStorage.setItem('ahorrape-user', JSON.stringify(res.usuario));
    };
    ```

    2) Consumir recursos autenticados:

    ```ts
    import { listarCategorias } from '../features/categorias/api/categoriasApi';

    const categorias = await listarCategorias();
    // apiClient ya añade header Authorization si hay token
    ```

    3) Crear una transacción (ejemplo desde `TransaccionesPage`):

    ```ts
    import { crearTransaccion } from '../features/transacciones/api/transaccionesApi';

    await crearTransaccion({
      usuarioId: usuario.id,
      categoriaId: 3,
      tipo: 'GASTO',
      monto: 25.5,
      fecha: '2025-11-21',
      descripcion: 'Cena'
    });
    ```

    4) Ejemplo `curl` (para probar APIs desde terminal):

    ```bash
    curl -X POST \
      http://localhost:8080/api/auth/login \
      -H 'Content-Type: application/json' \
      -d '{"email":"user@example.com","password":"pass"}'
    ```

    Luego usar `Authorization: Bearer <token>` en las siguientes peticiones.

    ## Flujo típico (para un dev junior)

    1. **Registro / Login**
      - El usuario se registra con `POST /usuarios` o inicia sesión con `POST /auth/login`.
      - Tras login guardamos `ahorrape-token` y `ahorrape-user` en `localStorage`.

    2. **Ir al Dashboard**
      - `DashboardPage` lee `ahorrape-user` y llama `obtenerResumenMensual(usuario.id, mes, anio)` para cargar datos.

    3. **Registrar movimiento**
      - En `TransaccionesPage` el formulario crea transacciones con `POST /transacciones` y luego refresca la lista con `listarTransaccionesPorUsuario(usuario.id)`.

    4. **Categorías**
      - `CategoriasPage` lista categorías (`GET /categorias`) y permite crear/editar/activar-desactivar (PUT `/categorias/{id}`).
      - Activar/desactivar se implementó con actualización optimista en la UI.

    ## UX / Responsive (qué se implementó ya)

    - Las tablas grandes se ocultan en pantallas pequeñas (`md` breakpoint) y se muestran tarjetas compactas para móvil.
    - Headers y botones apilan en vertical en pantallas pequeñas para mejorar accesibilidad táctil.
    - Los previews en `Dashboard` se muestran como menús absolutos en escritorio, y como cajas full-width en móvil para evitar overflow.

    ## Consejos para debug y desarrollo

    - Si ves errores 200 pero la UI no cambia, revisa Network → respuesta del `PUT` y luego el `GET` (¿el backend realmente guardó?).
    - Para problemas de CORS o conexión verifica que el backend esté en `http://localhost:8080` o cambia `baseURL` en `src/api/apiClient.ts`.
    - Si ves problemas con imports tipo `does not provide an export named 'api'`, asegúrate de que `apiClient.ts` exporte el `api` (en este repo, hay `export const api = ...` y `export default api`).

    ## Buenas prácticas y sugerencias

    - Centralizar llamadas a la API (ya está hecho en `features/*/api`). Mantén allí la definición de tipos y shapes.
    - Manejo de errores: capturar `err.response?.data` para mostrar mensajes amigables en UI.
    - Evitar lógica de autenticación en muchos componentes: usar un Auth context o hooks para exponer `usuario` y `logout`.
    - Considerar mover `localStorage` logic a util o hook (`useAuth`) para centralizar.

    ## Posibles mejoras futuras

    - Testear las APIs con mocks (MSW) para tests unitarios.
    - Añadir un `useAuth` hook para centralizar login/logout, refresh token y permisos.
    - Mejorar accesibilidad y roles (aria-labels, focus traps en modales).
    - Documentación automática de endpoints si se añade OpenAPI en el backend.

    ---

    Si quieres, puedo:
    - Incluir ejemplos `curl`/Postman más completos por endpoint.
    - Generar un `CONTRIBUTING.md` y un `DEVELOPER.md` con pasos más formales para nuevos devs.
    - Convertir los ejemplos en snippets copyable para VSCode (code snippets JSON).

    Dime si quieres que haga alguna ampliación específica o que genere un `CONTRIBUTING.md` también.
