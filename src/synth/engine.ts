import { AdvancedOscillator, OscillatorParams, setAdvancedOscillator, setOscillatorParams } from "@src/synth/oscillatorParams"
import { ADSREnvelope, createADSREnvelope } from "./envelope";

let ctx:AudioContext;

//creation pool
export let osc1Params:OscillatorParams;
export let osc2Params:OscillatorParams;
export let osc3Params:OscillatorParams;
export let osc1Envelope:ADSREnvelope;
export let osc2Envelope:ADSREnvelope;
export let osc3Envelope:ADSREnvelope;
export let activeOscillators = [];

//modulator pool


//base interface for advanced nodes
export interface AdvancedAudioNode{
    out:AudioNode,
    connect:(node:AdvancedAudioNode) => void,
    disconnect:() => void,
}


export function init(){
    //Initialize oscillators
    osc1Params = setOscillatorParams("sine",1,0,0,0,0,0);
    osc2Params = setOscillatorParams("sine",1,0,0,0,0,0);
    osc3Params = setOscillatorParams("sine",1,0,0,0,0,0);
    osc1Envelope = createADSREnvelope(ctx,0.1,1,0.3,0.5,3,0.2,0.1);
    osc2Envelope = createADSREnvelope(ctx,0.1,1,0.3,0.5,3,0.2,0.1);
    osc3Envelope = createADSREnvelope(ctx,0.1,1,0.3,0.5,3,0.2,0.1);
}


//TODO: Make work...
//start/stop
export function start(freq:number, oscParams:OscillatorParams, envelope:ADSREnvelope){
    let osc = setAdvancedOscillator(oscParams, ctx);
    osc.osc().frequency.setValueAtTime(freq, ctx.currentTime);  //set the frequency
    osc.connect(envelope);
    envelope.out.connect(ctx.destination);
    osc.osc().start();
    envelope.trigger();

}

export function stop(freq:number, oscParams:OscillatorParams, envelope:ADSREnvelope){
    let osc = setAdvancedOscillator(oscParams, ctx);
    envelope.stop();
}