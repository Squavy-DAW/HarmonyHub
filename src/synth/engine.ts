import { AdvancedOscillator, OscillatorParams, setAdvancedOscillator, setOscillatorParams } from "@src/synth/oscillatorParams"

var ctx:AudioContext;   //audiocontext

export function engine(){
    //Initialize oscillators
    let osc1Params = setOscillatorParams("",0,0,0,0,0,0);
    let osc2Params = setOscillatorParams("",0,0,0,0,0,0);
    let osc3Params = setOscillatorParams("",0,0,0,0,0,0);
    let osc1 = setAdvancedOscillator(osc1Params, ctx);
    
}