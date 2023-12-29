import React from "react";

interface SoundContextProps {
    ctx: AudioContext;
}

const SoundContext = React.createContext<SoundContextProps>(undefined!);
export default SoundContext;