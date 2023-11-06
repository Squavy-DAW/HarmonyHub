import { AdvancedOscillator, OscillatorParams, setAdvancedOscillator, setOscillatorParams } from "@src/synth/oscillatorParams"
import { ADSREnvelope, createADSREnvelope } from "./envelope";

let ctx:AudioContext;

//creation pool
export let oscillatorPresets:{id:string, params:OscillatorParams}[];
export let activeOscillators:{id:string, params:OscillatorParams}[];
export let activeEnvelopes:ADSREnvelope[] = [];

//modulator pool


//base interface for advanced nodes
export interface AdvancedAudioNode{
    out:AudioNode,
    connect:(node:AdvancedAudioNode) => void,
    disconnect:() => void,
}


export function init(){
    //Initialize oscillators
    let osc1 = {id:"osc1", params:setOscillatorParams("sine",1,0,0,0,0,0)};
    let osc2 = {id:"osc2", params:setOscillatorParams("sine",1,0,0,0,0,0)};
    let osc3 = {id:"osc3", params:setOscillatorParams("sine",1,0,0,0,0,0)};
    oscillatorPresets.push(osc1);
    oscillatorPresets.push(osc2);
    oscillatorPresets.push(osc3);
    let generalEnvelope = createADSREnvelope(ctx,0.1,1,0.3,0.5,3,0.2,0.1);
    activeEnvelopes.push(generalEnvelope);
}


//TODO: Make work...
//start/stop
export function start(freq:number, oscId:string){
    let oscPreset = oscillatorPresets.find(s => s.id==oscId);
    if(oscPreset===undefined)
        return;

    //let osc = setAdvancedOscillator(oscPreset, ctx);
    //osc.osc().frequency.setValueAtTime(freq, ctx.currentTime);  //set the frequency
    
    /*osc.connect(envelope);
    envelope.out.connect(ctx.destination);
    osc.osc().start();
    envelope.trigger();*/
}

export function stop(freq:number, oscParams:OscillatorParams){
    //let osc = setAdvancedOscillator(oscParams, ctx);
    //envelope.stop();
}
