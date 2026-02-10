export const GAME_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  WIN: 'win',
  LOSS: 'loss',
}

export const CARD_TYPES = {
  OPERATIVE: 'O',
  INNOCENT: 'I',
  ASSASSIN: 'A',
}

export const CARD_RESULTS = {
  OPERATIVE: 'o',
  INNOCENT: 'i',
  ASSASSIN: 'a',
}

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
}

export const PRESENCE_STATUS = {
  ONLINE: 'online',
  IDLE: 'idle',
  OFFLINE: 'offline',
}

export const DEFAULT_TURN_LIMIT = 9
export const DEFAULT_MISTAKE_LIMIT = 9
export const WIN_TARGET = 15
export const BOARD_SIZE = 25
export const GRID_SIZE = 5

export const IDLE_TIMEOUT_MS = 5 * 60 * 1000   // 5 minutes
export const OFFLINE_TIMEOUT_MS = 20 * 60 * 1000 // 20 minutes

export const SOUNDS = {
  CLICK: '/audio/click1.mp3',
  CLUE_1: '/audio/clue1.mp3',
  CLUE_2: '/audio/clue2.mp3',
  ERROR_1: '/audio/error1.mp3',
  ERROR_2: '/audio/error2.mp3',
  OOPS_1: '/audio/oops1.mp3',
  OOPS_2: '/audio/oops2.mp3',
  SUCCESS_1: '/audio/success1.mp3',
  SUCCESS_2: '/audio/success2.mp3',
  WIN_1: '/audio/win1.mp3',
  WIN_2: '/audio/win2.mp3',
  LOSE_1: '/audio/lose1.mp3',
}
