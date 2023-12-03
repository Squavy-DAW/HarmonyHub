import React from "react";

interface ContextContextProps {
    context: 'track-editor' | string;
}

const ContextContext = React.createContext<ContextContextProps>(undefined!);
export default ContextContext;