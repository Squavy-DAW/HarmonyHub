import { ModRoM, defaultModRoM } from "./synth/modRoM";
import RoutableAudioNode from "@models/synth/audionode";
import { ToneAudioNode } from "tone"
import LinePosition from "./synth/lineposition";

//base interface for advanced nodes
export interface AdvancedAudioNode{
    out:ToneAudioNode,
    connect:(node:AdvancedAudioNode) => void,
    disconnect:() => void,
    changeValue:(type:string, value:number) => void,
}
//this interface includes the set of items in the synth. Things like oscillators, that need to be created are stored as values and only created 
//on demand, while things like envelopes or effects, that are custom made are stored as are. This interfaces purpose is to give them the same "appearance" in code, 
//as they are effectively the same and just need to be treated differently on sound creation. 
export interface AdvancedAudioNodeParams{}

//the object that exists in the context
export interface Synth{ //TODO: Use immer and usestate, whenever values from the synth are changed from outside.
    //audionode pool
    audioNodes:{[id:string]:RoutableAudioNode};
    activeAudioNodes:{[freq:number]:{[id:string]:AdvancedAudioNode[]}};
    svgLines:{[id:string]:LinePosition}

    //AudioNode routing
    routes:ModRoM;
}

export const defaultSynth: Synth = {
    audioNodes: {},
    activeAudioNodes: {},
    routes: { ...defaultModRoM },
    svgLines: {}
}