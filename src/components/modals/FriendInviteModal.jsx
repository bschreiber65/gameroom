import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { DEFAULT_TURN_LIMIT, DEFAULT_MISTAKE_LIMIT } from '../../lib/constants'

export default function FriendInviteModal({
  open,
  onClose,
  friendName,
  onInvite,
  loading,
  waitingMessage,
}) {
  const [turnLimit, setTurnLimit] = useState(DEFAULT_TURN_LIMIT)
  const [mistakeLimit, setMistakeLimit] = useState(DEFAULT_MISTAKE_LIMIT)

  function handleSubmit(e) {
    e.preventDefault()
    onInvite({ turnLimit, mistakeLimit })
  }

  return (
    <Modal open={open} onClose={onClose} title={`Invite ${friendName}`}>
      {waitingMessage ? (
        <p className="text-muted text-center">{waitingMessage}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Turn Limit"
            type="number"
            min={1}
            max={25}
            value={turnLimit}
            onChange={e => setTurnLimit(Number(e.target.value))}
          />
          <Input
            label="Mistake Limit"
            type="number"
            min={1}
            max={25}
            value={mistakeLimit}
            onChange={e => setMistakeLimit(Number(e.target.value))}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
