[![Read in English](https://img.shields.io/badge/Read%20in-English-2563eb?style=for-the-badge)](README.en.md)

# Sports Field Reservation Frontend

Frontend web para el sistema de reserva de campos deportivos, construido con Angular 22 y conectado al backend Laravel del proyecto.

Este repositorio contiene solo el frontend.

## Resumen

La aplicación permite:

- autenticación de usuarios
- navegación pública por sedes y campos deportivos
- consulta de disponibilidad por campo
- creación, confirmación y cancelación de reservas
- gestión de mantenimiento
- administración de sedes, campos, usuarios y asignaciones de staff

## Stack técnico

- Angular 22
- TypeScript estricto
- RxJS
- Tailwind CSS 4
- Spartan NG
- ESLint
- Prettier

## Arquitectura

El frontend está organizado por features.

Estructura principal:

- `src/app/core`
  - autenticación
  - guards
  - interceptor HTTP
  - layout principal
  - notificaciones
  - configuración global

- `src/app/features`
  - `auth`
  - `home`
  - `venues`
  - `sports-fields`
  - `reservations`
  - `maintenance`
  - `admin`

- `src/app/shared`
  - componentes reutilizables
  - tipos
  - constantes
  - utilidades
  - wrappers de Spartan NG

Cada feature sigue una organización parecida a:

- `application`
  - facades y coordinación de estado
- `data-access`
  - servicios HTTP y acceso a API
- `pages`
  - páginas y composición visual

## Enfoque técnico

- componentes standalone
- estado local con signals
- formularios reactivos
- consumo de API con RxJS
- rutas lazy loaded por feature
- guards para autenticación y roles

## Roles y navegación

La interfaz adapta el menú y las pantallas según el rol:

- invitado
  - home
  - login
  - register
  - detalle de sede
  - detalle de campo

- customer
  - reservas
  - creación de reserva
  - detalle de reserva

- staff
  - todo lo del customer
  - mantenimiento

- admin
  - todo lo anterior
  - administración de sedes
  - administración de campos
  - administración de usuarios
  - asignaciones de staff

## Rutas principales

- `/`
- `/login`
- `/register`
- `/venues/:venueId`
- `/sports-fields/:sportsFieldId`
- `/reservations`
- `/reservations/new`
- `/reservations/:reservationId`
- `/maintenance`
- `/admin/venues`
- `/admin/sports-fields`
- `/admin/users`
- `/admin/staff-assignments`

## Integración con el backend

Este frontend consume la API REST del backend en:

```text
http://127.0.0.1:8000/api/v1
```

La URL base está definida en:

```text
src/app/core/config/api-base-url.token.ts
```

Si el backend corre en otro host o puerto, debes actualizar esa configuración.

## Requisitos previos

- Node.js
- npm
- backend Laravel del proyecto levantado y accesible

## Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Verificar que el backend esté corriendo

3. Levantar el entorno local:

```bash
npm start
```

4. Abrir en el navegador:

```text
http://localhost:4200
```

## Scripts disponibles

Servidor de desarrollo:

```bash
npm start
```

Build de producción:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Autocorrección de lint:

```bash
npm run lint:fix
```

Formateo:

```bash
npm run format
```

Verificación de formato:

```bash
npm run format:check
```

Chequeo de tipos:

```bash
npm run typecheck
```

Tests:

```bash
npm test
```

## Calidad de código

El proyecto ya está preparado para trabajar con:

- ESLint
- Prettier
- TypeScript strict

Flujo recomendado antes de subir cambios:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

## Funcionalidades destacadas

### Catálogo público

- listado visual de sedes
- detalle de sede
- detalle de campo deportivo
- búsqueda de disponibilidad

### Reservas

- listado de reservas
- detalle de reserva
- confirmación de reserva
- cancelación de reserva
- creación de reserva con flujo dependiente:
  - sede
  - campo deportivo

### Mantenimiento

- creación de bloques de mantenimiento
- listado paginado
- eliminación de bloques

### Administración

- gestión de usuarios
- asignación de staff a sedes
- gestión de sedes
- gestión de campos deportivos

## Notas

- El frontend asume que el backend ya tiene datos sembrados para probar los flujos.
- El layout principal usa navegación adaptada por autenticación y rol.
- La UI usa Tailwind para maquetación y Spartan NG para componentes base.
- El proyecto está pensado para trabajar junto al backend `sports-field-reservation-backend`.

