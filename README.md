# Receipts Network

Public proof pages for preserving links, files and context.

Live: https://receipts-network.pages.dev  
Repo: https://github.com/vaibhav0xq/receipts-network

## Overview

Receipts Network helps users package fragile internet proof into clean public receipt pages.

It is built for scam reports, builder proof, bug reports, research sources, grant evidence and community context that can get deleted, edited or buried.

## Preview

### Homepage

![Receipts Network homepage](./public/assert/homepage.png)

### Create receipt flow

![Create receipt page](./public/assert/create%20receipt.png)

### Receipt command center

![Receipt command center](./public/assert/receipt%20center.png)

## What it does

Receipts Network lets users create a public receipt page with:

- Receipt title
- Category
- Creator handle
- Source URL or context
- Description
- Tags
- Evidence file metadata
- Public receipt link
- Dashboard listing
- Storage references

## Why this exists

In Web3 and online communities, proof is fragile.

A scam message can be deleted.  
A project claim can be edited.  
A bug report can get buried.  
A builder update can disappear in a chat thread.  
Grant or application proof can be scattered across multiple places.

Receipts Network gives users a simple way to package that context into one shareable receipt page.

## Example use cases

- Scam or fake support account evidence
- Builder progress proof
- Bug report proof
- Community or moderation proof
- Research source receipts
- Grant or application evidence
- Creator proof
- Public project update receipts

## Current features

- Landing page
- Create receipt form
- Live receipt preview
- Evidence file selection
- Evidence metadata handling
- File detach and remove support
- Public receipt pages
- Dashboard
- Copy and share receipt links
- Remote metadata sync
- Local browser fallback
- User-facing error handling
- Storage adapter structure
- Cloudflare Pages deployment

## Data and storage

The current version stores receipt metadata remotely and keeps a local browser fallback for reliability.

Evidence files are represented as metadata in this release. The storage layer is designed so a permanent evidence provider can be connected later.

Current storage mode: `NEXT_PUBLIC_STORAGE_PROVIDER=mock`  
Future storage mode: `NEXT_PUBLIC_STORAGE_PROVIDER=shelby`

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Remote metadata storage
- Cloudflare Pages
- Storage adapter structure

## Local development

Install dependencies:

`npm install`

Run the development server:

`npm run dev`

Open:

`http://localhost:3000`

Run lint:

`npm run lint`

Build production version:

`npm run build`

## Main routes

- `/` - Landing page
- `/create` - Create a receipt
- `/dashboard` - Receipt command center
- `/r/[id]` - Public receipt page

## Environment variables

Create a `.env.local` file for local development.

Required values:

- `NEXT_PUBLIC_STORAGE_PROVIDER`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

An `.env.example` file is included for reference.

Do not commit `.env.local` or private keys.

## Deployment

The project is deployed on Cloudflare Pages.

Recommended build settings:

- Framework preset: Next.js
- Build command: `npx @cloudflare/next-on-pages@1`
- Build output directory: `.vercel/output/static`
- Root directory: `/`
- Node version: 20
- Compatibility flag: `nodejs_compat`

## Current status

Working now:

- Public receipt creation
- Shareable receipt pages
- Dashboard
- Remote metadata sync
- Local fallback
- Mock storage mode

Planned:

- Permanent evidence file storage
- Authentication or wallet ownership
- Receipt editing
- Stronger moderation controls
- Production storage integration

## Project direction

The goal is to make Receipts Network a useful public proof layer for Web3 users, builders, moderators, researchers, creators, grant applicants and communities.

Receipts are meant to be opened, shared, reviewed and checked repeatedly. Fast retrieval and reliable storage matter for proof pages that may be used in scam reports, grant reviews, community disputes and builder applications.

## License

No license has been added yet.
