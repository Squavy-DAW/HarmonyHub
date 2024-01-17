import { AdvancedAudioNode, AdvancedAudioNodeParams } from "../synth";
import { Gain, Oscillator, Panner } from "tone"

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
    pan:() => Panner
}
export function createAdvancedOscillator(
    params: OscillatorParams,
    ctx: AudioContext
): AdvancedOscillator{  //TODO: Make Unison Work!
    let osc = new Oscillator();
    osc.type = params.waveform;
    osc.detune.setValueAtTime(params.detune, ctx.currentTime);
    osc.phase = params.phaseOffset;
    
    let gain = new Gain();
    gain.gain.setValueAtTime(params.gain, ctx.currentTime);
    
    let pan = new Panner();
    pan.pan.setValueAtTime(params.pan, ctx.currentTime);


    osc.connect(pan);
    pan.connect(gain);

    function changeValue(type:string, value:number){
        switch (type) {
            case "Detune":
                osc.detune.linearRampToValueAtTime(value, ctx.currentTime+0.255);
                break;

            case "Gain":
                gain.gain.linearRampToValueAtTime(value, ctx.currentTime+0.255);
                break;
            
            case "Pan":
                pan.pan.linearRampToValueAtTime(value, ctx.currentTime+0.255);
                break;
                
            case "Phase":
                osc.phase = value;
                break;

            case "Waveform":
                switch (value) {
                    case 0:
                        osc.type = "sine"
                        break;
                    
                    case 1:
                        osc.type = "square"
                        break;
                    
                    case 2:
                        osc.type = "triangle"
                        break;
                    
                    case 3:
                        osc.type = "sawtooth"
                        break;
                    
                    //TODO: Add all
                    default:
                        console.error("ERROR: node.waveform was set to an unkown value");
                        break;
                }
                break;

            default:
                break;
        }
    }

    return {
        params: params,
        osc: ()=>{  //TODO: Warum function? Mach das weg, JETZT, HEUTE!!!
            return osc;
        },
        pan: ()=>{
            return pan;
        },
        connect: (node:AdvancedAudioNode)=>{
            gain.connect(node.out);
        },
        disconnect: ()=>{
            gain.disconnect();
        },
        out: gain,
        changeValue: changeValue
    }
}
