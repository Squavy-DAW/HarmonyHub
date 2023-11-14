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
    const _selectedNotes = useRef<Set<string>>(new Set()); // These are the notes that are kept selected after the selection has been made

    const _selectionOrigin = useRef<{ x: number, y: number } | undefined>({ x: 0, y: 0 });
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const _selectionStart = useRef(selectionStart);
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
    const _selectionEnd = useRef(selectionEnd);

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
        if (ev.shiftKey) {
            // Reset if the selection has not grown and return
            if (_selectionStart.current.x == _selectionEnd.current.x && _selectionStart.current.y == _selectionEnd.current.y) {
                setSelectedNotes(prev => {
                    prev.clear();
                    return prev;
                });
                _selectedNotes.current.clear();
            }
            return;
        }

        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;

        let start = Math.floor((x + _position.current) / (zoomBase * Math.E ** _zoom.current / _tact.current.beats));
        let pitch = Math.floor(y / 36);

        if (!notes[`${start}:${pitch}`]) {
            setSelectedNotes(prev => {
                prev.clear();
                return prev;
            })
        }

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

    function handleSelectionStart(ev: React.MouseEvent) {
        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        _selectionStart.current = { x, y };
        _selectionEnd.current = { x, y };
        _selectionOrigin.current = { x, y };
        setSelectionStart(_selectionStart.current);
        setSelectionEnd(_selectionStart.current);
        // clear from the previous selection, because the previous ones are kept in _selectedNotes
        setSelectedNotes(prev => {
            prev.clear();
            return prev;
        });

        handleSelectionDrag(ev);
    }

    function handleSelectionDrag(ev: React.MouseEvent) {
        if (_selectionOrigin.current && ev.buttons == 1 && ev.shiftKey) {
            let rect = editorRef.current!.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let y = ev.clientY - rect.top;

            _selectionStart.current = {
                x: Math.min(x, _selectionOrigin.current.x),
                y: Math.min(y, _selectionOrigin.current.y)
            };
            setSelectionStart(_selectionStart.current);
            _selectionEnd.current = {
                x: Math.max(x, _selectionOrigin.current.x),
                y: Math.max(y, _selectionOrigin.current.y)
            };
            setSelectionEnd(_selectionEnd.current);

            let startX = Math.floor((_selectionStart.current.x + _position.current) / (zoomBase * Math.E ** _zoom.current / _tact.current.beats));
            let startY = Math.floor(_selectionStart.current.y / 36);
            let endX = Math.floor((_selectionEnd.current.x + _position.current) / (zoomBase * Math.E ** _zoom.current / _tact.current.beats));
            let endY = Math.floor(_selectionEnd.current.y / 36);

            Object.keys(notes).forEach(id => {
                if (_selectedNotes.current.has(id)) {
                    if (notes[id].start >= startX && notes[id].start <= endX &&
                        notes[id].pitch >= startY && notes[id].pitch <= endY) {
                        setSelectedNotes(prev => {
                            prev.delete(id);
                            return prev;
                        });
                    } else {
                        setSelectedNotes(prev => {
                            prev.add(id);
                            return prev;
                        });
                    }
                }
                else {
                    if (notes[id].start >= startX && notes[id].start <= endX &&
                        notes[id].pitch >= startY && notes[id].pitch <= endY) {
                        setSelectedNotes(prev => {
                            prev.add(id);
                            return prev;
                        });
                    } else {
                        setSelectedNotes(prev => {
                            prev.delete(id);
                            return prev;
                        });
                    }
                }
            });
        } else {
            _selectionOrigin.current = undefined;
            _selectionStart.current = { x: 0, y: 0 };
            _selectionEnd.current = { x: 0, y: 0 };
            setSelectionStart(_selectionStart.current);
            setSelectionEnd(_selectionEnd.current);
        }
    }

    function handleNoteClick(ev: React.MouseEvent) {
        if (ev.shiftKey) {
            ev.stopPropagation();
            if (_selectedNotes.current.has(ev.currentTarget.getAttribute("data-key")!)) {
                _selectedNotes.current.delete(ev.currentTarget.getAttribute("data-key")!);
                setSelectedNotes(prev => {
                    prev.delete(ev.currentTarget.getAttribute("data-key")!);
                    return prev;
                });
            }
            else {
                _selectedNotes.current.add(ev.currentTarget.getAttribute("data-key")!);
                setSelectedNotes(prev => {
                    prev.add(ev.currentTarget.getAttribute("data-key")!);
                    return prev;
                });
            }

            handleSelectionDrag(ev);
        }
    }

    function handleNoteMouseDown(ev: React.MouseEvent) {
        ev.stopPropagation();
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
        if (!mouseDown) {
            _selectedNotes.current.clear();
            selectedNotes.forEach(note => {
                _selectedNotes.current.add(note);
            });
            setSelectionStart({ x: 0, y: 0 });
            setSelectionEnd({ x: 0, y: 0 });
            _selectionOrigin.current = undefined;
        }
    }, [mouseDown, selectedNotes])

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
                    onClick={handleEditorClick}
                    onMouseDown={handleSelectionStart}
                    onMouseMove={handleSelectionDrag}>
                    {selectionStart.x != selectionEnd.x && selectionStart.y != selectionEnd.y && <div className="selection" style={{
                        width: `${Math.abs(selectionStart.x - selectionEnd.x)}px`,
                        height: `${Math.abs(selectionStart.y - selectionEnd.y)}px`,
                        left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                        top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                    }} />}
                    <div style={{ position: 'absolute', left: -position }}>
                        {Object.keys(notes).map(id => (
                            <li key={id} data-key={id} className="note" onClick={handleNoteClick} style={{
                                width: `${zoomBase * Math.E ** zoom / tact.beats}px`,
                                left: `${zoomBase * Math.E ** zoom / tact.beats * notes[id].start}px`,
                                top: `${notes[id].pitch * 36}px`,
                                filter: selectedNotes.has(id) ? "brightness(0.5)" : "brightness(1)"
                            }} onMouseDown={handleNoteMouseDown}>
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
