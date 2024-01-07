import { useContext, useEffect, useRef, useState } from "react";
import Key from "./Key";
import { clickedFreq, onKeyPressed, onKeyUp, pressedFrequencies } from "@synth/keylistener";
import { AudioEngine } from "@synth/audioengine";
import SoundContext from "@src/context/soundcontext";
import ProjectContext from "@src/context/projectcontext";
import { produce } from "immer"
import '@styles/Piano.css';


export default function Piano(props:{trackId: string}){

    const { ctx } = useContext(SoundContext);
    const { project, setProject } = useContext(ProjectContext);

    const [mouseDown, setMouseDown] = useState(false);
    const _mouseDown = useRef(mouseDown);

    function onMouseDown() {
        _mouseDown.current = true;
        setMouseDown(true);
    }
    function onMouseUp() {
        _mouseDown.current = false;
        setMouseDown(false);
    }

    useEffect(() => {
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("keydown", onKeyPressed);
        document.addEventListener("keyup", onKeyUp);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("keydown", onKeyPressed);
            document.removeEventListener("keyup", onKeyUp);
        }
    }, []);
    
    //Freq = note x 2^(N/12)
    const noteList = Array.from(genLookupTable()).sort(([, v1], [, v2]) => v2 - v1);
    
    function genNoteName(idx: number) {
        let arr = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        return arr[idx % arr.length];
    }
    
    function genLookupTable() {
        let map = new Map<string, number>()
        const root = { name: "C0", freq: 16.35 };
        for (let index = 0; index < 12 * 8; index++) {
            let value: number = root.freq;
            value = root.freq * ((2 ** (1 / 12)) ** index);
    
            let key: string = Math.floor(index / 12) + "-" + genNoteName(index)
            map.set(key, value);
        }
    
        return map;
    }
    
    function onNoteStart(e: React.MouseEvent, freq: number, key: string) {
        e.preventDefault();
    
        if (_mouseDown.current) {
            clickedFreq.value = freq;
            // console.warn(clickedFreq.value);
            if (!pressedFrequencies.includes(freq)) {
                setProject(produce(draft => {
                    const synth = draft.data.tracks[props.trackId].instrument;
                    AudioEngine.start(synth,freq,ctx);
                }));
                if (key.includes('#')) {
                    e.currentTarget.classList.add("pressed-black");
                }
                else {
                    e.currentTarget.classList.add("pressed-white");
                }
            }
        }
    }
    
    function onNoteStop(e: React.MouseEvent, freq: number, key: string) {
        e.preventDefault();
        if (!pressedFrequencies.includes(freq)) {
            if (key.includes('#')) {
                e.currentTarget.classList.remove("pressed-black");
            }
            else {
                e.currentTarget.classList.remove("pressed-white");
            }
            setProject(produce(draft => {
                const synth = draft.data.tracks[props.trackId].instrument;
                AudioEngine.stop(synth,freq);
            }));
        }
        clickedFreq.value = null;
        // console.warn(clickedFreq.value);
    }

    return <div className="piano">
        <ul className="octaves">
            {noteList.map(([key, value]) => key.split("-")[1] == 'C' && <li key={key + value + "octave"} className={"octave " + (key.split("-")[0] == '4' ? "base-octave" : "")}>
                {key.split("-")[0]}
            </li>
            )}
        </ul>
        <ul className="keys">
            {noteList.map(([key, value]) =>
                <li key={key + value + "key"}>
                    <Key
                        onMouseEnter={(e: React.MouseEvent) => onNoteStart(e, value, key)}
                        onMouseLeave={(e: React.MouseEvent) => onNoteStop(e, value, key)}
                        onMouseDown={(e: React.MouseEvent) => {
                            clickedFreq.value = value;
                            if (!pressedFrequencies.includes(value)) {
                                setProject(produce(draft => {
                                    const synth = draft.data.tracks[props.trackId].instrument;
                                    AudioEngine.start(synth,value,ctx);
                                }));
                                e.currentTarget.classList.add(key.includes('#') ? "pressed-black" : "pressed-white");
                            }
                        }}
                        keyName={key.split("-")[1]}
                        frequency={value} />
                </li>
            )}
        </ul>
    </div>
}
