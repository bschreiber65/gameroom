import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function InvitationModal({
  open,
  onClose,
  fromName,
  onAccept,
  onDecline,
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Game Invitation">
      <p className="text-text mb-4">
        <strong>{fromName}</strong> has invited you to play Codenames!
      </p>
      {loading ? (
        <p className="text-muted text-center">Creating game...</p>
      ) : (
        <div className="flex gap-2">
          <Button onClick={onAccept} className="flex-1">Accept</Button>
          <Button variant="secondary" onClick={onDecline} className="flex-1">Decline</Button>
        </div>
      )}
    </Modal>
  )
}
