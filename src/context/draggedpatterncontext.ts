import { DraggingPattern } from "@models/pattern";
import React from "react";

interface DraggedPatternContextProps {
    draggedPattern?: DraggingPattern;
    setDraggedPattern: React.Dispatch<React.SetStateAction<DraggingPattern | undefined>>;
}

const DraggedPatternContext = React.createContext<DraggedPatternContextProps>(undefined!);
export default DraggedPatternContext;