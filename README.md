# Student Management System FE

Next.js frontend for the Student Management System.

## Run locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Backend URL

Copy `.env.example` to `.env.local` and update the URL if the backend uses a different HTTPS port.

```bash
NEXT_PUBLIC_API_URL=https://localhost:7040
```

## Current setup

- Next.js App Router with Tailwind CSS.
- React Query provider in `app/providers.tsx`.
- Shared API helper in `lib/api.ts`.
- Domain types in `lib/types.ts`.
- Small Zustand UI store in `store/use-ui-store.ts`.
