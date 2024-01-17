import { AdvancedAudioNode, AdvancedAudioNodeParams } from "../synth";
import { Compressor } from "tone";

export interface CompressorNodeParams extends AdvancedAudioNodeParams{
    threshold:number,
    ratio:number
}

export interface CompressorNode extends AdvancedAudioNode{
    params:CompressorNodeParams
}

export function createCompressorNodeParams(threshold:number, ratio:number):CompressorNodeParams{    //TODO: Add attack and release (how did i forget that?) xD
    return {
        threshold: threshold,
        ratio: ratio
    };
}

export function createCompressorNode(
    params: CompressorNodeParams,
    ctx: AudioContext
    ):CompressorNode {
        let comp = new Compressor(params.threshold, params.ratio);

        function changeValue(type:string, value:number){
            switch (type) {
                case "Threshold":
                    comp.threshold.linearRampToValueAtTime(value, ctx.currentTime+0.255);
                    break;

                case "Ratio":
                    comp.ratio.linearRampToValueAtTime(value, ctx.currentTime+0.255);
                    break;
            
                default:
                    break;
            }
        }

    return {
        params: params,
        out: comp,
        connect: (node:AdvancedAudioNode)=>{
            comp.connect(node.out);
        },
        disconnect: ()=>{
            comp.disconnect();
        },
        changeValue: changeValue
    };
}