# Wedding Invitation (Nuxt)

This is a Nuxt-based wedding invitation site with RSVP and optional photo uploads. It supports two operation modes: Google Form (quick) or Supabase (centralized with admin view).

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## Deployment (Netlify)

Already configured via `netlify.toml`.

- Build command: `npm run build`
- Publish directory: `.output/public`
- Functions directory: auto (SSR via `/.netlify/functions-internal`)

### Environment variables
Choose one of the modes:

- Google Form mode
  - `RSVP_MODE=google`
  - `GOOGLE_FORM_EMBED_URL=<Google Form embed URL>`

- Supabase mode (recommended for centralized management)
  - `RSVP_MODE=supabase`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE` (server only; recommended)
  - `ADMIN_TOKEN=<any secret>` to access `/admin`
  - Optional SendGrid email: `SENDGRID_API_KEY`, `SENDGRID_FROM`, `SENDGRID_TO`, `SENDGRID_REPLY_TO`

### Supabase setup
- Create a public bucket `guest-photos` (Storage)
- Create the table using `scripts/supabase.sql`
- If you keep RLS enabled (default), setting `SUPABASE_SERVICE_ROLE` lets the server bypass policies safely.

### Admin
- Visit `/admin` and enter `ADMIN_TOKEN` to list RSVPs and export CSV.
