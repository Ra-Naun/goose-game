import React, { useEffect, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.body.classList.add("overflow-hidden");
    }

    return () => {
      document.body.style.paddingRight = "";
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 "
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-900 p-6 rounded-lg min-w-[300px] relative max-w-full max-h-[90vh] overflow-auto border border-gray-500"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className={`
            absolute top-2 right-2 
            text-3xl text-gray-600 hover:text-red-900 
            transition-color ease-in-out duration-300
            cursor-pointer 
          `}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
