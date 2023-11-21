import { Synth } from "./synth";

export interface AudioEngine{
    synths:Synth[];
}

export function createAudioEngine():AudioEngine{
    return {
        synths: []
    }
}