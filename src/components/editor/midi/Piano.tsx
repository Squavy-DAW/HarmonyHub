import { createRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import Key from "./Key";
import { AudioEngine } from "@synth/audioengine";
import SoundContext from "@src/context/soundcontext";
import ProjectContext from "@src/context/projectcontext";
import '@styles/Piano.css';
import useMouse from "@src/hooks/mouse";
import { produce } from "immer";

interface PianoProps extends React.HTMLAttributes<HTMLDivElement> {
    trackId: string,
    orientation?: "vertical" | "horizontal"
}

// C0
const rootFrequency = 16.35;

const octaves = 8;

const notes = ["C" , "C#" , "D" , "D#" , "E" , "F" , "F#" , "G" , "G#" , "A" , "A#" , "B"];

function getFrequencyByIndex(index: number) {
    return rootFrequency * ((2 ** (1 / notes.length)) ** index);
}

function getNoteNameByIndex(index: number) {
    return notes[index % 12];
}

const keyMap: { [key: string]: number } = {
//    octave 1          octave 2
    "KeyZ":      0,  "KeyQ":        12,
    "KeyS":      1,  "Digit2":      13,
    "KeyX":      2,  "KeyW":        14,
    "KeyD":      3,  "Digit3":      15,
    "KeyC":      4,  "KeyE":        16,
    "KeyV":      5,  "KeyR":        17,
    "KeyG":      6,  "Digit5":      18,
    "KeyB":      7,  "KeyT":        19,
    "KeyH":      8,  "Digit6":      20,
    "KeyN":      9,  "KeyY":        21,
    "KeyJ":      10, "Digit7":      22,
    "KeyM":      11, "KeyU":        23,
    "Comma":     12, "KeyI":        24,
    "KeyL":      13, "Digit9":      25,
    "Period":    14, "KeyO":        26,
    "Semicolon": 15, "Digit0":      27,
                     "KeyP":        28,
                     "BracketLeft": 29,
};


export default function Piano({ trackId, orientation = "vertical", ...rest }: PianoProps) {

    const { ctx } = useContext(SoundContext);
    const { project, setProject } = useContext(ProjectContext);

    const { mouseDown } = useMouse();
    const _mouseDown = useRef(false);

    const pianoRef = createRef<HTMLDivElement>();
    const keysRef = createRef<HTMLUListElement>();

    const activeFrequences = useRef(new Set<number>());

    const octave = project.data.tracks[trackId].octave;

    function onKeyDown(event: KeyboardEvent) {
        if (event.key == '+') {
            setProject(produce(draft => {
                draft.data.tracks[trackId].octave += 1;
            }))
        } else if (event.key == '-') {
            setProject(produce(draft => {
                draft.data.tracks[trackId].octave -= 1;
            }))
        }

        const index = keyMap[event.code];
        if (index === undefined) return;
        const freq = getFrequencyByIndex(index + octave * notes.length);
        if (activeFrequences.current!.has(freq)) return;
        activeFrequences.current!.add(freq);
        AudioEngine.start(project.data.tracks[trackId].instrument, trackId, freq, ctx);
    }

    function onKeyUp(event: KeyboardEvent) {
        const index = keyMap[event.code];
        if (index === undefined) return;
        const freq = getFrequencyByIndex(index + octave * notes.length);
        activeFrequences.current!.delete(freq);
        AudioEngine.stop(project.data.tracks[trackId].instrument, trackId, freq);
    }

    function onNoteEnter(e: React.MouseEvent) {
        e.preventDefault();

        if (_mouseDown.current) {
            const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);
            if (activeFrequences.current!.has(freq)) return;
            activeFrequences.current!.add(freq);
            AudioEngine.start(project.data.tracks[trackId].instrument, trackId, freq, ctx);
        }
    }

    function onNoteStart(e: React.MouseEvent) {
        e.preventDefault();

        const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);
        activeFrequences.current!.add(freq);
        AudioEngine.start(project.data.tracks[trackId].instrument, trackId, freq, ctx);
    }

    function onNoteStop(e: React.MouseEvent) {
        e.preventDefault();

        const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);
        activeFrequences.current!.delete(freq);
        AudioEngine.stop(project.data.tracks[trackId].instrument, trackId, freq);
    }

    useEffect(() => {
        // offset to center by default
        pianoRef.current!.parentElement!.scrollTop = pianoRef.current!.clientHeight / 2  - pianoRef.current!.parentElement!.clientHeight / 2;
        pianoRef.current!.parentElement!.scrollLeft = pianoRef.current!.clientWidth / 2 - pianoRef.current!.parentElement!.clientWidth / 2;

        pianoRef.current!.scrollTop = pianoRef.current!.children[0].clientHeight / 2 - pianoRef.current!.clientHeight / 2;
        pianoRef.current!.scrollLeft = pianoRef.current!.children[0].clientWidth / 2 - pianoRef.current!.clientWidth / 2;
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        }
    }, [project, trackId])

    useEffect(() => {
        _mouseDown.current = mouseDown;
    }, [mouseDown])

    return (
        <div ref={pianoRef} className="piano" data-orientation={orientation.toString()} {...rest}>
            <ul className="octaves">
                {Array.from({ length: octaves }).map((_, i) => {
                    return <li key={`octave[${octaves-1-i}]`} className={["octave", octave == octaves-1-i && "selected"].join(' ')}>
                        { octaves-1-i }
                    </li>
                })}
            </ul>
            <ul className="keys" ref={keysRef}>
                {Array.from({ length: notes.length * octaves }).map((_, i) => {
                    const freq = getFrequencyByIndex(i);
                    const name = getNoteNameByIndex(i);
                    return <Key key={`key[${name}:${freq}]`}
                        className={activeFrequences.current.has(freq) ? "pressed" : undefined}
                        onMouseEnter={onNoteEnter}
                        onMouseDown={onNoteStart}
                        onMouseLeave={onNoteStop}
                        onMouseUp={onNoteStop}
                        data-value={freq}
                        data-name={name}
                        data-octave={Math.floor(i / notes.length)}
                        keyName={name}
                        frequency={freq} />
                })}
            </ul>
        </div>
    )
}
