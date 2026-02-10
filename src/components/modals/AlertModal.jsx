import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function AlertModal({ open, onClose, message }) {
  return (
    <Modal open={open} onClose={onClose} title="Alert">
      <p className="text-text mb-4" dangerouslySetInnerHTML={{ __html: message }} />
      <Button onClick={onClose} className="w-full">OK</Button>
    </Modal>
  )
}
