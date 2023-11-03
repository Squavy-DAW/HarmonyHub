import React from "react";

interface MousePositionsContextProps {
    mousePositions: {[id: string]: { x: number, y: number }};
    setMousePositions: (mousePositions: {[id: string]: { x: number, y: number }}) => void;
}

const MousePositionsContext = React.createContext<MousePositionsContextProps>(undefined!);
export default MousePositionsContext;