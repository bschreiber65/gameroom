import { nouns } from '../data/nouns'
import { CARD_TYPES, CARD_RESULTS, BOARD_SIZE, WIN_TARGET } from '../lib/constants'

/**
 * Fisher-Yates shuffle (ported from codenames.js lines 586-604)
 */
export function shuffleArray(array) {
  const arr = [...array]
  let currentIndex = arr.length
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    const temp = arr[currentIndex]
    arr[currentIndex] = arr[randomIndex]
    arr[randomIndex] = temp
  }
  return arr
}

/**
 * Generate 25 unique words avoiding previous game words
 * (ported from codenames.js lines 508-584)
 */
export function generateWords(previousWords = []) {
  const words = []
  const prevSet = new Set(previousWords)
  const available = nouns.filter(w => !prevSet.has(w))

  const shuffled = shuffleArray(available)
  for (let i = 0; i < BOARD_SIZE && i < shuffled.length; i++) {
    words.push(shuffled[i])
  }
  return words
}

/**
 * Generate 25 identifier pairs [p1, p2] for each card position
 * (ported from codenames.js lines 519-571)
 *
 * Rules:
 * - 3 cards are shared operatives (O,O)
 * - 3 cards are assassins for P1, random O/I for P2
 * - 3 cards are assassins for P2, random O/I for P1
 * - Remaining 16 filled so each player has exactly 9 operatives total
 */
export function generateIdentifiers() {
  const pick = () => Math.random() < 0.5 ? CARD_TYPES.OPERATIVE : CARD_TYPES.INNOCENT

  const identifiers = [
    [CARD_TYPES.OPERATIVE, CARD_TYPES.OPERATIVE],
    [CARD_TYPES.OPERATIVE, CARD_TYPES.OPERATIVE],
    [CARD_TYPES.OPERATIVE, CARD_TYPES.OPERATIVE],
    [CARD_TYPES.ASSASSIN, pick()],
    [CARD_TYPES.ASSASSIN, pick()],
    [CARD_TYPES.ASSASSIN, pick()],
    [pick(), CARD_TYPES.ASSASSIN],
    [pick(), CARD_TYPES.ASSASSIN],
    [pick(), CARD_TYPES.ASSASSIN],
    ...Array(16).fill(null).map(() => ['', '']),
  ]

  let p1_o = 0, p2_o = 0
  for (let i = 0; i < 9; i++) {
    if (identifiers[i][0] === CARD_TYPES.OPERATIVE) p1_o++
    if (identifiers[i][1] === CARD_TYPES.OPERATIVE) p2_o++
  }

  for (let i = 0; i < 16; i++) {
    if (9 - p1_o > 0) {
      identifiers[9 + i][0] = CARD_TYPES.OPERATIVE
      identifiers[9 + i][1] = CARD_TYPES.INNOCENT
      p1_o++
    } else {
      identifiers[9 + i][0] = CARD_TYPES.INNOCENT
      if (9 - p2_o > 0) {
        identifiers[9 + i][1] = CARD_TYPES.OPERATIVE
        p2_o++
      } else {
        identifiers[9 + i][1] = CARD_TYPES.INNOCENT
      }
    }
  }

  return identifiers
}

/**
 * Create 25 card objects for a new game
 */
export function createCards(previousWords = []) {
  const words = generateWords(previousWords)
  const identifiers = generateIdentifiers()
  const positions = shuffleArray(Array.from({ length: BOARD_SIZE }, (_, i) => i))

  return positions.map((pos, i) => ({
    position: pos,
    word: words[i],
    p1_identifier: identifiers[i][0],
    p2_identifier: identifiers[i][1],
    p1_identified: false,
    p2_identified: false,
  }))
}

/**
 * Get the card code (result of clicking) for the current player
 * When player1 clicks, we check player2's identifier (the opponent's role for that card)
 * When player2 clicks, we check player1's identifier
 * (ported from codenames.js lines 794-815)
 */
export function getCardCode(card, currentPlayer) {
  const opponentIdentifier = currentPlayer === 'player1'
    ? card.p2_identifier
    : card.p1_identifier

  if (opponentIdentifier === CARD_TYPES.OPERATIVE) return CARD_RESULTS.OPERATIVE
  if (opponentIdentifier === CARD_TYPES.INNOCENT) return CARD_RESULTS.INNOCENT
  if (opponentIdentifier === CARD_TYPES.ASSASSIN) return CARD_RESULTS.ASSASSIN
  return null
}

/**
 * Validate that it's the given player's turn
 */
export function validateTurn(gameState, userId) {
  const { current_turn, player1_id, player2_id } = gameState
  if (current_turn === 'player1' && userId === player1_id) return true
  if (current_turn === 'player2' && userId === player2_id) return true
  return false
}

/**
 * Validate a card click is allowed
 */
export function validateCardClick(gameState, userId, cardPosition) {
  const { cards, card_lock, clue_count, turn_lock, player1_id, player2_id } = gameState
  const card = cards.find(c => c.position === cardPosition)
  if (!card) return { valid: false, reason: 'Card not found.' }
  if (card_lock || clue_count === 0) return { valid: false, reason: 'Cards locked. Please enter a clue.' }

  const isPlayer1 = userId === player1_id
  const playerKey = isPlayer1 ? 'player1' : 'player2'

  if (turn_lock === playerKey) {
    return { valid: false, reason: "You have already identified all of your partner's cards. Please enter a clue." }
  }

  const identified = isPlayer1 ? card.p1_identified : card.p2_identified
  if (identified) return { valid: false, reason: 'Card has already been identified.' }

  return { valid: true }
}

/**
 * Validate a clue doesn't match any card word
 * (ported from codenames.js lines 128-150)
 */
export function validateClue(clue, cardWords) {
  if (!clue || !clue.trim()) return { valid: false, reason: 'Please enter a clue.' }

  const normalizedClue = clue.trim().toLowerCase()
  const parts = [
    normalizedClue,
    normalizedClue.split(' ')[0],
    normalizedClue.split(',')[0],
    normalizedClue.split('-')[0],
  ]

  for (const word of cardWords) {
    const normalizedWord = word.toLowerCase()
    if (parts.some(p => p === normalizedWord)) {
      return { valid: false, reason: 'Your clue matches one of the cards shown. Please enter a new clue.' }
    }
  }

  return { valid: true }
}

/**
 * Compute game outcome after a card click
 * Returns null if game continues, or { status, reason }
 */
export function computeGameOutcome(gameState) {
  const { correct_count, mistake_count, turn_count, turn_limit, mistake_limit } = gameState

  if (correct_count >= WIN_TARGET) {
    return { status: 'win', reason: 'Congrats! You have identified all of the agents.' }
  }

  // Check for assassin (indicated by last card code being 'a')
  if (gameState._lastCardCode === CARD_RESULTS.ASSASSIN) {
    return { status: 'loss', reason: 'Assassin Identified.' }
  }

  if (turn_count >= turn_limit && mistake_count >= mistake_limit) {
    return { status: 'loss', reason: 'Turn limit and mistake limit reached.' }
  }

  if (turn_count >= turn_limit) {
    return { status: 'loss', reason: 'Turn limit reached.' }
  }

  if (mistake_count >= mistake_limit) {
    return { status: 'loss', reason: 'Mistake limit reached.' }
  }

  return null
}

/**
 * Get the current word list from cards (for previous_words in play again)
 */
export function getCardWords(cards) {
  return cards.map(c => c.word)
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
