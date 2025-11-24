# Ahorrape API

Documentación completa del proyecto backend `ahorrape-api`.

**Resumen:** API REST para gestión de usuarios, categorías y transacciones personales. Autenticación vía JWT y diseño pensado para consumirse desde un frontend (ej. Vite/React) corriendo en `http://localhost:5173`.

**Tech stack:**
- **Lenguaje:** Java
- **Framework:** Spring Boot (Spring Web, Spring Security, Spring Data JPA)
- **BD:** JPA (configuración en `application.properties`)
- **Autenticación:** JWT (implementado en `pe.ahorrape.util.JwtUtil`)

**Estructura del proyecto (resumen):**
- `pe.ahorrape` : punto de entrada `AhorrapeApiApplication.java`
- `config` : `SecurityConfig.java`, `WebConfig.java` (CORS + seguridad)
- `controller` : controladores REST (Auth, Usuario, Categoria, Transaccion, Resumen)
- `dto` : objetos de transferencia `request` y `response`
- `model` : entidades JPA (`Usuario`, `Categoria`, `Transaccion`, enums `TipoCategoria`, `TipoTransaccion`)
- `repository` : interfaces `JpaRepository`
- `service` : interfaces de servicios (lógica de negocio) y `impl` para las implementaciones
- `security` : filtro `JwtAuthenticationFilter`
- `util` : utilidades, p.ej. `JwtUtil`

**Entidades principales (Resumen de campos):**
- `Usuario` (`pe.ahorrape.model.Usuario`):
  - **id**: `Long` (PK)
  - **nombre**: `String`
  - **email**: `String` (único)
  - **password**: `String` (campo donde se guarda la contraseña — revisar si se persiste en texto plano; hay un `PasswordEncoder` configurado en `SecurityConfig`)
  - **activo**: `Boolean`
  - **creadoEn**, **actualizadoEn**: `LocalDateTime`

- `Categoria` (`pe.ahorrape.model.Categoria`):
  - **id**, **nombre**, **descripcion**, **activa** (boolean), **tipoCategoria** (`TipoCategoria` → `INGRESO|GASTO|AMBOS`), timestamps

- `Transaccion` (`pe.ahorrape.model.Transaccion`):
  - **id**, **usuario** (ManyToOne `Usuario`), **categoria** (ManyToOne `Categoria`)
  - **tipo**: `TipoTransaccion` (`INGRESO` o `GASTO`)
  - **monto**: `BigDecimal`, **fecha**: `LocalDate`, **descripcion**, **activa**, timestamps

**Enums:**
- `TipoCategoria`: `INGRESO`, `GASTO`, `AMBOS`
- `TipoTransaccion`: `INGRESO`, `GASTO`

**DTOs (requests / responses) — uso y campos clave:**
- Registro usuario: `RegistrarUsuarioRequest` → `{ nombre, email, password }` (validaciones con `@NotBlank`, `@Email`, `@Size`)
- Login: `LoginRequest` → `{ email, password }` → respuesta `LoginResponse` `{ token, usuario }` donde `usuario` es `UsuarioResponse` `{ id, nombre, email }`.
- Crear categoría: `CrearCategoriaRequest` → `{ nombre, descripcion, tipoCategoria }` → respuesta `CategoriaResponse` `{ id, nombre, descripcion, activa, tipoCategoria }`.
- Crear transacción: `CrearTransaccionRequest` → `{ usuarioId, categoriaId, tipo, monto, fecha, descripcion }` → respuesta `TransaccionResponse` (incluye ids y nombres para usuario/categoría).
- Actualizaciones: `ActualizarUsuarioRequest`, `ActualizarCategoriaRequest`, `ActualizarTransaccionRequest` (campos opcionales según cada caso).

