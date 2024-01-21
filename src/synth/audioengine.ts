import { CompressorNodeParams, createCompressorNode } from "@models/synth/compressornode";
import { AdvancedAudioNode, AdvancedAudioNodeParams, Synth } from "../model/synth";
import { createAudioEndNode, AudioEndNodeParams } from "../model/synth/audioendnode";
import { AdvancedOscillator, createAdvancedOscillator, OscillatorParams } from "../model/synth/oscillatorParams";
import { AudioNodeType } from "@models/synth/audionode";
import { ModType } from "@models/synth/modRoM";
import { EnvelopeNode, EnvelopeNodeParams, createEnvelopeNode } from "@models/synth/envelope";
import { Transport } from "tone";

export namespace AudioEngine {
    let activeAudioNodes: {[synthId:string]:{[freq:number]:{[id:string]:AdvancedAudioNode}[]}};

    export function init(){
        //TODO: Implement
        Transport.start();
        activeAudioNodes = {};
    }

    export function start(synth:Synth, trackId:string, freq:number, ctx:AudioContext){ 
        //TODO: Expand whenever necessary

        if(!activeAudioNodes[trackId])
            activeAudioNodes[trackId] = {};
        if(!activeAudioNodes[trackId][freq])
            activeAudioNodes[trackId][freq] = [];
        activeAudioNodes[trackId][freq].push({});

        for(let key in synth.audioNodes){
            let value = synth.audioNodes[key];
            
            if(value.node.id == "oscillator"){
                let osc = createAdvancedOscillator(value.node.params as OscillatorParams, ctx);
                osc.osc().frequency.setValueAtTime(freq,ctx.currentTime);
                osc.osc().start();

                activeAudioNodes[trackId][freq][activeAudioNodes[trackId][freq].length-1][key] = osc;
            }
            else if(value.node.id == "audioendnode"){
                let end = createAudioEndNode(value.node.params as AudioEndNodeParams, ctx);

                activeAudioNodes[trackId][freq][activeAudioNodes[trackId][freq].length-1][key] = end;
            }
            else if(value.node.id == "compressor"){
                let comp = createCompressorNode(value.node.params as CompressorNodeParams, ctx);

                activeAudioNodes[trackId][freq][activeAudioNodes[trackId][freq].length-1][key] = comp;
            }
            else if(value.node.id == "envelope"){
                let envelope = createEnvelopeNode(value.node.params as EnvelopeNodeParams, ctx);
                envelope.start();

                activeAudioNodes[trackId][freq][activeAudioNodes[trackId][freq].length-1][key] = envelope;
            }
        }
        //do the routing
        routeTree(synth, trackId, freq,activeAudioNodes[trackId][freq].length-1);
    }

    export function routeTree(synth: Synth, trackId:string, freq:number, idx:number){
        let active = activeAudioNodes[trackId][freq][idx];

        //console.warn({...active});

        let nodes = synth.routes.routes;
        for(let parent in nodes){
            let parentNode = nodes[parent];
            for(let child in parentNode.children){
                if(active[parent] && active[child]){
                        active[parent].connect(active[child]);
                    //console.warn("routed: "+parent+" into "+child);
                }
                else{
                    console.error("failed routing: "+parent+" into "+child+" at index"+idx);
                }
            }
        }
    }

    function getChildren():AdvancedAudioNode[]{
        //TODO: Implement, if needed. Look at Problem one before rushing things =)
        return [];
    }

    export function stop(synth: Synth, trackId:string, freq:number){
        //TODO: Expand whenever necessary
        //TODO: If there is an envelope, one can't just stop the oscillator, but needs to run through the envelopes release and stop the oscillator AFTER
        if(!activeAudioNodes[trackId] || !activeAudioNodes[trackId][freq] || activeAudioNodes[trackId][freq].length === 0)
            return;

        let nodes = synth.audioNodes;
        let longestRelease = 0;
        let active = activeAudioNodes[trackId][freq][0];

        for(let node in nodes){
            if(nodes[node].type == "Envelope" && active[node]){
                (active[node] as EnvelopeNode).stop();
                let release = (active[node] as EnvelopeNode).params.release;
                longestRelease = release>longestRelease? release : longestRelease;
            }
        }
        
        Transport.schedule(function(time){
            if(!activeAudioNodes[trackId] || !activeAudioNodes[trackId][freq])
                return;
            for(let node in nodes){
                if(nodes[node].type == "Oscillator" && active[node]){
                    (active[node] as AdvancedOscillator).osc().stop();
                    delete active[node];
                }
            }
        }, Transport.immediate() + longestRelease);
        activeAudioNodes[trackId][freq].shift();
    }

    export function changeValue(synth: Synth, trackId:string, nodetype: AudioNodeType, modtype: ModType, value: number, nodeId: string){
        //TODO: Implement (don't forget to change the active audionodes too!!!)

        let node:AdvancedAudioNodeParams = {};
        let allActive:AdvancedAudioNode[] = [];

        if(!activeAudioNodes[trackId])
            activeAudioNodes[trackId] = {};

        Object.entries(activeAudioNodes[trackId]).forEach(([,value]) => {
            value.forEach(e => {
                allActive.push(e[nodeId]);
            });
        });

        switch (nodetype) {
            case "Oscillator":
                node = (synth.audioNodes[nodeId].node.params as OscillatorParams);
                changeParam(node,modtype,value,allActive);
                break;
        
            case "AudioEndNode":
                node = (synth.audioNodes[nodeId].node.params as AudioEndNodeParams);
                changeParam(node,modtype,value,allActive);
                break;
        
            case "Compressor":
                node = (synth.audioNodes[nodeId].node.params as CompressorNodeParams);
                changeParam(node,modtype,value,allActive);
                break;
            
            case "Envelope":
                //TODO: Implement
                break;
                
            default:
                break;
        }


        //console.log("HEY DEV, you are trying to change the value of: "+nodeId+"("+nodetype+")"+" on "+modtype+" to "+value);
    }

    function changeParam(node:AdvancedAudioNodeParams, modtype: ModType, value: number, audioNodes:AdvancedAudioNode[]){
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
                        
                        case 3:
                            node.waveform = "sawtooth"
                            break;
                        
                        default:
                            console.error("ERROR: node.waveform was set to an unkown value");
                            break;
                    }

                }
                break;

            default://TODO: Add all
                break;
        }
        audioNodes.forEach(n => {
            if(n)
                n.changeValue(modtype, value);
        });
    }
}