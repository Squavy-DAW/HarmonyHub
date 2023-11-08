import React, { createRef, useContext, useEffect } from "react";
import Note from "./Note";
import { startFreq, stopFreq } from "@synth/engineOLD";
import "@styles/synthesizer/Synthesizer.css"
import { onKeyPressed, onKeyUp, pressedFrequencies, clickedFreq } from "@synth/keylistener"
import EditingPatternContext from "@src/context/editingpattern";

export default function PianoRoll() {

    const pianoRollRef = createRef<HTMLDivElement>();
    // const { editingPattern } = useContext(EditingPatternContext);

    //Freq = note x 2^(N/12)
    const noteList = Array.from(genLookupTable()).sort(([, v1], [, v2]) => {
        return v2 - v1;
    });

    let mouseClicked = false;

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

    function onMouseDown() {
        mouseClicked = true;
    }
    function onMouseUp() {
        mouseClicked = false;
    }

    useEffect(() => {
        pianoRollRef.current!.scrollTop = pianoRollRef.current!.children[0].clientHeight / 2 - pianoRollRef.current!.clientHeight * 0.8;
    }, [])

    useEffect(() => {
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("keydown", e => onKeyPressed(e));
        document.addEventListener("keyup", e => onKeyUp(e));
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("keydown", e => onKeyPressed(e));
            document.removeEventListener("keyup", e => onKeyUp(e));
        }
    }, []);

    function onNoteStart(e: React.MouseEvent, freq: number, key: string) {
        e.preventDefault();

        if (mouseClicked) {
            clickedFreq.value = freq;
            // console.warn(clickedFreq.value);
            if (!pressedFrequencies.includes(freq)) {
                startFreq(freq);
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
            stopFreq(freq);
        }
        clickedFreq.value = null;
        // console.warn(clickedFreq.value);
    }

    return (
        <section className="piano-roll overlay-fill" ref={pianoRollRef}>
            <ul className="octaves">
                {noteList.map(([key, value]) => key.split("-")[1] == 'C' && <li key={key + value + "octave"} className={"octave " + (key.split("-")[0] == '4' ? "base-octave" : "")}>
                    {key.split("-")[0]}
                </li>
                )}
            </ul>
            <ul className="keys">
                {noteList.map(([key, value]) =>
                    <li key={key + value + "key"}>
                        <Note
                            onMouseEnter={(e: React.MouseEvent) => onNoteStart(e, value, key)}
                            onMouseLeave={(e: React.MouseEvent) => onNoteStop(e, value, key)}
                            onMouseDown={(e: React.MouseEvent) => {
                                clickedFreq.value = value;
                                // console.warn(clickedFreq.value);
                                if (!pressedFrequencies.includes(value)) {
                                    startFreq(value);
                                    if (key.includes('#')) {
                                        e.currentTarget.classList.add("pressed-black");
                                    }
                                    else {
                                        e.currentTarget.classList.add("pressed-white");
                                    }
                                }
                            }}
                            keyName={key.split("-")[1]}
                            frequency={value}></Note>
                    </li>
                )}
            </ul>

            <section className="midi-editor">

            </section>
        </section>
    )
}
