import { AdvancedAudioNodeParams } from "@synth/synth";
import ConnectionPointProps from "./connectionpointprops"
import { createOscillatorParams } from "@synth/oscillatorParams";
import { createAudioEndNodeParams } from "@synth/audioEndNode";

export type AudioNodeType = "AudioEndNode" | "Oscillator" | "Envelope";

export default interface AudioNodeProps {
    type: AudioNodeType
    name: string,
    id: string|undefined,
    data: { 
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
}

export const defaultOscillatorNode:AudioNodeProps = {
    type: "Oscillator",
    name: "Default Oscillator",
    id: undefined,
    data: {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        connectionpoints: [
            {top:40, left:-10, id:"mod"},
            {top:40, right: -10, id:"out"},
            {bottom:-10, left:40, id:"mod"},
        ],
        node: {
            id: "oscillator",
            params: createOscillatorParams("sine",0,0,0,0,0,0)
        }
    }
}

export const defaultAudioEndNode:AudioNodeProps = {
    type: "AudioEndNode",
    name: "Default AudioEndNode",
    id: undefined,
    data: {
        x: 0,
        y: 0,
        height: 50,
        width: 100,
        connectionpoints: [
            {bottom:-10, left:40, id:"in"},
        ],
        node: {
            id: "audioendnode",
            params: createAudioEndNodeParams(1)
        }
    }
}
