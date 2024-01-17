import { AdvancedAudioNode, AdvancedAudioNodeParams } from "../synth";
import { Gain } from "tone";

export interface AudioEndNodeParams extends AdvancedAudioNodeParams{
    gain:number
}

export interface AudioEndNode extends AdvancedAudioNode{
    params:AudioEndNodeParams
}

export function createAudioEndNodeParams(gain:number):AudioEndNodeParams{
    return {
        gain: gain
    };
}

export function createAudioEndNode(
    params: AudioEndNodeParams,
    ctx: AudioContext
    ):AudioEndNode {
    let outGain = new Gain();
    outGain.gain.setValueAtTime(params.gain, ctx.currentTime);
    outGain.connect(ctx.destination);

    function changeValue(type:string, value:number){
        switch (type) {
            case "Gain":
                console.error(ctx.currentTime);
                outGain.gain.linearRampToValueAtTime(value, ctx.currentTime+0.255);
                break;
        
            default:
                break;
        }
    }
    
    return {
        params: params,
        out: outGain,
        connect: (_node: AdvancedAudioNode) => void 0,
        disconnect: () => void 0,
        changeValue: changeValue
    };
}