import { Synth } from "@models/synth";
import React from "react";

interface EditingSynthesizerContextProps {
    editingSynthesizer: Synth | undefined;
    setEditingSynth: (synth: Synth | undefined) => void;
}

const EditingSynthesizerContext = React.createContext<EditingSynthesizerContextProps>(undefined!);
export default EditingSynthesizerContext;