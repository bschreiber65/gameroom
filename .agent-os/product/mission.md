# Product Mission

## Pitch

Codenames is a multiplayer web application for playing Codenames online. Two players take turns giving one-word clues and guessing cards on a 5x5 grid, with real-time gameplay, in-game chat, friend lists, and game invitations.

## Users

### Primary Customers

- **Casual Gamers**: People who want to play Codenames remotely with friends without downloading an app or creating complex accounts
- **Board Game Enthusiasts**: Players who enjoy word-guessing and deduction games and want a digital version they can play anytime

### User Personas

**Alex** (20-35 years old)
- **Role:** Casual gamer
- **Context:** Wants to play Codenames with a friend who lives in another city
- **Pain Points:** Existing options are clunky, require downloads, or lack social features
- **Goals:** Quick game setup, real-time play, easy way to find and invite friends

**Jordan** (25-40 years old)
- **Role:** Board game enthusiast
- **Context:** Regularly plays board games online and wants a polished Codenames experience
- **Pain Points:** Free alternatives lack friend lists, chat, and rematch functionality
- **Goals:** Persistent friend list, game history context, seamless rematch flow

## The Problem

### No Lightweight Free Codenames App with Social Features

Existing Codenames implementations are either barebones (no friend system, no chat) or require heavy setup. Players have no way to maintain a friend list, receive game invitations, or quickly rematch after a game ends.

**Our Solution:** A free, browser-based Codenames app with built-in friend lists, real-time invitations, global and per-game chat, and a play-again flow that avoids repeating words.

### Real-Time Multiplayer Requires Custom Server Infrastructure

Most real-time multiplayer games require setting up and maintaining WebSocket servers, which adds cost and operational complexity for a free game.

**Our Solution:** Supabase Realtime (Broadcast + Presence + Postgres Changes) eliminates the need for a custom server while providing full real-time capabilities.

## Differentiators

### No Custom Server Required

Unlike traditional multiplayer games that require maintaining WebSocket servers (Socket.IO, etc.), Codenames uses Supabase Realtime for all multiplayer communication. This means zero server maintenance, lower hosting costs, and the app runs as a static SPA on Netlify.

### Integrated Social Features

Unlike other free Codenames implementations that are game-only, we provide a complete social layer: friend lists with online/idle/offline presence tracking, game invitations, and persistent chat. Players build a community, not just play one-off games.

### Smart Play-Again Flow

Unlike starting fresh each game, our play-again system tracks previously used words and avoids them in subsequent games. This keeps gameplay fresh across multiple sessions with the same opponent.

## Key Features

### Core Game Features

- **5x5 Card Grid with Asymmetric Identifiers**: Each player sees their own identifier colors (Operative, Innocent, Assassin) while opponent identifiers remain hidden
- **One-Word Clue System**: Players give a single word and a number indicating how many cards match
- **Real-Time Card Reveals**: Card clicks broadcast instantly to both players via Supabase Realtime
- **Win/Loss Conditions**: Win by finding 15 correct identifications; lose by hitting the assassin, exceeding turn limit, or reaching mistake limit
- **Play Again Flow**: Rematch with the same opponent using fresh words that avoid previous game vocabulary

### Social Features

- **Friend Lists**: Add friends by username with online/idle/offline presence indicators
- **Game Invitations**: Invite friends to play directly from the lobby
- **Global Chat**: Chat with any online player from the sidebar
- **Per-Game Chat**: In-game messaging between opponents during play

### Experience Features

- **Sound Effects**: Audio feedback for card clicks, clues, wins, and losses with toggle control
- **Responsive Design**: Playable on desktop and tablet browsers
- **Real-Time Presence**: See which friends are online, idle (5min), or offline (20min)
