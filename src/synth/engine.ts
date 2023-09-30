const AudioContext = window.AudioContext;   //legacy Browsers

const ctx = new AudioContext();
const osc = ctx.createOscillator();
const master = ctx.createGain();
osc.connect(master);
master.connect(ctx.destination);

export async function setFreq(gain:number, freq:number) {
    osc.frequency.value = freq;
    master.gain.value = gain;
}

