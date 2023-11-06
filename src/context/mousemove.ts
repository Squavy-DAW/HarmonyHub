import React from "react";

interface MouseMoveContextProps {
    mousePosition: { x: number, y: number };
    mouseDelta: { x: number, y: number };
    mouseDown: boolean;
    propagating: boolean;
    setPropagating: (value: boolean) => void;
}

const MouseMoveContext = React.createContext<MouseMoveContextProps>(undefined!);
export default MouseMoveContext;