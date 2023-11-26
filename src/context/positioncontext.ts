import React from "react";

interface PositionContextProps {
    position: number;
}

const PositionContext = React.createContext<PositionContextProps>({ position: 0 });
export default PositionContext;