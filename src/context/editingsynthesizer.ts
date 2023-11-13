import { Synth } from "@synth/synth";
import React from "react";

interface EditingSynthesizerContextProps {
    editingSynthesizer: Synth | undefined;
    setEditingSynth: (synth: Synth | undefined) => void;
}

const EditingSynthesizerContext = React.createContext<EditingSynthContextProps>(undefined!);
export default EditingSynthesizerContext;