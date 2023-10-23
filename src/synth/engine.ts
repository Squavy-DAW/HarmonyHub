const AudioContext = window.AudioContext;   //legacy Browsers

var ctx:AudioContext;   //audiocontext

var osc1:OscillatorNode;    //oscillators
var osc2:OscillatorNode;
var osc3:OscillatorNode;

var osc1Gain:GainNode;  //volume of the oscillator (between 0 and 2)
var osc2Gain:GainNode;
var osc3Gain:GainNode;

var osc1Pan:StereoPannerNode; //pan of the oscillator (between -1 and 1)
var osc2Pan:StereoPannerNode;
var osc3Pan:StereoPannerNode;

var oscOnOFFNode:GainNode; //only used to start/stop the oscillators
var master:GainNode;    //general volume of the synthesizer

var osc1Pitch:number = 1;   //pitch of the oscillator (between 0.5 and 2)
var osc2Pitch:number = 1;
var osc3Pitch:number = 1;

var currFreq = 0;


export async function init() {
    ctx = ctx = new AudioContext();
    osc1 = ctx.createOscillator();
    osc2 = ctx.createOscillator();
    osc3 = ctx.createOscillator();
    osc1Gain = ctx.createGain();
    osc2Gain = ctx.createGain();
    osc3Gain = ctx.createGain();
    osc1Pan = ctx.createStereoPanner();
    osc2Pan = ctx.createStereoPanner();
    osc3Pan = ctx.createStereoPanner();
    oscOnOFFNode = ctx.createGain();
    master = ctx.createGain();

    osc1.connect(osc1Gain);
    osc2.connect(osc2Gain);
    osc3.connect(osc3Gain);

    osc1Gain.connect(osc1Pan);
    osc2Gain.connect(osc2Pan);
    osc3Gain.connect(osc3Pan);

    osc1Pan.connect(oscOnOFFNode);
    osc2Pan.connect(oscOnOFFNode);
    osc3Pan.connect(oscOnOFFNode);

    oscOnOFFNode.connect(master);

    master.connect(ctx.destination);

    master.gain.setValueAtTime(0.2, ctx.currentTime);
    osc1Gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc2Gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc3Gain.gain.setValueAtTime(0.1, ctx.currentTime);

    oscOnOFFNode.gain.setValueAtTime(0, ctx.currentTime);

    osc1.type = "sine";
    osc2.type = "sine";
    osc3.type = "sine";

    setFreq(261.63);   //frequency of a c4

    osc1.start();
    osc2.start();
    osc3.start();
}


export enum AudioNodes{
    Osc1,
    Osc2,
    Osc3,
    Master
}
export enum WaveForms{
    Sin,
    Saw,
    Triangle,
    Square,
    WhiteNoise  //TODO: Implement =)
}


function getOsc(node:AudioNodes){
    if(node==AudioNodes.Osc1)
        return osc1;
    else if(node==AudioNodes.Osc2)
        return osc2;
    else if(node==AudioNodes.Osc3){
        return osc3;
    }
    else return null;
}
function getGain(node:AudioNodes){
    if(node==AudioNodes.Osc1)
        return osc1Gain;
    else if(node==AudioNodes.Osc2)
        return osc2Gain;
    else if(node==AudioNodes.Osc3){
        return osc3Gain;
    }
    else{
        return master;
    }
}
function getPan(node:AudioNodes){
    if(node==AudioNodes.Osc1)
        return osc1Pan;
    else if(node==AudioNodes.Osc2)
        return osc2Pan;
    else if(node==AudioNodes.Osc3){
        return osc3Pan;
    }
    else{
        return null;
    }
}

//start of value tweaking
export async function setFreq(hz:number) {  //in Hertz
    currFreq = hz;
    osc1.frequency.value = hz*osc1Pitch;
    osc2.frequency.value = hz*osc2Pitch;
    osc3.frequency.value = hz*osc3Pitch;
}
export async function setGain(gain:number, node:AudioNodes) {
    getGain(node).gain.setValueAtTime(gain, ctx.currentTime);
}
export async function setWaveform(waveform:string, node:AudioNodes) {
    let oscillator = getOsc(node);
    if(oscillator != null)
        if(waveform == "sawtooth")
            oscillator.type = "sawtooth";
        else if(waveform == "sine")
            oscillator.type = "sine";
        else if(waveform == "square")
            oscillator.type = "square";
        else if(waveform == "triangle")
            oscillator.type = "triangle";
    console.log(waveform);
}
export async function setPan(pan:number, node:AudioNodes) {
    let panNode = getPan(node);
    if(panNode != null)
        panNode.pan.setValueAtTime(pan, ctx.currentTime);
}
export async function setDetone(cents:number, node:AudioNodes) {  //in Cents
    let oscillator = getOsc(node);
    if(oscillator != null)
        oscillator.detune.setValueAtTime(cents,ctx.currentTime);
}
export async function setPitch(pitch:number, node:AudioNodes) {
    let oscillator = getOsc(node);
    if(oscillator == osc1){
        osc1Pitch = pitch;
        let value = oscillator.frequency.value*osc1Pitch;
        value = fitValue(value);
        oscillator.frequency.setValueAtTime(value, ctx.currentTime);
    }
    else if(oscillator == osc2){
        osc2Pitch = pitch;
        let value = oscillator.frequency.value*osc2Pitch;
        value = fitValue(value);
        oscillator.frequency.setValueAtTime(value, ctx.currentTime);
    }
    else if(oscillator == osc3){
        osc3Pitch = pitch;
        let value = oscillator.frequency.value*osc3Pitch;
        value = fitValue(value);
        oscillator.frequency.setValueAtTime(value, ctx.currentTime);
    }
    console.log(currFreq);
    setFreq(currFreq);
}
function fitValue(value:number){
    if(value < -24000)
        return -24000;
    else if(value > 24000)
        return 24000;
    else
        return value;
}
//end of value tweaking


async function startOscillators() {
    oscOnOFFNode.gain.setValueAtTime(1,ctx.currentTime);
    console.log("started oscillators");
}
async function stopOscillators() {
    oscOnOFFNode.gain.setValueAtTime(0,ctx.currentTime);
    console.log("stopped oscillators");
}


export async function toggle() {
    if(oscOnOFFNode.gain.value == 0){
        startOscillators();
    }
    else{
        stopOscillators();
    }
}

export async function startFreq(freq:number) {
    setFreq(freq);
    startOscillators();
}
export async function stopFreq(freq:number) {
    stopOscillators();
}
