import { createRef, useContext, useEffect, useRef, useState } from "react";
import Key from "./Key";
import { clickedFreq, onKeyPressed, onKeyUp, pressedFrequencies } from "@synth/keylistener";
import { AudioEngine } from "@synth/audioengine";
import SoundContext from "@src/context/soundcontext";
import ProjectContext from "@src/context/projectcontext";
import '@styles/Piano.css';

interface PianoProps extends React.HTMLAttributes<HTMLDivElement> {
    trackId?: string,
    disabled?: boolean,
    orientation?: "vertical" | "horizontal"
}

export default function Piano({ trackId, disabled = false, orientation = "vertical", ...rest }: PianoProps) {

    const { ctx } = useContext(SoundContext);
    const { project, setProject } = useContext(ProjectContext);

    const [mouseDown, setMouseDown] = useState(false);
    const _mouseDown = useRef(mouseDown);

    const pianoRef = createRef<HTMLDivElement>();

    function onMouseDown() {
        _mouseDown.current = true;
        setMouseDown(true);
    }
    function onMouseUp() {
        _mouseDown.current = false;
        setMouseDown(false);
    }

    useEffect(() => {
        // offset to center by default
        pianoRef.current!.parentElement!.scrollTop = pianoRef.current!.clientHeight / 2 - pianoRef.current!.parentElement!.clientHeight / 2;
        pianoRef.current!.parentElement!.scrollLeft = pianoRef.current!.clientWidth / 2 - pianoRef.current!.parentElement!.clientWidth / 2;

        pianoRef.current!.scrollTop = pianoRef.current!.children[0].clientHeight / 2 - pianoRef.current!.clientHeight / 2;
        pianoRef.current!.scrollLeft = pianoRef.current!.children[0].clientWidth / 2 - pianoRef.current!.clientWidth / 2;

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

    function onNoteEnter(e: React.MouseEvent) {
        e.preventDefault();

        if (!trackId || disabled) {
            return;
        }

        const key = e.currentTarget.getAttribute("data-key")!
        const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);

        if (_mouseDown.current) {
            clickedFreq.value = freq;
            // console.warn(clickedFreq.value);
            if (!pressedFrequencies.includes(freq)) {
                AudioEngine.start(project.data.tracks[trackId].instrument, trackId, freq, ctx);
                if (key.includes('#')) {
                    e.currentTarget.classList.add("pressed-black");
                }
                else {
                    e.currentTarget.classList.add("pressed-white");
                }
            }
        }
    }

    function onNoteStart(e: React.MouseEvent) {

        e.preventDefault();

        if (!trackId || disabled) {
            return;
        }

        const key = e.currentTarget.getAttribute("data-key")!
        const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);

        clickedFreq.value = freq;
        if (!pressedFrequencies.includes(freq)) {
            AudioEngine.start(project.data.tracks[trackId].instrument, trackId, freq, ctx);
            e.currentTarget.classList.add(key.includes('#') ? "pressed-black" : "pressed-white");
        }
    }

    function onNoteStop(e: React.MouseEvent) {
        e.preventDefault();

        if (!trackId || disabled) {
            return;
        }

        const key = e.currentTarget.getAttribute("data-key")!
        const freq = parseFloat(e.currentTarget.getAttribute("data-value")!);

        if (!pressedFrequencies.includes(freq)) {
            if (key.includes('#')) {
                e.currentTarget.classList.remove("pressed-black");
            }
            else {
                e.currentTarget.classList.remove("pressed-white");
            }
            AudioEngine.stop(project.data.tracks[trackId].instrument, trackId, freq);
        }
        clickedFreq.value = null;
    }

    return (
        <div ref={pianoRef} className="piano" data-orientation={orientation.toString()} data-disabled={disabled} {...rest}>
            <ul className="octaves">
                {noteList.map(([key, value]) => key.split("-")[1] == 'C' &&
                    <li key={`octave[${key}:${value}]`} className={"octave " + (key.split("-")[0] == '4' ? "base-octave" : "")}>
                        {key.split("-")[0]}
                    </li>
                )}
            </ul>
            <ul className="keys">
                {noteList.map(([key, value]) =>
                    <Key key={`key[${key}:${value}]`}
                        data-key={key}
                        data-value={value}
                        onMouseEnter={onNoteEnter}
                        onMouseDown={onNoteStart}
                        onMouseLeave={onNoteStop}
                        onMouseUp={onNoteStop}
                        keyName={key.split("-")[1]}
                        frequency={value} />
                )}
            </ul>
        </div>
    )
}