**Repositorios:**
- `UsuarioRepository` : `findByEmail(String email)`
- `CategoriaRepository` : `findByNombreIgnoreCase(String nombre)`
- `TransaccionRepository` : consultas por usuario y rango de fechas (`findByUsuarioIdAndActivaTrue`, `findByUsuarioIdAndFechaBetweenAndActivaTrue`)

**Servicios (interfaces):**
- `AuthService`:
  - `LoginResponse login(LoginRequest request)`
- `UsuarioService`:
  - `registrarUsuario(RegistrarUsuarioRequest)`, `obtenerPorId(Long)`, `listarUsuarios()`, `actualizarUsuario(Long, ActualizarUsuarioRequest)`, `desactivarUsuario(Long)`
- `CategoriaService`:
  - `crearCategoria`, `listarCategorias`, `obtenerPorId`, `actualizarCategoria`, `desactivarCategoria`
- `TransaccionService`:
  - `crearTransaccion`, `obtenerPorId`, `listarPorUsuario`, `listarPorUsuarioYRangoFechas`, `actualizarTransaccion`, `desactivarTransaccion`
- `ResumenService`:
  - `obtenerResumenMensual(usuarioId, mes, anio)` → `ResumenMensualResponse` `{ totalIngresos, totalGastos, saldo, transaccionesDelMes }`.

Implementaciones (`service.impl`) — convención y responsabilidades:
- Cada implementación debe:
  - Validar existencia de entidades referenciadas (p.ej. usuario y categoría al crear una transacción).
  - Aplicar reglas de negocio (p.ej. solo transacciones activas, desactivación lógica con `activa=false`).
  - Mapear entre `model` y `dto` (construir `TransaccionResponse`, `CategoriaResponse`, etc.).
  - Manejar excepciones específicas (usar `RecursoNoEncontradoException` cuando una entidad no existe) para que el `GlobalExceptionHandler` regrese un `ErrorResponse` consistente.

**Controllers y Endpoints (mapa completo):**
- `AuthController` — `@RequestMapping("/api/auth")`
  - `POST /api/auth/login` → cuerpo `LoginRequest` → respuesta `LoginResponse`

- `UsuarioController` — `@RequestMapping("/api/usuarios")`
  - `POST /api/usuarios` → registrar (`RegistrarUsuarioRequest`)  // pública
  - `GET /api/usuarios` → listar todos (requiere JWT)
  - `GET /api/usuarios/{id}` → obtener por id
  - `PUT /api/usuarios/{id}` → actualizar (`ActualizarUsuarioRequest`)
  - `DELETE /api/usuarios/{id}` → desactivar usuario

- `CategoriaController` — `@RequestMapping("/api/categorias")`
  - `POST /api/categorias` → crear categoría (`CrearCategoriaRequest`)
  - `GET /api/categorias` → listar
  - `GET /api/categorias/{id}` → obtener por id
  - `PUT /api/categorias/{id}` → actualizar (`ActualizarCategoriaRequest`)
  - `DELETE /api/categorias/{id}` → desactivar

- `TransaccionController` — `@RequestMapping("/api/transacciones")`
  - `POST /api/transacciones` → crear (`CrearTransaccionRequest`)
  - `GET /api/transacciones/{id}` → obtener por id
  - `GET /api/transacciones/usuario/{usuarioId}` → listar por usuario
  - `GET /api/transacciones/usuario/{usuarioId}/rango?inicio=YYYY-MM-DD&fin=YYYY-MM-DD` → listar por rango
  - `PUT /api/transacciones/{id}` → actualizar (`ActualizarTransaccionRequest`)
  - `DELETE /api/transacciones/{id}` → desactivar

- `ResumenController` — `@RequestMapping("/api/resumen")`
  - `GET /api/resumen/usuario/{usuarioId}?mes=<m>&anio=<a>` → `ResumenMensualResponse`

