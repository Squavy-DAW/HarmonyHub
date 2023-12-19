import { AdvancedOscillator, OscillatorParams, createAdvancedOscillator, createOscillatorParams } from "@src/synth/oscillatorParams"
import { ADSREnvelope, createADSREnvelope } from "./envelope";
import { ModRoM, createModRoM } from "./modRoM";
import RoutableAudioNode from "@models/audionode";
import { AudioEndNodeParams, createAudioEndNode } from "./audioEndNode"; 

//base interface for advanced nodes
export interface AdvancedAudioNode{
    out:AudioNode,
    connect:(node:AdvancedAudioNode) => void,
    disconnect:() => void,
}
//this interface includes the set of items in the synth. Things like oscillators, that need to be created are stored as values and only created 
//on demand, while things like envelopes or effects, that are custom made are stored as are. This interfaces purpose is to give them the same "appearance" in code, 
//as they are effectively the same and just need to be treated differently on sound creation. 
export interface AdvancedAudioNodeParams{}

//the object that exists in the context
export interface Synth{ //TODO: Use immer and usestate, whenever values from the synth are changed from outside.
    //audionode pool
    audioNodes:{[id:string]:RoutableAudioNode};
    activeAudioNodes:{[freq:number]:{[id:string]:AdvancedAudioNode}};

    //AudioNode routing
    routes:ModRoM;

    init:() => void;    //initializes the Synth
    start:(freq:number, ctx:AudioContext) => void;
    stop:(freq:number) => void;
}

let audioNodes:{[id:string]:RoutableAudioNode} = {};
let activeAudioNodes:{[freq:number]:{[id:string]:AdvancedAudioNode}} = {};
let routes = createModRoM();

function init(){
    //TODO: Implement
}

function start(freq:number, ctx:AudioContext){

    //TODO: Implement
    console.error(audioNodes);
    for(let key in audioNodes){
        let value = audioNodes[key];
        
        if(value.node.id == "oscillator"){
            let osc = createAdvancedOscillator(value.node.params as OscillatorParams, ctx);
            osc.osc().frequency.setValueAtTime(freq,ctx.currentTime);
            osc.osc().start();

            activeAudioNodes[freq] = {[key]:osc};
            console.error("OSC");
        }
        else if(value.node.id == "audioendnode"){
            let end = createAudioEndNode(value.node.params as AudioEndNodeParams, ctx);
            activeAudioNodes[freq] = {[key]:end};
            console.error("END");
        }
    }

    //do the routing
    let active = activeAudioNodes[freq];
    for(let id in routes.routes){
        //activeAudioNodes[freq][node].connect(e);
        let node = active[id];
        //routeTree(freq,id,node);
    }

    console.warn("HEY DEV, the Synth is playing the freq: "+freq);  //TEST
}

function routeTree(freq:number, id:string, node:AdvancedAudioNode){
    //route and connect recoursively
    let n = activeAudioNodes[freq][id];
}

function stop(freq:number){
    //TODO: Test
    for(let key in audioNodes){
        let value = audioNodes[key];
        let active = activeAudioNodes[freq][key] as AdvancedOscillator;
        
        if(value.node.id == "oscillator" && active !== undefined){
            active.osc().stop();
        }
    }
    activeAudioNodes = {};
    console.warn("HEY DEV, the Synth has stopped playing the freq: "+freq); //TEST
}

export function createSynth():Synth{
    return {
        audioNodes: audioNodes,
        activeAudioNodes: activeAudioNodes,
        routes: routes,
        init: init,
        start: start,
        stop: stop
    }
}
