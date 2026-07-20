# An Nhiên Kids FE

Next.js frontend for class registration, parent lookup, and internal management.

## Run locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Routes

- `/guest`: màn phụ huynh để xem lớp, đăng ký lớp cho con, và tra cứu thông tin của con.
- `/admin`: internal management dashboard.
- `/`: redirects to `/guest`.

## Backend URL

Copy `.env.example` to `.env.local` and update the URL if the backend uses a different port.

```bash
NEXT_PUBLIC_API_URL=http://localhost:5242
```

The backend launch profiles also expose HTTPS at `https://localhost:7228`. For local browser development, HTTP is usually smoother unless the HTTPS development certificate is trusted.

## Current setup

- Next.js App Router with Tailwind CSS.
- React Query provider in `app/providers.tsx`.
- Shared API helper in `shared/services/api.ts`.
- Feature-based UI, data, services, and types under `features/*`.
- Small Zustand UI store in `features/navigation/store/use-ui-store.ts`.
