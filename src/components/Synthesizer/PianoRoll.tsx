import React from "react";
import Note from "./Note";

export default function PianoRoll() {
    //Freq = note x 2^(N/12)
    function genLookupTable(){
        let map = new Map()
        const root = {name:"A4", freq:440};
        for (let index = 0; index < 12*8; index++) {
            let value:number = root.freq;
            value = 440.0 * (2**(index/12.0));

            let key:string = ""+index/12+"(";+value+")"
            map.set(key, value);
        }

        return map;
    }

    const freqLookupTable = new Map([
        /*["C4",261.626],
        ["C#4",277.183],
        ["D4",293.665],
        ["D#4",311.127],
        ["E4",329.628],
        ["F4",349.228],
        ["F#4",369.994],
        ["G4",391.995],
        ["G#4",415.305],
        ["A4",440.000],
        ["A#4",466.164],
        ["B4",493.883],
        ["C5",523.251],
        ["C#5",554.365],
        ["D5",587.330]*/
    ]); 
    return <ul>
        {Array.from(freqLookupTable).map(([key, value]) => 
        <li>
            <Note frequency={value} keyName={key}></Note>
        </li>
    )}
    </ul>
}
