import React from "react";
import Note from "./Note";

export default function PianoRoll() {
    //Freq = note x 2^(N/12)
    const noteList = Array.from(genLookupTable()).sort(([k1,v1], [k2,v2])=> {
        return v1 - v2;
    });

    function genNoteName(idx:number){
        let arr = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","B#"];
        return arr[idx%arr.length];
    }
    function genLookupTable(){
        let map = new Map<string,number>()
        const root = {name:"C0", freq:16.35};
        for (let index = 0; index < 12*8; index++) {
            let value:number = root.freq;
            value = root.freq * (2**(index/12.0));

            let key:string = Math.floor(index/12)+genNoteName(index)
            console.log(Math.floor(index/12)+genNoteName(index)+ " -> "+value)
            map.set(key, value);
        }

        return map;
    }


    return <div className="scroll">
        <ul>
            {noteList.map(([key, value]) =>
                <li>
                    <Note frequency={value} keyName={key}></Note>
                </li>
            )}
        </ul>
    </div>
}
