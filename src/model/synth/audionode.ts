import { AdvancedAudioNodeParams } from "@models/synth";
import ConnectionPoint from "./connectionpoint"
import { createOscillatorParams } from "@models/synth/oscillatorParams";
import { createAudioEndNodeParams } from "@models/synth/audioendnode";
import { createCompressorNodeParams } from "./compressornode";
import ModifiableProperty from "./modifiableproperty";

export type AudioNodeType = "AudioEndNode" | "Oscillator" | "Envelope" | "Compressor";

export default interface RoutableAudioNode {
    type: AudioNodeType
    name: string,
    id: string|undefined,
    x: number,
    y: number,
    width: number,
    height: number,
    connectionpoints: ConnectionPoint[],
    modifiableproperties: ModifiableProperty[],
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
        height: 300,
        width: 300,
        connectionpoints: [
            {top:50, left:20, id:"mod", type:"Gain"},
            {top:140, right: 30, id:"out", type:""},
            {top:100, left:20, id:"mod", type:"Pan"},
        ],
        modifiableproperties: [
            {top:45, left:40,type:"Gain",default:0.5,max:1,min:0,stepping:false},
            {top:95, left:40,type:"Pan",default:0,max:1,min:-1,stepping:false},
            {top:145, left:40,type:"Detune",default:0,max:1200,min:-1200,step:5,stepping:true},
            {top:195, left:40,type:"Phase",default:0,max:360,min:0,stepping:false},
            {top:195, left:40,type:"Waveform",default:0,max:3,min:0,step:1,stepping:true},
        ],
        node: {
            id: "oscillator",
            params: createOscillatorParams("sine",0.5,0,0,0,0,0)
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
        modifiableproperties: [
            {bottom:-10,left:60,type:"Gain",default:0.5,max:1,min:0,stepping:false},
        ],
        node: {
            id: "audioendnode",
            params: createAudioEndNodeParams(0.5)
        }
    }
}

export function defaultCompressorNode():RoutableAudioNode { //TODO: Add attack and release!
    return{
        type: "Compressor",
        name: "Default Compressor",
        id: undefined,
        x: 0,
        y: 0,
        height: 50,
        width: 100,
        connectionpoints: [
            {bottom:-10, left:40, id:"in", type:""},
            {top:-10, left:40, id:"out", type:""},
        ],
        modifiableproperties: [
            {bottom:-10,left:0,type:"Threshold",default:-30,max:0,min:-100,stepping:false},
            {bottom:-10,left:80,type:"Ratio",default:3,max:10,min:1,stepping:false},
        ],
        node: {
            id: "compressor",
            params: createCompressorNodeParams(-30,3)
        }
    }
}
