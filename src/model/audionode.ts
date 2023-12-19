import { AdvancedAudioNodeParams } from "@synth/synth";
import ConnectionPointProps from "./connectionpointprops"
import { createOscillatorParams } from "@synth/oscillatorParams";
import { createAudioEndNodeParams } from "@synth/audioEndNode";

export type AudioNodeType = "AudioEndNode" | "Oscillator" | "Envelope";

export default interface RoutableAudioNode {
    type: AudioNodeType
    name: string,
    id: string|undefined,
    x: number,
    y: number,
    width: number,
    height: number,
    connectionpoints: ConnectionPointProps[]
    node: {
        id: string,
        params: AdvancedAudioNodeParams
    }
}

export function defaultOscillatorNode():RoutableAudioNode {
    return{
        type: "Oscillator",
        name: "Default Oscillator",
        id: undefined,
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        connectionpoints: [
            {top:40, left:-10, id:"mod", type:"Gain"},
            {top:40, right: -10, id:"out", type:""},
            {bottom:-10, left:40, id:"mod", type:"Pan"},
        ],
        node: {
            id: "oscillator",
            params: createOscillatorParams("Sine",0,0,0,0,0,0)
        }
    }
}

export function defaultAudioEndNode():RoutableAudioNode {
    return{
        type: "AudioEndNode",
        name: "Default AudioEndNode",
        id: undefined,
        x: 0,
        y: 0,
        height: 50,
        width: 100,
        connectionpoints: [
            {bottom:-10, left:40, id:"in", type:""},
        ],
        node: {
            id: "audioendnode",
            params: createAudioEndNodeParams(1)
        }
    }
}
