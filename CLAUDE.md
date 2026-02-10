# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Codenames is a multiplayer web application for playing Codenames (a word-guessing board game) online. Two players take turns giving one-word clues and guessing cards on a 5x5 grid. Features real-time gameplay, in-game chat, friend lists, and game invitations.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS 4 |
| Icons | Lucide React |
| Routing | React Router DOM v7 |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime (Broadcast + Presence + Postgres Changes) |
| Auth | Supabase Auth (email/password) |
| Hosting | Netlify (static SPA) |

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run lint         # ESLint checking
```

## Architecture

### Source Structure
```
src/
  main.jsx              # Entry point with providers
  App.jsx               # Route definitions
  index.css             # TailwindCSS imports + custom animations
  lib/
    supabase.js         # Supabase client singleton
    constants.js        # Game constants, enums, sound paths
  data/
    nouns.js            # ~800 word noun array for card generation
  contexts/
    AuthContext.jsx      # Auth state + Supabase auth methods
    GameContext.jsx      # Game reducer wrapper
    SoundContext.jsx     # Sound toggle + audio playback
  hooks/
    useAuth.js           # Auth context consumer
    useGame.js           # Game context consumer
    useSound.js          # Sound context consumer
    useGameChannel.js    # Supabase Realtime broadcast for game events
    useNotificationChannel.js  # User invitation notifications
    useLobbyPresence.js  # Friend online/idle/offline status
    useChatSubscription.js     # Postgres Changes for chat messages
    useIdleTimer.js      # 5min idle / 20min offline detection
  logic/
    gameEngine.js        # Pure functions: word gen, card gen, validation
    gameReducer.js       # React reducer for game state
  pages/
    LoginPage.jsx        # Email/password sign in
    RegisterPage.jsx     # Account creation
    LobbyPage.jsx        # Game list + invitation handling
    NewGamePage.jsx      # Turn/mistake limit form
    GamePage.jsx         # Main game with board, clues, real-time
  components/
    layout/              # AppLayout, Sidebar, ProtectedRoute
    game/                # CardGrid, CardCell, CluePanel, EventLog, etc.
    sidebar/             # UserWelcome, NavLinks, FriendsList, GamesList, ChatPanel
    modals/              # EndGame, InvitePlayer, Invitation, FriendInvite, Alert
    ui/                  # Button, Input, Modal primitives
```

### Real-time Strategy
- **Game channel** (`game:{gameId}`): Broadcast for card clicks, clues, turn swaps. Presence for player online status.
- **User channel** (`user:{userId}`): Broadcast for invitation notifications.
- **Lobby channel**: Presence for friend online tracking.
- **Chat**: Postgres Changes on `messages` table.

### Game Logic
- 25-card grid with asymmetric identifiers per player (Operative, Innocent, Assassin)
- Each player sees only their own identifier colors; opponent's are hidden
- When clicking a card, the result is determined by the OPPONENT's identifier
- Win: 15 correct identifications. Loss: assassin, turn limit, or mistake limit.
- Card generation uses Fisher-Yates shuffle with duplicate/previous-word avoidance

### Database
- Schema in `supabase/schema.sql` - run in Supabase SQL Editor
- Tables: profiles, friendships, games, messages, invitations
- RLS policies enforce access control
- Triggers: auto-create profile on signup, auto-update timestamps

## Environment Variables

Create `.env.local` (see `.env.example`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Deployment

Netlify serves the static SPA. SPA routing configured in `netlify.toml`.
Build: `npm run build` -> `dist/`

## Key Files for Game Logic

| File | Purpose |
|------|---------|
| `src/logic/gameEngine.js` | Pure functions: card generation, identifier assignment, validation, outcome computation |
| `src/logic/gameReducer.js` | React reducer handling all game state transitions |
| `src/pages/GamePage.jsx` | Main game orchestrator: loads game, handles events, persists state |
| `src/hooks/useGameChannel.js` | Supabase Realtime broadcast/presence for multiplayer sync |
| `src/data/nouns.js` | ~800 word array for card word selection |