Ejemplo de request/response (login):
Request:
```json
POST /api/auth/login
{
  "email": "juan@example.com",
  "password": "secreto"
}
```
Response (200):
```json
{
  "token": "eyJhbGciOiJI...",
  "usuario": { "id": 1, "nombre": "Juan", "email": "juan@example.com" }
}
```

**Seguridad y JWT (cómo funciona en el proyecto):**
- `JwtUtil` (`pe.ahorrape.util.JwtUtil`):
  - Genera token con `subject=email`, agrega claim `usuarioId` y firma con HS256 y un `secret` embebido en la clase.
  - Tiempo de expiración: 4 horas.
  - Métodos útiles: `generarToken(Usuario)`, `obtenerEmailDelToken(token)`, `esTokenValido(token, usuario)`.
- `JwtAuthenticationFilter`:
  - Se registra antes del filtro `UsernamePasswordAuthenticationFilter` en `SecurityConfig`.
  - Lee header `Authorization: Bearer <token>`, extrae email desde el token y carga el `Usuario` desde la BD con `UsuarioRepository#findByEmail`.
  - Si el token es válido, construye un `UsernamePasswordAuthenticationToken` con el objeto `Usuario` como principal y sin roles (lista vacía) y lo coloca en el `SecurityContext`.
- `SecurityConfig`:
  - Desactiva CSRF y configura `SessionCreationPolicy.STATELESS`.
  - Define rutas públicas: `POST /api/usuarios` (registro) y `POST /api/auth/login` (login). Todo lo demás requiere autenticación JWT.
  - Define bean `PasswordEncoder` con `BCryptPasswordEncoder` (usar al persistir contraseñas).
  - CORS: origen `http://localhost:5173` (configurado en `corsConfigurationSource` y `WebConfig`), métodos `GET,POST,PUT,DELETE,OPTIONS` y header `Authorization` permitido.

Cómo debe consumir el frontend:
- Al iniciar sesión, el frontend hace `POST /api/auth/login` y obtiene `{ token, usuario }`.
- Guardar `token` en memoria (o `localStorage` si se considera adecuado) y añadir header en cada request protegido:
  - `Authorization: Bearer <token>`
- Ejemplo con fetch:
```js
fetch('/api/transacciones', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(payload)
})
```

**Cómo correr localmente**
- Requisitos: Java 17+ (según `pom.xml`), Maven.
- Comandos:
```powershell
mvnw.cmd spring-boot:run
```
ó
```powershell
mvn spring-boot:run
```
- Variables a revisar en `src/main/resources/application.properties` (configuración de BD, puerto, JPA).

**Recomendaciones y notas importantes**
- Revisar cómo se persiste la `password`: aunque existe un `PasswordEncoder` en `SecurityConfig`, el modelo contiene la nota `//Por ahora texto plano`; asegurar que la implementación de `UsuarioService` utilice `passwordEncoder.encode(password)` antes de guardar.
- El `secret` para JWT está embebido en `JwtUtil` — para producción moverlo a `application.properties` o al gestor de secretos y no versionarlo.
- Añadir roles/authorities si se necesita control de acceso por roles (ahora el `Authentication` se crea con lista vacía).
- Manejar renovación de token / refresh token si es necesario para UX.

**Siguientes pasos sugeridos**
- Añadir ejemplos Postman / colección con todos los endpoints CRUD.
- Añadir tests de integración para endpoints protegidos por JWT.
- Revisión de seguridad: no exponer `secret` en el código fuente.

Si quieres, puedo:
- Generar una colección Postman o ejemplos cURL para todos los endpoints.
- Crear un archivo `docs/ENDPOINTS.md` con ejemplos detallados por endpoint.
- Buscar en el código las implementaciones `service.impl` y documentar comportamientos específicos por método.

---
Documentación generada automáticamente basada en el código fuente actual. Si quieres que incluya ejemplos concretos de request/response para cada endpoint (payloads reales extraídos del código) o que inspeccione las implementaciones dentro de `service.impl`, dime y lo hago.
