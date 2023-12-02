import { AdvancedAudioNodeParams } from "@synth/synth";
import ConnectionPoint from "./connectionpoint"
import { createOscillatorParams } from "@synth/oscillatorParams";
import { createAudioEndNodeParams } from "@synth/audioEndNode";

export type AudioNodeType = "AudioEndNode" | "Oscillator" | "Envelope";

export default interface RoutableAudioNode {
    type: AudioNodeType
    name: string,
    id?: string, // TOOD: Remove (in favor of key-value pairs)
    x: number,
    y: number,
    width: number,
    height: number,
    connectionpoints: ConnectionPoint[]
    node: {
        id: string,
        params: AdvancedAudioNodeParams
    }
}

export const defaultOscillatorNode: RoutableAudioNode = {
    type: "Oscillator",
    name: "Default Oscillator",
    id: undefined,
    x: 0,
    y: 0,
    height: 100,
    width: 100,
    connectionpoints: [
        { top: 40, left: -10, id: "mod", type: "gain" },
        { top: 40, right: -10, id: "out", type: "" },
        { bottom: -10, left: 40, id: "mod", type: "pan" },
    ],
    node: {
        id: "oscillator",
        params: createOscillatorParams("sine", 0, 0, 0, 0, 0, 0)
    }
}

export const defaultAudioEndNode: RoutableAudioNode = {
    type: "AudioEndNode",
    name: "Default AudioEndNode",
    id: undefined,
    x: 0,
    y: 0,
    height: 50,
    width: 100,
    connectionpoints: [
        { bottom: -10, left: 40, id: "in", type: "" },
    ],
    node: {
        id: "audioendnode",
        params: createAudioEndNodeParams(1)
    }
}
