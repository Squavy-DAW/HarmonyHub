import Pattern from "@models/pattern";
import React from "react";

interface EditingPatternContextProps {
    editingPattern?: Pattern;
    setEditingPattern: (pattern?: Pattern) => void;
}

const EditingPatternContext = React.createContext<EditingPatternContextProps>(undefined!);
export default EditingPatternContext;