import { Button } from "../../../../../Goose-UI/Forms/Button";
import Modal from "../../../../../Goose-UI/Modal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmDelete: () => void;
}

export const AskDeleteMessageModal: React.FC<ModalProps> = (props) => {
  const { isOpen, onClose, confirmDelete } = props;

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Подтверждение удаления</h3>
        <p>Вы действительно хотите удалить это сообщение?</p>
        <div className="flex justify-end gap-2">
          <Button color="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button color="danger" onClick={confirmDelete} autoFocus>
            Да, удалить
          </Button>
        </div>
      </div>
    </Modal>
  );
};
