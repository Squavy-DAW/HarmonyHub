import { AudioEngine } from "@synth/audioengine";
import React from "react";

interface SoundContextProps {
    ctx: AudioContext;
    engine: AudioEngine;
}

const SoundContext = React.createContext<SoundContextProps>(undefined!);
export default SoundContext;