import React, { useEffect } from "react";
import Note from "./Note";
import { startFreq, stopFreq } from "@src/synth/engine";

export default function PianoRoll() {
    //Freq = note x 2^(N/12)
    const noteList = Array.from(genLookupTable()).sort(([,v1], [,v2])=> {
        return v2 - v1;
    });
    let mouseClicked = false;

    function genNoteName(idx:number){
        let arr = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
        return arr[idx%arr.length];
    }
    function genLookupTable(){
        let map = new Map<string,number>()
        const root = {name:"C0", freq:16.35};
        for (let index = 0; index < 12*8; index++) {
            let value:number = root.freq;
            value = root.freq * ((2**(1/12))**index);

            let key:string = Math.floor(index/12)+"-"+genNoteName(index)
            map.set(key, value);
        }

        return map;
    }

    function onMouseDown(){
        mouseClicked = true;
    }
    function onMouseUp(){
        mouseClicked = false;     
    }

    useEffect(()=>{
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        return ()=>{
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
        }
    });

    function onNoteStart(freq:number){
        if(mouseClicked)
            startFreq(freq);
    }
    function onNoteStop(freq:number){
        stopFreq(freq);
    }


    return <>
                <ul id="octaves">
                {noteList.map(([key, value]) => key.split("-")[1]=='C' && <li key={key+value+"octave"} className="octave">
                        {key.split("-")[0]}
                    </li>
                )}
                </ul>
                <ul id="keys">
                    {noteList.map(([key, value]) =>
                        <li key={key+value+"key"}>
                            <Note onMouseEnter={()=>onNoteStart(value)} onMouseLeave={()=>onNoteStop(value)} onMouseDown={()=>startFreq(value)} keyName={key.split("-")[1]}></Note>
                        </li>
                    )}
                </ul>
            </>
}
