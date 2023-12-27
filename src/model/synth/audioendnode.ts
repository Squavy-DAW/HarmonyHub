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
    outGain.gain.setValueAtTime(1, ctx.currentTime);
    outGain.connect(ctx.destination);
    
    return {
        params: params,
        out: outGain,
        connect: (_node: AdvancedAudioNode) => void 0,
        disconnect: () => void 0
    };
}