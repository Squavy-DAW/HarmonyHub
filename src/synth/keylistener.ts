import { startFreq, stopFreq } from "@src/synth/engineOLD";

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
let octave = 4;
export var pressedFrequencies:number[] = [];    //freqs pressed by keyboard
export var clickedFreq: { value: number | null } = { value: null }; // freq clicked by mouse


export function onKeyPressed(event:KeyboardEvent){
    let oct = octMap.indexOf(event.code)%8
    if(oct != -1){
        let octaveElement = document.querySelector(".base-octave");
        octaveElement?.classList.remove("base-octave");
        octave = oct;
        //TODO: Change all already pressed keys (and mouse-input!) accordingly to the desired octave-switch (IMPORTANT)
        let octaves = document.querySelectorAll(".octave");
        octaves.forEach(element => {
            if(element.innerHTML == oct.toString()){
                element.classList.add("base-octave");
            }
        });
    }

    let freq = keyMap.get(octave+"-"+event.code);
    if(freq !== undefined && !pressedFrequencies.includes(freq)){
        pressedFrequencies.push(freq);
        // console.warn(clickedFreq.value);
        if(clickedFreq.value!=freq){
            startFreq(freq);
            // add class
            let note = document.getElementById("freq:"+freq);
            if(note?.classList[0]=="black-key"){
                note.classList.add("pressed-black");
            }
            else{
                note?.classList.add("pressed-white");
            }
        }
    }
}
export function onKeyUp(event:KeyboardEvent){
    let freq = keyMap.get(octave+"-"+event.code);
    if(freq !== undefined && pressedFrequencies.includes(freq)){
        // console.warn(clickedFreq.value);
        if(clickedFreq.value!=freq){
            stopFreq(freq);
            //remove class
            let note = document.getElementById("freq:"+freq);
            if(note?.classList[0]=="black-key"){
                note.classList.remove("pressed-black");
            }
            else{
                note?.classList.remove("pressed-white");
            }
        }
        pressedFrequencies = pressedFrequencies.filter(num => num !== freq);
    }
}