[![Leer en Español](https://img.shields.io/badge/Leer%20en-Espa%C3%B1ol-2563eb?style=for-the-badge)](README.md)

# Sports Field Reservation Frontend

Web frontend for the sports field reservation system, built with Angular 22 and connected to the Laravel backend of this project.

This repository contains the frontend only.

## Overview

The application supports:

- user authentication
- public browsing of venues and sports fields
- field availability checks
- reservation creation, confirmation, and cancellation
- maintenance management
- administration of venues, sports fields, users, and staff assignments

## Tech stack

- Angular 22
- Strict TypeScript
- RxJS
- Tailwind CSS 4
- Spartan NG
- ESLint
- Prettier

## Architecture

The frontend is organized by features.

Main structure:

- `src/app/core`
  - authentication
  - guards
  - HTTP interceptor
  - main layout
  - notifications
  - global configuration

- `src/app/features`
  - `auth`
  - `home`
  - `venues`
  - `sports-fields`
  - `reservations`
  - `maintenance`
  - `admin`

- `src/app/shared`
  - reusable components
  - types
  - constants
  - utilities
  - Spartan NG wrappers

Each feature follows a structure similar to:

- `application`
  - facades and state coordination
- `data-access`
  - HTTP services and API access
- `pages`
  - pages and visual composition

## Technical approach

- standalone components
- local state with signals
- reactive forms
- API consumption with RxJS
- lazy-loaded feature routes
- authentication and role guards

## Roles and navigation

The interface adapts navigation and pages according to the user role:

- guest
  - home
  - login
  - register
  - venue detail
  - sports field detail

- customer
  - reservations
  - reservation creation
  - reservation detail

- staff
  - everything from customer
  - maintenance

- admin
  - everything above
  - venue administration
  - sports field administration
  - user administration
  - staff assignment management

## Main routes

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

## Backend integration

This frontend consumes the backend REST API at:

```text
http://127.0.0.1:8000/api/v1
```

The base URL is defined in:

```text
src/app/core/config/api-base-url.token.ts
```

If the backend runs on a different host or port, update that configuration.

## Prerequisites

- Node.js
- npm
- the Laravel backend running and reachable

## Installation

1. Install dependencies:

```bash
npm install
```

2. Make sure the backend is running

3. Start the local development server:

```bash
npm start
```

4. Open in the browser:

```text
http://localhost:4200
```

## Available scripts

Development server:

```bash
npm start
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Auto-fix lint issues:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

Type check:

```bash
npm run typecheck
```

Tests:

```bash
npm test
```

## Code quality

The project is already set up to work with:

- ESLint
- Prettier
- strict TypeScript

Recommended validation flow before pushing changes:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

## Highlighted features

### Public catalog

- visual venue listing
- venue detail
- sports field detail
- availability search

### Reservations

- reservation list
- reservation detail
- reservation confirmation
- reservation cancellation
- reservation creation with dependent flow:
  - venue
  - sports field

### Maintenance

- maintenance block creation
- paginated listing
- block deletion

### Administration

- user management
- staff-to-venue assignment
- venue management
- sports field management

## Notes

- The frontend assumes the backend already contains seeded data for testing the flows.
- The main layout uses authentication-aware and role-aware navigation.
- The UI uses Tailwind for layout and Spartan NG for base components.
- The project is intended to work together with the `sports-field-reservation-backend` repository.

