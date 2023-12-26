import { AdvancedAudioNode, AdvancedAudioNodeParams } from "../model/synth";

export type Waveform = "Sine" | "Pulse" | "Saw" | "Triangle" | "Noise";

//the configurable params of an oscillator
export interface OscillatorParams extends AdvancedAudioNodeParams{
    waveform:string,            // basic types or custom
    gain:number,                // the loudness modifier of the oscillator
    pan:number,                 // -1 to 1
    detune:number,              // -1200 to 1200 cents
    phaseOffset:number,         // 0% to 100% of the wave (start to end of a period)
    unisonNumber:number,        // 0-16, how many voices of unison the oscillator has
    unisonPercentage:number,    // 0% to 100%, how far apart the voices of unison are (if even, the middle one is let out.)
}

export function createOscillatorParams(
    waveform:Waveform, 
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
    osc:() => OscillatorNode
}
export function createAdvancedOscillator(
    params: OscillatorParams,
    ctx: AudioContext
): AdvancedOscillator{  //TODO: Take another look at this one
    let osc = ctx.createOscillator();
    let oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.5, ctx.currentTime);

    let oscPan = ctx.createStereoPanner();   //TODO: Implement

    //TODO: Configure the oscillator accordingly

    //The following two lines of code are temporary and should be adjusted/removed accordingly
    osc.type= "sine";
    osc.connect(oscGain);

    return {
        params: params,
        osc: ()=>{
            return osc;
        },
        connect: (node:AdvancedAudioNode)=>{
            oscGain.connect(node.out);
        },
        disconnect: ()=>{
            oscGain.disconnect();
        },
        out: oscGain
    }
}
