import { CompressorNode, CompressorNodeParams, createCompressorNode } from "@models/synth/compressornode";
import { AdvancedAudioNode, AdvancedAudioNodeParams, Synth } from "../model/synth";
import { createAudioEndNode, AudioEndNodeParams, AudioEndNode } from "../model/synth/audioendnode";
import { AdvancedOscillator, createAdvancedOscillator, OscillatorParams } from "../model/synth/oscillatorParams";
import { AudioNodeType } from "@models/synth/audionode";
import { ModType } from "@models/synth/modRoM";

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
            else if(value.node.id == "compressor"){
                let comp = createCompressorNode(value.node.params as CompressorNodeParams);

                synth.activeAudioNodes[freq][key] = comp;
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

    export function changeValue(synth: Synth, nodetype: AudioNodeType, modtype: ModType, value: number, nodeId: string){
        //TODO: Implement (don't forget to change the active audionodes too!!!)

        let node:AdvancedAudioNodeParams = {};
        let allActive = synth.activeAudioNodes;
        let active:{[id:string]:AdvancedAudioNode} = {};

        switch (nodetype) {
            case "Oscillator":
                node = (synth.audioNodes[nodeId].node.params as OscillatorParams);
                break;
        
            case "AudioEndNode":
                node = (synth.audioNodes[nodeId].node.params as AudioEndNodeParams);
                break;
        
            case "Compressor":
                node = (synth.audioNodes[nodeId].node.params as CompressorNodeParams);
                break;
            
            case "Envelope":
                node = {}; //TODO: Implement
                break;
                
            default:
                break;
        }

        changeParam(node,modtype,value);


        console.log("HEY DEV, you are trying to change the value of: "+nodeId+"("+nodetype+")"+" on "+modtype+" to "+value);
    }

    function changeParam(node:AdvancedAudioNodeParams, modtype: ModType, value: number){
        switch (modtype) {
            case "Detune":
                if("detune" in node){
                    node.detune = value;
                }
                break;

            case "Gain":
                if("gain" in node){
                    node.gain = value;
                }
                break;

            case "Pan":
                if("pan" in node){
                    node.pan = value;
                }
                break;

            case "Phase":
                if("phase" in node){
                    node.phase = value;
                }
                break;

            case "Ratio":
                if("ratio" in node){
                    node.ratio = value;
                }
                break;

            case "Threshold":
                if("threshold" in node){
                    node.threshold = value;
                }
                break;

            case "Unison":
                if("unison" in node){
                    node.unison = value;
                }
                break;

            case "Waveform":
                if("waveform" in node){
                    switch (value) {
                        case 0:
                            node.waveform = "sine"
                            break;
                        
                        case 1:
                            node.waveform = "square"
                            break;
                        
                        case 2:
                            node.waveform = "triangle"
                            break;
                        //TODO: Add all
                        default:
                            console.error("ERROR: node.waveform was set to an unkown value");
                            break;
                    }

                }
                break;

            default://TODO: Add all
                break;
        }
    }
}