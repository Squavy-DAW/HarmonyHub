import { AdvancedAudioNode } from "./engine";

export interface ADSREnvelope extends AdvancedAudioNode{
    attackTime:number,
    attackValue:number,
    decayTime:number,
    decayValue:number,
    sustainTime:number,
    sustainValue:number,
    releaseTime:number,
    trigger:() => void,
    stop:() => void
}


export function createADSREnvelope(
    ctx:AudioContext,
    attackTime:number,
    attackValue:number,
    decayTime:number,
    decayValue:number,
    sustainTime:number,
    sustainValue:number,
    releaseTime:number
    ):ADSREnvelope {
    let outGain = ctx.createGain();
    outGain.gain.setValueAtTime(0, ctx.currentTime);
    function triggerEnv(){
        let now = ctx.currentTime;
        outGain.gain.cancelScheduledValues(0);
        outGain.gain.setValueAtTime(0, now);
        outGain.gain.linearRampToValueAtTime(attackValue, now + attackTime);                                    //attack
        outGain.gain.linearRampToValueAtTime(decayValue, now + attackTime + decayTime);                         //decay
        outGain.gain.linearRampToValueAtTime(sustainValue, now + attackTime + decayTime + sustainTime);         //sustain
    };

    function stopEnv(){
        let now = ctx.currentTime;
        outGain.gain.cancelScheduledValues(0);
        outGain.gain.setValueAtTime(outGain.gain.value, now);
        outGain.gain.linearRampToValueAtTime(0, now + releaseTime);      //release
    }
    
    
    let envelope:ADSREnvelope = {
        attackTime: attackTime,
        attackValue: attackValue,
        decayTime: decayTime,
        decayValue: decayValue,
        sustainTime: sustainTime,
        sustainValue: sustainValue,
        releaseTime: releaseTime,
        trigger: triggerEnv,
        stop: stopEnv,
        out: outGain,
        connect(node: AdvancedAudioNode){
            outGain.connect(node.out);
        },
        disconnect(){
            outGain.disconnect();
        }
    }
  
    return envelope;
}