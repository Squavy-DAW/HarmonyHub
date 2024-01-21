import { createRef, useContext, useEffect, useRef, useState } from "react";
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

    const [activeFrequences, setActiveFrequencies] = useState<Set<number>>(new Set())
    const _activeFrequences = useRef<Set<number>>(new Set())

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
        const freq = AudioEngine.getFrequencyByIndex(index + octave * AudioEngine.notes.length);
        if (_activeFrequences.current!.has(freq)) return;
        setActiveFrequencies(produce(draft => { draft.add(freq) }));
        AudioEngine.start(project.data.tracks[trackId].instrument, trackId, freq, ctx);
    }

    function onKeyUp(event: KeyboardEvent) {
        const index = keyMap[event.code];
        if (index === undefined) return;
        const freq = AudioEngine.getFrequencyByIndex(index + octave * AudioEngine.notes.length);
        setActiveFrequencies(produce(draft => { draft.delete(freq) }));
        AudioEngine.stop(project.data.tracks[trackId].instrument, trackId, freq);
    }

    function onNoteEnter(e: React.MouseEvent) {
        e.preventDefault();

        if (_mouseDown.current) {
            const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);
            if (_activeFrequences.current!.has(freq)) return;
            setActiveFrequencies(produce(draft => { draft.add(freq) }));
            AudioEngine.start(project.data.tracks[trackId].instrument, trackId, freq, ctx);
        }
    }

    function onNoteStart(e: React.MouseEvent) {
        e.preventDefault();

        const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);
        setActiveFrequencies(produce(draft => { draft.add(freq) }));
        AudioEngine.start(project.data.tracks[trackId].instrument, trackId, freq, ctx);
    }

    function onNoteStop(e: React.MouseEvent) {
        e.preventDefault();

        const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);
        setActiveFrequencies(produce(draft => { draft.delete(freq) }));
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
        _activeFrequences.current = activeFrequences;
    }, [activeFrequences]);

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
                {Array.from({ length: AudioEngine.octaves }).map((_, i) => {
                    return <li key={`octave[${AudioEngine.octaves-1-i}]`} className={["octave", octave == AudioEngine.octaves-1-i && "selected"].join(' ')}>
                        { AudioEngine.octaves-1-i }
                    </li>
                })}
            </ul>
            <ul className="keys" ref={keysRef}>
                {Array.from({ length: AudioEngine.notes.length * AudioEngine.octaves }).map((_, i) => {
                    const freq = AudioEngine.getFrequencyByIndex(i);
                    const name = AudioEngine.getNoteNameByIndex(i);
                    return <Key key={`key[${name}:${freq}]`}
                        className={activeFrequences.has(freq) ? "pressed" : undefined}
                        onMouseEnter={onNoteEnter}
                        onMouseDown={onNoteStart}
                        onMouseLeave={onNoteStop}
                        onMouseUp={onNoteStop}
                        data-value={freq}
                        data-name={name}
                        data-octave={Math.floor(i / AudioEngine.notes.length)}
                        keyName={name}
                        frequency={freq} />
                })}
            </ul>
        </div>
    )
}
