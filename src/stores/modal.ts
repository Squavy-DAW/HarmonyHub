import { create } from "zustand";

export interface ModalContext {
    isModalOpen: boolean;
    modalContent: React.ReactNode;
    setModalContent: (content?: React.ReactNode) => void;
}

export const useModal = create<ModalContext>((set) => ({
    isModalOpen: false,
    modalContent: null,
    setModalContent: (content) => set(() => ({ modalContent: content, isModalOpen: !!content })),
}));

export default useModal;