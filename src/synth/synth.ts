import { AdvancedOscillator, OscillatorParams, createAdvancedOscillator, createOscillatorParams } from "@src/synth/oscillatorParams"
import { ADSREnvelope, createADSREnvelope } from "./envelope";
import { ModRoM, createModRoM } from "./routeSelector";

let ctx:AudioContext;   //TODO: get this into the main context! 

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
export interface Synth{
    ctx:AudioContext    //set this to the general audio context on creation
    //audionode pool
    audioNodeParams:{id:string, params:AdvancedAudioNodeParams}[];  //make this list empty on creation
    activeAudioNodes:{id:string}[];    //make this list empty on creation
    //AudioNode routing
    routes:ModRoM;

    init:() => void;    //initializes the Synth
    start:(freq:number) => void;
    stop:(freq:number) => void;
}

export function createSynth(
    ctx:AudioContext
):Synth{

    function init(){
        //TODO: Implement
    }

    function start(freq:number){
        //TODO: Implement
        console.warn("HEY DEV, the Synth is playing the freq: "+freq);  //TEST
    }

    function stop(freq:number){
        //TODO: Implement
        console.warn("HEY DEV, the Synth has stopped playing the freq: "+freq); //TEST
    }

    return {
        ctx: ctx,
        audioNodeParams: [],
        activeAudioNodes: [],
        routes: createModRoM(),
        init: init,
        start: start,
        stop: stop
    }
}


















/*
//TODO: Remove comment once the Synth interface is implemented

//creation pool
export let oscillatorParams:{id:string, params:OscillatorParams}[];
export let activeOscillators:{id:string, params:OscillatorParams}[];
export let activeEnvelopes:ADSREnvelope[] = [];

//modulator pool


//AudioNode routing


export function init(){
    //Initialize oscillators
    let osc1 = {id:"osc1", params:setOscillatorParams("sine",1,0,0,0,0,0)};
    let osc2 = {id:"osc2", params:setOscillatorParams("sine",1,0,0,0,0,0)};
    let osc3 = {id:"osc3", params:setOscillatorParams("sine",1,0,0,0,0,0)};
    oscillatorParams.push(osc1);    
    oscillatorParams.push(osc2);
    oscillatorParams.push(osc3);
    let generalEnvelope = createADSREnvelope(ctx,0.1,1,0.3,0.5,3,0.2,0.1);
    activeEnvelopes.push(generalEnvelope);
}

//adds a new audioNode to the synth.
export function addAdvancedAudioNode(node:AdvancedAudioNode, id:string){
    
}


//TODO: Make work...
//start/stop
export function start(freq:number, oscId:string){
    let oscPreset = oscillatorParams.find(s => s.id==oscId);
    if(oscPreset===undefined)
        return;

    let osc = setAdvancedOscillator(oscPreset.params, ctx);
    osc.osc().frequency.setValueAtTime(freq, ctx.currentTime);  //set the frequency
    
    //osc.connect(envelope);
    //envelope.out.connect(ctx.destination);
    //osc.osc().start();
    //envelope.trigger();
}

export function stop(freq:number, oscParams:OscillatorParams){
    //let osc = setAdvancedOscillator(oscParams, ctx);
    //envelope.stop();
}
*/