import { getCardCode, computeGameOutcome } from './gameEngine'
import { CARD_RESULTS, GAME_STATUS } from '../lib/constants'

export const initialGameState = {
  id: null,
  player1_id: null,
  player2_id: null,
  status: GAME_STATUS.WAITING,
  turn_limit: 9,
  mistake_limit: 9,
  turn_count: 0,
  clue_count: 0,
  mistake_count: 0,
  correct_count: 0,
  current_turn: 'player1',
  turn_lock: '',
  card_lock: true,
  cards: [],
  event_log: [],
  previous_words: [],
  presence: {},
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'INIT_GAME': {
      const game = action.payload
      return {
        ...state,
        id: game.id,
        player1_id: game.player1_id,
        player2_id: game.player2_id,
        status: game.status,
        turn_limit: game.turn_limit,
        mistake_limit: game.mistake_limit,
        turn_count: game.turn_count,
        clue_count: game.clue_count,
        mistake_count: game.mistake_count,
        correct_count: game.correct_count,
        current_turn: game.current_turn,
        turn_lock: game.turn_lock,
        card_lock: game.card_lock,
        cards: game.cards || [],
        event_log: game.event_log || [],
        previous_words: game.previous_words || [],
      }
    }

    case 'CARD_CLICKED': {
      const { cardPosition, currentPlayer, playerName } = action.payload
      const isPlayer1Turn = currentPlayer === 'player1'
      const identifiedKey = isPlayer1Turn ? 'p1_identified' : 'p2_identified'

      const updatedCards = state.cards.map(card =>
        card.position === cardPosition
          ? { ...card, [identifiedKey]: true }
          : card
      )

      const clickedCard = updatedCards.find(c => c.position === cardPosition)
      const code = getCardCode(clickedCard, currentPlayer)
      const word = clickedCard.word

      let newCorrect = state.correct_count
      let newMistakes = state.mistake_count
      let newCardLock = state.card_lock
      let newTurnLock = state.turn_lock

      if (code === CARD_RESULTS.OPERATIVE) {
        newCorrect++
      } else if (code === CARD_RESULTS.INNOCENT) {
        newMistakes++
        newCardLock = true
      } else if (code === CARD_RESULTS.ASSASSIN) {
        newMistakes++
        newCardLock = true
      }

      // Check for turn lock (all opponent's cards guessed)
      const p1CorrectCount = updatedCards.filter(c =>
        c.p2_identifier === 'O' && c.p1_identified
      ).length
      const p2CorrectCount = updatedCards.filter(c =>
        c.p1_identifier === 'O' && c.p2_identified
      ).length

      if (p1CorrectCount >= 9 && !newTurnLock) newTurnLock = 'player1'
      if (p2CorrectCount >= 9 && !newTurnLock) newTurnLock = 'player2'

      const newEventLog = [
        ...state.event_log,
        {
          type: 'card',
          text: `${playerName} guessed ${word}.`,
          code,
          player: currentPlayer,
        },
      ]

      const newState = {
        ...state,
        cards: updatedCards,
        correct_count: newCorrect,
        mistake_count: newMistakes,
        card_lock: newCardLock,
        turn_lock: newTurnLock,
        event_log: newEventLog,
        _lastCardCode: code,
      }

      const outcome = computeGameOutcome(newState)
      if (outcome) {
        newState.status = outcome.status
        newState.event_log = [
          ...newState.event_log,
          { type: 'system', text: outcome.reason },
        ]
      }

      return newState
    }

    case 'CLUE_SUBMITTED': {
      const { clue } = action.payload
      const newClueCount = state.clue_count + 1
      const newTurnCount = newClueCount > 0 ? state.turn_count + 1 : state.turn_count
      const newTurn = state.current_turn === 'player1' ? 'player2' : 'player1'

      return {
        ...state,
        clue_count: newClueCount,
        turn_count: newTurnCount,
        current_turn: newTurn,
        card_lock: false,
        event_log: [
          ...state.event_log,
          {
            type: 'clue',
            number: newClueCount,
            text: clue,
            player: state.current_turn,
          },
        ],
      }
    }

    case 'TURN_SWAPPED': {
      return {
        ...state,
        current_turn: state.current_turn === 'player1' ? 'player2' : 'player1',
      }
    }

    case 'CARDS_UNLOCKED': {
      return { ...state, card_lock: false }
    }

    case 'GUESSING_ENDED': {
      return {
        ...state,
        card_lock: true,
        event_log: [
          ...state.event_log,
          { type: 'system', text: `${action.payload.playerName} ended guessing.` },
        ],
      }
    }

    case 'PLAYER_JOINED': {
      const { player2_id } = action.payload
      return {
        ...state,
        player2_id,
        status: GAME_STATUS.IN_PROGRESS,
      }
    }

    case 'GAME_ENDED': {
      return {
        ...state,
        status: action.payload.status,
        event_log: [
          ...state.event_log,
          { type: 'system', text: action.payload.reason },
        ],
      }
    }

    case 'PRESENCE_UPDATED': {
      return {
        ...state,
        presence: { ...state.presence, ...action.payload },
      }
    }

    default:
      return state
  }
}
