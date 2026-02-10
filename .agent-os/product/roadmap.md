# Product Roadmap

## Phase 0: Already Completed

The following features have been implemented across Phases 1-7 of the original build plan:

- [x] Project setup (React 18, Vite, TailwindCSS 4, Supabase client) `XS`
- [x] Supabase schema (profiles, friendships, games, messages, invitations tables with RLS) `S`
- [x] Auth system (email/password sign-in, registration, Supabase Auth with Resend SMTP) `M`
- [x] Game engine (pure functions: word generation, card generation, identifier assignment, validation, outcome computation) `M`
- [x] Game reducer (React reducer for all game state transitions) `M`
- [x] Board UI (5x5 card grid, asymmetric identifier display, clue panel, event log) `L`
- [x] Real-time multiplayer (Supabase Realtime broadcast for card clicks, clues, turn swaps; presence for player online status) `L`
- [x] Friend system (add friends, online/idle/offline presence via lobby channel) `M`
- [x] Game invitations (invite friends from lobby, accept/decline notifications) `M`
- [x] Chat system (global sidebar chat, per-game chat via Postgres Changes on messages table) `M`
- [x] Sound effects (audio feedback with toggle control) `S`
- [x] Idle detection (5min idle, 20min offline thresholds) `S`
- [x] Play again flow (rematch with word avoidance from previous games) `M`
- [x] UI polish (responsive layout, sidebar with friends/games/chat panels, modals) `M`

## Phase 1: Verification & Bug Fixing

**Goal:** Validate all implemented features work correctly end-to-end
**Success Criteria:** All 14 verification checklist items pass in two browser tabs

### Features

- [ ] Run full verification checklist across two browser sessions `M`
- [ ] Fix any auth flow issues found during testing `S`
- [ ] Fix any real-time sync issues found during testing `M`
- [ ] Fix any game logic edge cases found during testing `S`
- [ ] Fix any UI/UX issues found during testing `S`

### Dependencies

- All Phase 0 code must be committed and building successfully

## Phase 2: Deploy to Netlify

**Goal:** Ship the application to production
**Success Criteria:** App is live, accessible via URL, and all features work in production

### Features

- [ ] Connect GitHub repository to Netlify `XS`
- [ ] Configure environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) `XS`
- [ ] Verify SPA routing works in production (netlify.toml redirects) `S`
- [ ] Test real-time features in production environment `S`
- [ ] Verify auth confirmation emails work in production `S`

### Dependencies

- Phase 1 verification must pass

## Phase 3: Post-Launch Polish

**Goal:** Address any issues found during real-world usage
**Success Criteria:** Smooth gameplay experience with no critical bugs

### Features

- [ ] Address user-reported bugs `M`
- [ ] UX improvements based on playtesting feedback `M`
- [ ] Performance optimization if needed `S`

### Dependencies

- Phase 2 deployment must be complete
