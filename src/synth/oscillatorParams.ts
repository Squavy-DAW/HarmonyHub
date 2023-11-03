//the configurable params of an oscillator
export interface OscillatorParams{
    waveform:string,            // basic types or custom
    gain:number,                // the loudness modifier of the oscillator
    pan:number,                 // -1 to 1
    detune:number,              // -1200 to 1200 cents
    phaseOffset:number,         // 0% to 100% of the wave (start to end of a period)
    unisonNumber:number,        // 0-16, how many voices of unison the oscillator has
    unisonPercentage:number,    // 0% to 100%, how far apart the voices of unison are (if even, the middle one is let out.)
}

export function setOscillatorParams(
    waveform:string, 
    gain:number, 
    pan:number, 
    detune:number, 
    phaseOffset:number, 
    unisonNumber:number, 
    unisonPercentage:number
    ): OscillatorParams { 
    //TODO: Check for bounds and floor/ceil the values
    return {
        waveform: waveform,
        gain: gain,
        pan: pan,
        detune: detune,
        phaseOffset: phaseOffset,
        unisonNumber: unisonNumber,
        unisonPercentage: unisonPercentage
    };
}

export interface AdvancedOscillator{
    params: OscillatorParams,
    start:() => OscillatorNode,
    stop:() => OscillatorNode,
    connect:(audioNode:AudioNode) => OscillatorNode,
    disconnect:() => OscillatorNode
}
export function setAdvancedOscillator(
    params: OscillatorParams,
    ctx: AudioContext
): AdvancedOscillator{  //TODO: Take another look at this one
    let osc = new OscillatorNode(ctx);
    let oscGain = new GainNode(ctx);    //TODO: Implement
    let oscPan = new PannerNode(ctx);   //TODO: Implement
    //TODO: Configure the oscillator accordingly
    return {
        params: params,
        start: ()=>{
            osc.start();
            return osc;
        },
        stop: ()=>{
            osc.stop();
            return osc;
        },
        connect: (audioNode:AudioNode)=>{
            osc.connect(audioNode);
            return osc;
        },
        disconnect: ()=>{
            osc.disconnect();
            return osc;
        }
    }
}