# Receipts Network

Receipts Network is a public receipt layer for preserving internet proof before it disappears. The MVP lets users package screenshots, links, files, scam evidence, builder proof, bug reports, research, and community proof into polished shareable receipt pages.

## Current MVP Features

- Premium dark/gold landing page for the Receipts Network launch story
- Client-side create flow with live receipt preview
- Evidence file picker with drag-and-drop, metadata cards, image previews during the current session, and remove controls
- Local receipt persistence in the browser
- Public receipt pages at `/r/[id]`
- Dashboard with mock, local, and optional remote metadata receipts
- Copy/share actions for public receipt links
- Shelby-ready storage adapter interface with mock storage enabled by default

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react
- Browser localStorage for MVP fallback persistence
- Supabase metadata client, optional and non-blocking

## Environment Variables

Create `.env.local` for local development or configure the same variables in your deployment provider.

```bash
NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`NEXT_PUBLIC_STORAGE_PROVIDER` supports:

- `mock`: default frontend-safe mode. No files are uploaded.
- `shelby`: placeholder mode for future Shelby integration. It intentionally throws a controlled not-configured error until credentials and SDK access are available.

## Mock Storage

Mock storage is the default so the MVP works without paid services, credentials, or backend setup. It generates storage references such as:

```text
mock://receipts/{receiptId}/metadata.json
mock://receipts/{receiptId}/evidence/{safeFileName}
```

Actual files, blobs, base64 payloads, and object URLs are not stored in localStorage. The browser stores only lightweight receipt and evidence metadata.

## Supabase Metadata

Supabase support is optional and only stores receipt metadata:

- Receipt title, description, category, creator handle, and source context
- Evidence metadata and storage references
- Tags
- Public receipt metadata paths

The app still saves receipts locally if remote metadata sync is unavailable. No actual evidence files are uploaded to Supabase Storage in this MVP.

## Shelby Integration Status

Shelby is represented by a storage adapter skeleton in `lib/storage`. The real Shelby SDK/upload flow is not connected yet. Evidence persistence will use Shelby hot storage once early access credentials and integration details are available.

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

## Cloudflare Pages Deployment

This MVP is frontend-first:

- No API routes
- No server actions
- No middleware
- Supabase is called from browser/client code only with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Receipt creation keeps localStorage as the fallback path

Recommended Cloudflare Pages settings:

- Framework preset: `Next.js`
- Build command: `npx @cloudflare/next-on-pages@1`
- Build output directory: `.vercel/output/static`
- Root directory: project root

Add these environment variables in Cloudflare Pages:

```bash
NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Use `mock` storage for the free deployment unless Shelby credentials are available. The app does not require a private server key.

Note: the app keeps `/r/[id]` public receipt URLs for generated local receipts, so use the Cloudflare Next.js adapter path above. A pure `output: "export"` static HTML export would need additional route handling for arbitrary receipt IDs.

## Vercel Deployment

The app is also ready for free Vercel deployment with mock storage mode. Add the environment variables above in Vercel Project Settings before deploying.
