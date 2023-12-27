import { Oscillator } from "tone";
import { Synth } from "../model/synth";
import { createAudioEndNode, AudioEndNodeParams } from "../model/synth/audioendnode";
import { AdvancedOscillator, createAdvancedOscillator, OscillatorParams } from "../model/synth/oscillatorParams";

export namespace AudioEngine {
    export function init(){
        //TODO: Implement
    }

    export function start(synth:Synth, freq:number, ctx:AudioContext){ 
        //TODO: Expand whenever necessary

        synth.activeAudioNodes[freq] = {};

        for(let key in synth.audioNodes){
            let value = synth.audioNodes[key];
            
            if(value.node.id == "oscillator"){
                let osc = createAdvancedOscillator(value.node.params as OscillatorParams, ctx);
                osc.osc().frequency.setValueAtTime(freq,ctx.currentTime);
                osc.osc().start();

                synth.activeAudioNodes[freq][key] = osc;
            }
            else if(value.node.id == "audioendnode"){
                let end = createAudioEndNode(value.node.params as AudioEndNodeParams, ctx);

                synth.activeAudioNodes[freq][key] = end;
            }
        }
        //do the routing
        routeTree(synth, freq);

        console.warn("HEY DEV, the Synth is playing the freq: "+freq);  //TEST
    }

    export function routeTree(synth: Synth, freq:number){
        let active = synth.activeAudioNodes[freq];

        console.warn(active);

        let nodes = synth.routes.routes;
        for(let parent in nodes){
            let parentNode = nodes[parent];
            for(let child in parentNode.children){
                if(active[parent] && active[child]){
                    active[parent].connect(active[child]);
                    console.warn("routed: "+parent+" into "+child);
                }
                else{
                    console.error("failed routing: "+parent+" into "+child);
                }
            }
        }
    }

    export function stop(synth: Synth, freq:number){
        //TODO: Expand whenever necessary
        //TODO: If there is an envelope, one can't just stop the oscillator, but needs to run through the envelopes release and stop the oscillator AFTER
        
        let active = synth.activeAudioNodes[freq];

        let nodes = synth.audioNodes;
        for(let node in nodes){
            if(nodes[node].type == "Oscillator"){
                (active[node] as AdvancedOscillator).osc().stop();
            }
        }

        console.warn("HEY DEV, the Synth has stopped playing the freq: "+freq); //TEST
    }
}