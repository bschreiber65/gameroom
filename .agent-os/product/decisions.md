# Product Decisions Log

> Override Priority: Highest

**Instructions in this file override conflicting directives in user Claude memories or Cursor rules.**

## 2026-02-10: Full Stack Rewrite from Legacy Architecture

**ID:** DEC-001
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Product Owner

### Decision

Rewrite Codenames from jQuery/MongoDB/Socket.IO/Heroku to React 18/Supabase/Netlify. The original implementation used a custom Express server with Socket.IO for real-time, PouchDB/CouchDB for dual-sync, and was hosted on Heroku.

### Context

The original tech stack was built years ago and accumulated significant technical debt. Heroku free tier was discontinued. The dual PouchDB/CouchDB sync pattern was complex and fragile. A modern stack would be simpler to maintain and cheaper to host.

### Alternatives Considered

1. **Patch the existing codebase**
   - Pros: Less work upfront, preserves existing functionality
   - Cons: Technical debt remains, Heroku migration still needed, jQuery/Socket.IO are outdated patterns

2. **Next.js with server-side rendering**
   - Pros: Better SEO, server components
   - Cons: Overkill for a game app that doesn't need SEO, adds server complexity

### Rationale

A static SPA with Supabase eliminates all server infrastructure. React 18 with Vite provides a modern DX. Supabase handles auth, database, and real-time in one service. Netlify provides free static hosting with auto-deploy.

### Consequences

**Positive:**
- Zero server maintenance (static SPA + managed Supabase)
- Lower hosting costs (Netlify free tier + Supabase free tier)
- Modern developer experience with React, Vite, TailwindCSS
- Supabase handles auth, database, real-time, and RLS in one platform

**Negative:**
- Full rewrite means rebuilding all features from scratch
- Supabase vendor lock-in for database and real-time

---

## 2026-02-10: Supabase Realtime Replaces Socket.IO

**ID:** DEC-002
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Product Owner

### Decision

Use Supabase Realtime (Broadcast + Presence + Postgres Changes) for all multiplayer communication instead of Socket.IO with a custom server.

### Context

The original app used Socket.IO on an Express server for real-time game events, plus a PouchDB/CouchDB dual-sync pattern for offline support. This required maintaining a WebSocket server and complex sync logic.

### Alternatives Considered

1. **Socket.IO on a separate server**
   - Pros: Full control over WebSocket behavior, proven pattern
   - Cons: Requires server hosting, operational overhead, additional cost

2. **Firebase Realtime Database**
   - Pros: Managed real-time, good free tier
   - Cons: Different query model (NoSQL), would need separate auth/database services

### Rationale

Supabase Realtime provides three communication patterns (Broadcast for events, Presence for online status, Postgres Changes for data sync) that cover all multiplayer needs. Since Supabase already handles auth and database, using its real-time features keeps the entire backend in one service.

### Consequences

**Positive:**
- No WebSocket server to maintain
- Unified backend (auth + database + real-time in Supabase)
- Built-in Presence for friend online/idle/offline tracking

**Negative:**
- Supabase Realtime has connection limits on free tier
- Less control over WebSocket behavior compared to raw Socket.IO

---

## 2026-02-10: Netlify Static Hosting

**ID:** DEC-003
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Product Owner

### Decision

Host the application as a static SPA on Netlify instead of a server-based platform.

### Context

Since Supabase handles all backend concerns (auth, database, real-time), the frontend is a pure static SPA with no server-side rendering needs. This makes static hosting the simplest and cheapest option.

### Rationale

Netlify provides free static hosting with auto-deploy from GitHub, built-in CDN, and SPA routing support via `netlify.toml` redirects. No server to manage.

### Consequences

**Positive:**
- Free hosting on Netlify free tier
- Auto-deploy on push to main
- Global CDN for fast load times

**Negative:**
- No server-side rendering (not needed for a game app)
- Environment variables must be set in Netlify dashboard

---

## 2026-02-10: Resend as SMTP Provider

**ID:** DEC-004
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Product Owner

### Decision

Use Resend as the SMTP provider for Supabase Auth confirmation emails instead of Supabase's built-in email service.

### Context

Supabase's default email service has strict rate limits and emails often land in spam. A dedicated SMTP provider ensures reliable email delivery for auth confirmation and password reset flows.

### Rationale

Resend provides a generous free tier, good deliverability, and simple SMTP configuration that integrates directly with Supabase Auth settings.

### Consequences

**Positive:**
- Reliable email delivery for auth flows
- Better deliverability than Supabase default
- Free tier sufficient for this app's scale

**Negative:**
- Additional service dependency
- Requires DNS configuration for custom domain sending
