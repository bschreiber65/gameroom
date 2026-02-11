import { useEffect, useState, useReducer, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSound } from '../hooks/useSound'
import { useGameChannel } from '../hooks/useGameChannel'
import { useIdleTimer } from '../hooks/useIdleTimer'
import { gameReducer, initialGameState } from '../logic/gameReducer'
import { createCards, validateTurn, validateCardClick, computeGameOutcome, getCardWords, capitalize } from '../logic/gameEngine'
import { GAME_STATUS, CARD_RESULTS, PRESENCE_STATUS } from '../lib/constants'
import CardGrid from '../components/game/CardGrid'
import CluePanel from '../components/game/CluePanel'
import PlayerBar from '../components/game/PlayerBar'
import GameHeader from '../components/game/GameHeader'
import EndGameModal from '../components/modals/EndGameModal'
import InvitePlayerModal from '../components/modals/InvitePlayerModal'
import AlertModal from '../components/modals/AlertModal'

export default function GamePage() {
  const { id: gameId } = useParams()
  const { user, profile } = useAuth()
  const { play } = useSound()
  const navigate = useNavigate()

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)
  const [loading, setLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEndGameModal, setShowEndGameModal] = useState(false)
  const [player1Profile, setPlayer1Profile] = useState(null)
  const [player2Profile, setPlayer2Profile] = useState(null)

  const { broadcast, updatePresence } = useGameChannel(gameId, dispatch)

  // Idle timer
  const handleIdleStatusChange = useCallback((status) => {
    updatePresence(status)
  }, [updatePresence])

  useIdleTimer(handleIdleStatusChange)

  // Determine player role
  const playerRole = gameState.player1_id === user?.id ? 'player1'
    : gameState.player2_id === user?.id ? 'player2'
    : null

  const isMyTurn = playerRole && gameState.current_turn === playerRole
  const gameOver = gameState.status === GAME_STATUS.WIN || gameState.status === GAME_STATUS.LOSS
  const canSubmitClue = isMyTurn && gameState.card_lock
  const canClickCards = isMyTurn && !gameState.card_lock && gameState.clue_count > 0
  const canEndGuessing = isMyTurn && !gameState.card_lock && gameState.clue_count > 0

  // Load game data
  useEffect(() => {
    loadGame()
  }, [gameId])

  async function loadGame() {
    const { data: game, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()

    if (error || !game) {
      navigate('/')
      return
    }

    dispatch({ type: 'INIT_GAME', payload: game })

    // Load player profiles
    if (game.player1_id) {
      const { data: p1 } = await supabase.from('profiles').select('*').eq('id', game.player1_id).single()
      setPlayer1Profile(p1)
    }
    if (game.player2_id) {
      const { data: p2 } = await supabase.from('profiles').select('*').eq('id', game.player2_id).single()
      setPlayer2Profile(p2)
    }

    // If player2 is joining a waiting game
    if (game.status === GAME_STATUS.WAITING && game.player1_id !== user.id && !game.player2_id) {
      await joinGame(game)
    }

    // If game is waiting and we're player1, show invite
    if (game.status === GAME_STATUS.WAITING && game.player1_id === user.id && !game.player2_id) {
      setShowInviteModal(true)
    }

    // Auto-add friends
    if (game.player1_id && game.player2_id && game.player1_id !== game.player2_id) {
      addFriend(game.player1_id === user.id ? game.player2_id : game.player1_id)
    }

    setLoading(false)
  }

  async function joinGame(game) {
    const cards = game.cards?.length ? game.cards : createCards(game.previous_words || [])

    const { error } = await supabase
      .from('games')
      .update({
        player2_id: user.id,
        status: GAME_STATUS.IN_PROGRESS,
        cards,
      })
      .eq('id', gameId)

    if (!error) {
      dispatch({
        type: 'PLAYER_JOINED',
        payload: { player2_id: user.id },
      })
      dispatch({
        type: 'INIT_GAME',
        payload: { ...game, player2_id: user.id, status: GAME_STATUS.IN_PROGRESS, cards },
      })

      const { data: p2 } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setPlayer2Profile(p2)

      broadcast('player_joined', { player2_id: user.id })
      addFriend(game.player1_id)
    }
  }

  async function addFriend(friendId) {
    if (!friendId || friendId === user.id) return
    await supabase.from('friendships').upsert(
      { user_id: user.id, friend_id: friendId },
      { onConflict: 'user_id,friend_id', ignoreDuplicates: true }
    )
  }

  async function handleCardClick(position) {
    if (gameOver || !playerRole) return

    if (!validateTurn(gameState, user.id)) {
      setAlertMessage(`Not your turn. Current player is: ${gameState.current_turn === 'player1' ? player1Profile?.name : player2Profile?.name}`)
      play('ERROR_1')
      return
    }

    const validation = validateCardClick(gameState, user.id, position)
    if (!validation.valid) {
      setAlertMessage(validation.reason)
      play('ERROR_1')
      return
    }

    const payload = {
      cardPosition: position,
      currentPlayer: playerRole,
      playerName: capitalize(profile?.name || 'Player'),
    }

    dispatch({ type: 'CARD_CLICKED', payload })
    broadcast('card_click', payload)

    // Get the clicked card to determine sound
    const card = gameState.cards.find(c => c.position === position)
    const opponentId = playerRole === 'player1' ? card.p2_identifier : card.p1_identifier

    if (opponentId === 'O') {
      // Check if this was the winning click
      const newCorrect = gameState.correct_count + 1
      if (newCorrect >= 15) {
        play('WIN_1')
        setShowEndGameModal(true)
      } else {
        play('SUCCESS_1')
      }
    } else if (opponentId === 'I') {
      play('OOPS_2')
    } else if (opponentId === 'A') {
      play('LOSE_1')
      setShowEndGameModal(true)
    }

    // Persist to database
    await persistGameState(payload)
  }

  async function handleClueSubmit(clue) {
    const payload = { clue }
    dispatch({ type: 'CLUE_SUBMITTED', payload })
    broadcast('clue_submitted', payload)
    play('CLUE_2')

    const newClueCount = gameState.clue_count + 1
    const newTurnCount = newClueCount > 0 ? gameState.turn_count + 1 : gameState.turn_count
    const newTurn = gameState.current_turn === 'player1' ? 'player2' : 'player1'

    await supabase
      .from('games')
      .update({
        clue_count: newClueCount,
        turn_count: newTurnCount,
        current_turn: newTurn,
        card_lock: false,
        event_log: [
          ...gameState.event_log,
          { type: 'clue', number: newClueCount, text: clue, player: gameState.current_turn },
        ],
      })
      .eq('id', gameId)
  }

  async function handleSwapTurn() {
    dispatch({ type: 'TURN_SWAPPED' })
    broadcast('turn_swapped', {})

    const newTurn = gameState.current_turn === 'player1' ? 'player2' : 'player1'
    await supabase.from('games').update({ current_turn: newTurn }).eq('id', gameId)
  }

  async function handleUnlockCards() {
    dispatch({ type: 'CARDS_UNLOCKED' })
    broadcast('cards_unlocked', {})
    setAlertMessage('Cards unlocked.')

    await supabase.from('games').update({ card_lock: false }).eq('id', gameId)
  }

  async function handleEndGuessing() {
    const playerName = capitalize(profile?.name || 'Player')
    dispatch({ type: 'GUESSING_ENDED', payload: { playerName } })
    broadcast('guessing_ended', { playerName })

    await supabase.from('games').update({
      card_lock: true,
      event_log: [
        ...gameState.event_log,
        { type: 'system', text: `${playerName} ended guessing.` },
      ],
    }).eq('id', gameId)
  }

  async function handleEndGame() {
    const payload = { status: GAME_STATUS.LOSS, reason: 'Game ended by player.' }
    dispatch({ type: 'GAME_ENDED', payload })
    broadcast('game_ended', payload)
    setShowEndGameModal(true)
    play('LOSE_1')

    await supabase.from('games').update({ status: GAME_STATUS.LOSS }).eq('id', gameId)
  }

  async function handlePlayAgain() {
    const previousWords = getCardWords(gameState.cards)
    const opponentId = playerRole === 'player1' ? gameState.player2_id : gameState.player1_id

    const { data: game } = await supabase
      .from('games')
      .insert({
        player1_id: user.id,
        player2_id: opponentId,
        status: GAME_STATUS.IN_PROGRESS,
        turn_limit: gameState.turn_limit,
        mistake_limit: gameState.mistake_limit,
        cards: createCards(previousWords),
        previous_words: previousWords,
      })
      .select()
      .single()

    if (game) {
      // Notify opponent
      if (opponentId) {
        const channel = supabase.channel(`user:${opponentId}`)
        channel.httpSend('game_created', { game_id: game.id, redirect: true }).catch(() => {})
      }
      navigate(`/game/${game.id}`)
    }
  }

  async function persistGameState(cardClickPayload) {
    const { cardPosition, currentPlayer } = cardClickPayload
    const identifiedKey = currentPlayer === 'player1' ? 'p1_identified' : 'p2_identified'

    const updatedCards = gameState.cards.map(card =>
      card.position === cardPosition
        ? { ...card, [identifiedKey]: true }
        : card
    )

    const card = updatedCards.find(c => c.position === cardPosition)
    const opponentId = currentPlayer === 'player1' ? card.p2_identifier : card.p1_identifier
    const isCorrect = opponentId === 'O'
    const isInnocent = opponentId === 'I'
    const isAssassin = opponentId === 'A'

    const newCorrect = gameState.correct_count + (isCorrect ? 1 : 0)
    const newMistakes = gameState.mistake_count + (isInnocent || isAssassin ? 1 : 0)
    const newCardLock = isInnocent || isAssassin ? true : gameState.card_lock

    let newStatus = gameState.status
    if (newCorrect >= 15) newStatus = GAME_STATUS.WIN
    else if (isAssassin || gameState.turn_count >= gameState.turn_limit || newMistakes >= gameState.mistake_limit) {
      newStatus = GAME_STATUS.LOSS
    }

    await supabase
      .from('games')
      .update({
        cards: updatedCards,
        correct_count: newCorrect,
        mistake_count: newMistakes,
        card_lock: newCardLock,
        status: newStatus,
        event_log: [
          ...gameState.event_log,
          {
            type: 'card',
            text: `${capitalize(profile?.name)} guessed ${card.word}.`,
            code: isCorrect ? 'o' : isInnocent ? 'i' : 'a',
            player: currentPlayer,
          },
        ],
      })
      .eq('id', gameId)
  }

  // Show end game modal when game ends
  useEffect(() => {
    if (gameOver && !loading) {
      setShowEndGameModal(true)
    }
  }, [gameState.status])

  // Get presence-based status for players
  function getPlayerPresenceStatus(playerId) {
    const presence = gameState.presence[playerId]
    return presence?.status || PRESENCE_STATUS.OFFLINE
  }

  const opponentName = playerRole === 'player1'
    ? player2Profile?.name
    : player1Profile?.name

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted text-lg">Loading game...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Game header toolbar */}
      <GameHeader
        onSwapTurn={handleSwapTurn}
        onUnlockCards={handleUnlockCards}
        onNewGame={() => navigate('/new-game')}
        onInvite={() => setShowInviteModal(true)}
        onEndGame={handleEndGame}
        isMyTurn={isMyTurn}
        gameOver={gameOver}
      />

      {/* Player indicators */}
      <PlayerBar
        player1Name={player1Profile?.name}
        player2Name={player2Profile?.name}
        currentTurn={gameState.current_turn}
        player1Status={getPlayerPresenceStatus(gameState.player1_id)}
        player2Status={getPlayerPresenceStatus(gameState.player2_id)}
      />

      {/* Main game area */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Card grid */}
        <div className="flex-1">
          <CardGrid
            cards={gameState.cards}
            playerRole={playerRole}
            onCardClick={handleCardClick}
            disabled={gameOver || !canClickCards}
          />
        </div>

        {/* Clue panel */}
        <div className="w-full lg:w-80">
          <CluePanel
            gameState={gameState}
            isMyTurn={isMyTurn}
            canSubmitClue={canSubmitClue}
            canEndGuessing={canEndGuessing}
            onClueSubmit={handleClueSubmit}
            onEndGuessing={handleEndGuessing}
          />
        </div>
      </div>

      {/* Modals */}
      <EndGameModal
        open={showEndGameModal}
        onClose={() => setShowEndGameModal(false)}
        status={gameState.status}
        reason={gameState.event_log.findLast(e => e.type === 'system')?.text || ''}
        opponentName={opponentName}
        onPlayAgain={handlePlayAgain}
        onNewGame={() => navigate('/new-game')}
      />

      <InvitePlayerModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        gameUrl={window.location.href}
        message={gameState.status === GAME_STATUS.WAITING
          ? "You're the only player. Share this link to invite someone."
          : 'Share this link to invite another player.'}
      />

      <AlertModal
        open={!!alertMessage}
        onClose={() => setAlertMessage('')}
        message={alertMessage}
      />
    </div>
  )
}
