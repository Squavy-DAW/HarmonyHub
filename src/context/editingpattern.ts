import Pattern from "@models/pattern";
import React from "react";

interface EditingPatternContextProps {
    editingPattern: Pattern | undefined;
    setEditingPattern: (pattern: Pattern | undefined) => void;
}

const EditingPatternContext = React.createContext<EditingPatternContextProps>(undefined!);
export default EditingPatternContext;