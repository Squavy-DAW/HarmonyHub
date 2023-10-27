import { startFreq, stopFreq } from "@src/synth/engine";

function genKeyName(idx:number){
    let arr = ["KeyA","KeyW","KeyS","KeyE","KeyD","KeyF","KeyT","KeyG","KeyY","KeyH","KeyU","KeyJ"];
    return arr[idx%arr.length];
}

function genLookupTable(){
    let map = new Map<string,number>()
    const root = {name:"C0", freq:16.35};
    for (let index = 0; index < 12*8; index++) {
        let value:number = root.freq;
        value = root.freq * ((2**(1/12))**index);

        let key:string = Math.floor(index/12)+"-"+genKeyName(index)
        map.set(key, value);
    }

    return map;
}

const keyMap = genLookupTable();
const octMap = ["Digit1","Digit2","Digit3","Digit4","Digit5","Digit6","Digit7","Digit8","Numpad1","Numpad2","Numpad3","Numpad4","Numpad5","Numpad6","Numpad7","Numpad8"];
let octave = 3;


export function onKeyPressed(event:KeyboardEvent){
    let oct = octMap.indexOf(event.code)%8
    if(oct != -1)
        octave = oct;

    let freq = keyMap.get(octave+"-"+event.code);
    if(freq !== undefined)
        startFreq(freq);
}
export function onKeyUp(event:KeyboardEvent){
    let freq = keyMap.get(octave+"-"+event.code);
    if(freq !== undefined)
        stopFreq(freq);
}