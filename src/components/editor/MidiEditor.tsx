import React, { createRef, useEffect, useRef, useState } from "react";
import { startFreq, stopFreq } from "@synth/engineOLD";
import '@styles/editor/MidiEditor.css';
import { onKeyPressed, onKeyUp, pressedFrequencies, clickedFreq } from "@synth/keylistener"
import NumberUpDown from "@components/NumberUpDown";
import Pattern from "@models/pattern";
import Key from "@components/synthesizer/Key";
import useMouse from "@src/hooks/mouse";

export default function MidiEditor(props: { pattern: Pattern }) {

    const [tact, setTact] = React.useState({ beats: 4, notes: 4 });
    const _tact = useRef(tact);

    const mode = useRef<'move' | 'resize'>()

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
    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
    const _mouseDownOrigin = useRef({ x: 0, y: 0 });
    const _noteOrigins = useRef(new Map<string, { x: number, y: number }>());

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

    function handleEditorMouseDown(ev: React.MouseEvent) {
        if (ev.nativeEvent.which == 3) return;
        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        let start = Math.floor((x + _position.current) / (zoomBase * Math.E ** _zoom.current / _tact.current.beats));
        let pitch = Math.floor(y / 36);

        if (notes[`${start}:${pitch}`]) {
            return; // should never happen, but just in case
        }

        setNotes(prev => {
            return {
                ...prev,
                [`${start}:${pitch}`]: {
                    start: start,
                    pitch: pitch,
                    length: 1
                }
            }
        });

        _mouseDownOrigin.current = { x, y };
        _noteOrigins.current.set(`${start}:${pitch}`, { x: start, y: pitch });
        setSelectedNotes(new Set([`${start}:${pitch}`]));
        mode.current = 'resize';
    }

    function handleEditorMouseUp(_ev: React.MouseEvent) {
        mode.current = undefined;
    }

    function handleEditorMouseMove(ev: React.MouseEvent) {
        if (ev.buttons != 1) return
        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;

        if (mode.current == 'resize') {
            Object.keys(notes).forEach(id => {
                if (selectedNotes.has(id)) {
                    notes[id].length = Math.floor(x / (zoomBase * Math.E ** _zoom.current / _tact.current.beats)) - notes[id].start + 1;

                    setNotes(prev => ({
                        ...prev, [id]: {
                            ...prev[id],
                            length: notes[id].length
                        }
                    }))
                }
            });
        }

        if (mode.current == 'move') {
            Object.keys(notes).forEach(id => {
                if (selectedNotes.has(id)) {
                    notes[id].start = Math.floor((x - _mouseDownOrigin.current.x) / (zoomBase * Math.E ** _zoom.current / _tact.current.beats)) + _noteOrigins.current.get(id)!.x;
                    notes[id].pitch = Math.floor((y - _mouseDownOrigin.current.y) / 36) + _noteOrigins.current.get(id)!.y;

                    setNotes(prev => ({
                        ...prev, [id]: {
                            ...prev[id],
                            start: notes[id].start,
                            pitch: notes[id].pitch
                        }
                    }))
                }
            });
        }
    }

    function handleNoteMouseDown(ev: React.MouseEvent) {
        if (ev.nativeEvent.which == 3) {
            handleNoteMouseMove(ev);
            return;
        };
        ev.stopPropagation();
        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;

        let id = ev.currentTarget.getAttribute("data-key")!;
        
        if (ev.shiftKey) {
            if (selectedNotes.has(id)) {
                selectedNotes.delete(id);
                setSelectedNotes(new Set(selectedNotes));
            }
            else {
                selectedNotes.add(id);
                setSelectedNotes(new Set(selectedNotes));
            }
            return;
        }
        
        mode.current = 'move';
        _mouseDownOrigin.current = { x, y };
        if (selectedNotes.has(id)) {
            setSelectedNotes(new Set([...selectedNotes, id]));
            selectedNotes.forEach(id => {
                _noteOrigins.current.set(id, { x: notes[id].start, y: notes[id].pitch });
            })
        } else {
            setSelectedNotes(new Set([id]));
        }
    }

    function handleNoteMouseMove(ev: React.MouseEvent) {
        if (ev.nativeEvent.which != 3) return;
        ev.stopPropagation();
        setNotes(prev => {
            delete prev[ev.currentTarget.getAttribute("data-key")!];
            return { ...prev };
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
        contentRef.current!.scrollTop = contentRef.current!.children[0].clientHeight / 2 - contentRef.current!.clientHeight * 0.8;
        editorRef.current?.addEventListener('wheel', handleWheel);
        return () => {
            editorRef.current?.removeEventListener('wheel', handleWheel);
        }
    }, [])

    useEffect(() => {
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("keydown", onKeyPressed);
        document.addEventListener("keyup", onKeyUp);
        return () => {
            document.removeEventListener("keydown", onKeyPressed);
            document.removeEventListener("keyup", onKeyUp);
        }
    }, []);

    function onNoteStart(e: React.MouseEvent, freq: number, key: string) {
        e.preventDefault();

        if (_mouseDown.current) {
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
                            <Key
                                onMouseEnter={(e: React.MouseEvent) => onNoteStart(e, value, key)}
                                onMouseLeave={(e: React.MouseEvent) => onNoteStop(e, value, key)}
                                onMouseDown={(e: React.MouseEvent) => {
                                    clickedFreq.value = value;
                                    if (!pressedFrequencies.includes(value)) {
                                        startFreq(value);
                                        e.currentTarget.classList.add(key.includes('#') ? "pressed-black" : "pressed-white");
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
                    onMouseDown={handleEditorMouseDown}
                    onMouseMove={handleEditorMouseMove}
                    onMouseUp={handleEditorMouseUp}
                    onContextMenu={ev => ev.preventDefault()}>
                    {/* selectionStart.x != selectionEnd.x && selectionStart.y != selectionEnd.y && <div className="selection" style={{
                        width: `${Math.abs(selectionStart.x - selectionEnd.x)}px`,
                        height: `${Math.abs(selectionStart.y - selectionEnd.y)}px`,
                        left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                        top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                    }} /> */}
                    <div style={{ position: 'absolute', left: -position }}>
                        {Object.keys(notes).map(id => (
                            <li key={`note-[${id}]`} data-key={id} className="note" style={{
                                width: `${notes[id].length != 0
                                    ? zoomBase * Math.E ** zoom / tact.beats * Math.abs(notes[id].length)
                                    : 10}px`,
                                left: `${notes[id].length < 0
                                    ? zoomBase * Math.E ** zoom / tact.beats * (notes[id].start + notes[id].length)
                                    : zoomBase * Math.E ** zoom / tact.beats * notes[id].start}px`,
                                top: `${notes[id].pitch * 36}px`,
                                filter: selectedNotes.has(id) ? "hue-rotate(180deg)" : "none"
                            }} onMouseDown={handleNoteMouseDown}
                                onMouseMove={handleNoteMouseMove}>
                                <div />
                                <div />
                                <div />
                            </li>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    )
}
