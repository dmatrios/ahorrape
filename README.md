⭐ AhorraPE – Sistema de Gestión de Gastos Personales
<p align="center"> <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java&logoColor=white"/> <img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/> <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/> <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/> <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white"/> </p>

AhorraPE es una aplicación full-stack diseñada para ayudar a las personas a registrar, visualizar y analizar sus gastos diarios de manera sencilla y rápida.
El proyecto combina un backend sólido en Spring Boot 3 con un frontend moderno en React, siguiendo buenas prácticas reales del mundo laboral.

🧭 1. Arquitectura del Proyecto
ahorrape/
│── ahorrape-api/          # Backend – Java 21 + Spring Boot 3.x
│── ahorrape-frontend/     # Frontend – React + Axios
│── .gitignore
│── README.md


El repositorio aplica una arquitectura tipo monorepo simple, ideal para proyectos full-stack pequeños/medianos.

🛠️ 2. Backend – AhorraPE API
✔️ Tecnologías

Java 21

Spring Boot 3.x

Spring Web

Spring Data JPA

Lombok

MySQL

Maven

✔️ Arquitectura actual (por capas)
controller/
service/
service.impl/
repository/
domain/      # Entidades JPA
dto/         # request + response
exception/   # GlobalExceptionHandler
config/      # Preparado para seguridad

✔️ Funcionalidades (MVP)

Registro y consulta de usuarios

Registro y consulta de gastos

Base de datos MySQL lista (ahorrape_db)

🧱 Próximas fases del backend
Fase 0 — Ordenar y fortalecer la base

Refactor controllers → sólo llaman a services

Services → sólo devuelven DTOs (no entidades)

Validaciones (Bean Validation)

Soft delete con campo activo

Fase 1 — Seguridad: Spring Security + JWT

Login / Registro

Token JWT con expiración

Filtro de autenticación

Rutas públicas y privadas

Contexto del usuario autenticado

Fase 2 — Modelo avanzado

Categorías de gastos

Relaciones:

Usuario → Gastos (1:N)

Categoría → Gastos (1:N)

Optimizar consultas (JPQL)

Fase 3 — Dashboard

Totales mensuales

Totales por categoría

Mejor paginación y filtros

🎨 3. Frontend – AhorraPE Web
✔️ Tecnologías

React

React Router

Axios

Hooks personalizados

Context API (autenticación)

Tailwind (a futuro si se decide migrar)

✔️ Estructura actual
src/
  components/
  pages/
  services/        # Axios & API services
  hooks/
  context/

📌 Próximas funcionalidades

Integración con login JWT

Rutas privadas

Dashboard de gastos

Gráficos y totales

Mejor UI/UX

Manejo global del usuario con Context

🚀 4. Instalación y Ejecución
Backend
cd ahorrape-api
mvn spring-boot:run


El backend se ejecutará en:

http://localhost:8080

Frontend
cd ahorrape-frontend
npm install
npm run dev


El frontend estará disponible en:

http://localhost:3000

🌱 5. Roadmap General (lo que sigue)
🔹 1. Terminar Fase 0 del backend

Refactor + DTOs + validaciones + soft delete.

🔹 2. Implementar seguridad (Fase 1)

Login, JWT, roles básicos, rutas protegidas.

🔹 3. Integrar frontend con JWT

Context global, axios interceptors, rutas privadas.

🔹 4. Dashboard profesional

Gráficos de gastos, totales, filtros.

🔹 5. Preparar despliegue

Opciones:

Frontend: Vercel / Netlify

Backend: Render / Railway / AWS

BD: Railway o RDS (MySQL)

🧪 6. Calidad del Código (Buenas Prácticas)

Arquitectura por capas

DTOs para aislamiento del dominio

Manejo global de errores

Validaciones con Hibernate Validator

Servicios sin lógica de presentación

Controllers delgados

Estructura limpia y escalable

👨‍💻 7. Autor

Daniel Maturrano
Full-Stack Developer en formación
Stack: Java + Spring Boot + React + MySQL + Docker
Roadmap enfocado en backend profesional.

📎 8. Notas finales

Este repositorio representa un proyecto real en desarrollo continuo con enfoque laboral:
escribir código limpio, modular y preparado para escalar.
