import React, { createRef, useContext, useEffect, useRef, useState } from "react";
import { startFreq, stopFreq } from "@synth/engineOLD";
import '@styles/editor/MidiEditor.css';
import { onKeyPressed, onKeyUp, pressedFrequencies, clickedFreq } from "@synth/keylistener"
import EditingPatternContext from "@src/context/editingpattern";
import NumberUpDown from "@components/NumberUpDown";
import Pattern from "@models/pattern";
import Note from "@components/synthesizer/Note";

export default function MidiEditor(props: { pattern: Pattern }) {

    const [tact, setTact] = React.useState({ beats: 4, notes: 4 });
    const _tact = useRef(tact);

    const contentRef = createRef<HTMLDivElement>();
    // const { editingPattern } = useContext(EditingPatternContext);

    //Freq = note x 2^(N/12)
    const noteList = Array.from(genLookupTable()).sort(([, v1], [, v2]) => {
        return v2 - v1;
    });

    const [zoom, setZoom] = useState(1);
    const _zoom = useRef(zoom);

    const [position, setPosition] = useState(0);
    const _position = useRef(position);

    const [notes, setNotes] = useState(props.pattern.data);

    const zoomBase = 100;

    const editorRef = createRef<HTMLDivElement>();

    function handleWheel(ev: WheelEvent) {
        if (ev.ctrlKey) {
            ev.preventDefault();

            let oldSize = zoomBase * Math.E ** _zoom.current;
            let value = _zoom.current - ev.deltaY / 300;
            _zoom.current = Math.max(Math.min(value, 2), -1);
            let newSize = zoomBase * Math.E ** _zoom.current;
            setZoom(_zoom.current);

            let counterWeight = ev.offsetX - ev.offsetX * newSize / oldSize;
            _position.current = Math.max(_position.current / oldSize * newSize - counterWeight, 0);
            setPosition(_position.current);
        }

        else if (ev.shiftKey) {
            ev.preventDefault();
            let value = _position.current + ev.deltaY;
            _position.current = Math.max(value, 0);
            setPosition(_position.current);
        }

        else if (Math.abs(ev.deltaX) > 0) {
            ev.preventDefault();
            let value = _position.current + ev.deltaX;
            _position.current = Math.max(value, 0);
            setPosition(_position.current);
        }
    }

    function handleEditorClick(ev: React.MouseEvent) {
        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;

        let start = Math.floor((x + _position.current) / (zoomBase * Math.E ** _zoom.current / _tact.current.beats));
        let pitch = Math.floor(y / 36);

        setNotes(prev => {
            return {
                ...prev, [`${start}:${pitch}`]: {
                    start: start,
                    pitch: pitch,
                    length: 1,
                }
            }
        });
    }

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

    const [_mouseDown, _setMouseDown] = useState(false);
    const mouseDown = useRef(_mouseDown);

    function onMouseDown() {
        mouseDown.current = true;
        _setMouseDown(true);
    }
    function onMouseUp() {
        mouseDown.current = false;
        _setMouseDown(false);
    }

    useEffect(() => {
        contentRef.current!.scrollTop = contentRef.current!.children[0].clientHeight / 2 - contentRef.current!.clientHeight * 0.8;
        editorRef.current?.addEventListener('wheel', handleWheel);
        return () => {
            editorRef.current?.removeEventListener('wheel', handleWheel);
        }
    }, [])

    useEffect(() => {
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("keydown", e => onKeyPressed(e));
        document.addEventListener("keyup", e => onKeyUp(e));
        return () => {
            document.removeEventListener("keydown", e => onKeyPressed(e));
            document.removeEventListener("keyup", e => onKeyUp(e));
        }
    }, []);

    function onNoteStart(e: React.MouseEvent, freq: number, key: string) {
        e.preventDefault();

        if (mouseDown.current) {
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
        <section className="piano-roll overlay-fill">
            <div className="toolbar">
                <NumberUpDown
                    value={tact.beats}
                    onChange={(value) => setTact(prev => ({ ...prev, beats: value }))}
                    min={1}
                    max={16}
                    step={1} />
                <span>/</span>
                <NumberUpDown
                    value={tact.notes}
                    onChange={(value) => setTact(prev => ({ ...prev, notes: value }))}
                    min={1}
                    max={8}
                    step={1} />
            </div>

            <div className="content" ref={contentRef}>
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
                                frequency={value} />
                        </li>
                    )}
                </ul>

                <section
                    className="midi-editor"
                    ref={editorRef}
                    style={{ backgroundSize: `${zoomBase * Math.E ** zoom}px 72px`, backgroundPositionX: -position }}
                    onClick={handleEditorClick}>
                    <div style={{position: 'absolute', left: -position}}>
                        {Object.keys(notes).map(id => (
                            <li key={id} data-key={id} className="note" onClick={() => void 0} style={{
                                width: `${zoomBase * Math.E ** zoom / tact.beats}px`,
                                left: `${zoomBase * Math.E ** zoom / tact.beats * notes[id].start}px`,
                                top: `${notes[id].pitch * 36}px`,
                            }} />
                        ))}
                    </div>
                </section>
            </div>
        </section>
    )
}
