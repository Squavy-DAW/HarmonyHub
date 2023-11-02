import React from "react";

interface ModalContextProps {
    modalContent?: React.ReactNode;
    setModalContent: (modalContent?: React.ReactNode) => void;
}

const ModalContext = React.createContext<ModalContextProps>(undefined!);
export default ModalContext;