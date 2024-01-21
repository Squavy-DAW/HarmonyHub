import { AdvancedAudioNode, AdvancedAudioNodeParams } from "../synth";
import { AmplitudeEnvelope, Envelope } from "tone";

export interface EnvelopeNodeParams extends AdvancedAudioNodeParams{
    attack:number,
    decay:number,
    sustain:number,
    release:number
}

export interface EnvelopeNode extends AdvancedAudioNode{
    params:EnvelopeNodeParams,
    start:()=>void,
    stop:()=>void
}

export function createEnvelopeNodeParams(attack:number,decay:number,sustain:number,release:number):EnvelopeNodeParams{    //TODO: Add attack and release (how did i forget that?) xD
    return {
        attack:attack,
        decay:decay,
        sustain:sustain,
        release:release
    };
}

export function createEnvelopeNode(
    params: EnvelopeNodeParams,
    ctx: AudioContext
    ):EnvelopeNode {
        let envelope = new AmplitudeEnvelope(params);

        function changeValue(type:string, value:number){
            switch (type) {
                case "Attack":
                    envelope.set({
                        attack: value
                    });
                    break;

                case "Decay":
                    envelope.set({
                        decay: value
                    });
                    break;

                case "Sustain":
                    envelope.set({
                        sustain: value
                    });
                    break;

                case "Release":
                    envelope.set({
                        release: value
                    });
                    break;
            
                default:
                    break;
            }
        }

    return {
        params: params,
        out: envelope,
        connect: (node:AdvancedAudioNode)=>{
            envelope.connect(node.out);
        },
        disconnect: ()=>{
            envelope.disconnect();
        },
        start: ()=>{
            envelope.triggerAttack();
        },
        stop: ()=>{
            envelope.triggerRelease();
        },
        changeValue: changeValue
    };
}