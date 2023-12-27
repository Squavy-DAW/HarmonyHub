import { AdvancedAudioNode, AdvancedAudioNodeParams } from "../synth";
import { Gain, Oscillator, Panner, Signal } from "tone"

//the configurable params of an oscillator
export interface OscillatorParams extends AdvancedAudioNodeParams{
    waveform:OscillatorType,    // basic types or custom
    gain:number,                // the loudness modifier of the oscillator
    pan:number,                 // -1 to 1
    detune:number,       // -1200 to 1200 cents
    phaseOffset:number,         // 0 to 360 of the wave (start to end of a period)
    unisonNumber:number,        // 0-16, how many voices of unison the oscillator has
    unisonPercentage:number,    // 0% to 100%, how far apart the voices of unison are (if even, the middle one is let out.)
}

export function createOscillatorParams(
    waveform:OscillatorType, 
    gain:number, 
    pan:number, 
    detune:number, 
    phaseOffset:number, 
    unisonNumber:number, 
    unisonPercentage:number
    ): OscillatorParams { 
    //TODO: Check for bounds and floor/ceil the values
    return {
        waveform: waveform,
        gain: gain,
        pan: pan,
        detune: detune,
        phaseOffset: phaseOffset,
        unisonNumber: unisonNumber,
        unisonPercentage: unisonPercentage
    };
}

export interface AdvancedOscillator extends AdvancedAudioNode{
    params: OscillatorParams,
    osc:() => Oscillator,
    pan:() => Panner,
    gain:() => GainNode
}
export function createAdvancedOscillator(
    params: OscillatorParams,
    ctx: AudioContext
): AdvancedOscillator{  //TODO: Make Unison Work!
    let osc = new Oscillator();
    osc.type = params.waveform;
    osc.detune.setValueAtTime(params.detune, ctx.currentTime);
    osc.phase = params.phaseOffset;
    
    let gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    
    let pan = new Panner();
    pan.pan.setValueAtTime(0, ctx.currentTime);


    osc.connect(pan);
    pan.connect(gain);

    return {
        params: params,
        osc: ()=>{
            return osc;
        },
        pan: ()=>{
            return pan;
        },
        gain: ()=>{
            return gain;
        },
        connect: (node:AdvancedAudioNode)=>{
            gain.connect(node.out);
        },
        disconnect: ()=>{
            gain.disconnect();
        },
        out: gain
    }
}
