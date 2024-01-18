import React, { createRef, useContext, useEffect, useRef, useState } from "react";
import { produce } from "immer"
import '@styles/editor/MidiEditor.css';
import NumberUpDown from "@components/editor/utility/NumberUpDown";
import ProjectContext from "@src/context/projectcontext";
import Note from "@models/note";
import { generateId } from "@network/crypto";
import NetworkContext from "@src/context/networkcontext";
import { zoomBase } from "@models/project";
import { slipFloor } from "@src/scripts/math";
import Timeline from "./Timeline";
import ZoomContext from "@src/context/zoomcontext";
import PositionContext from "@src/context/positioncontext";
import PositionContainer from "./utility/PositionContainer";
import ModalContainer from "@components/modal/ModalContainer";
import SelectionContainer from "./utility/SelectionContainer";
import MouseContainer from "./utility/MouseContainer";
import ContextContext from "@src/context/contextcontext";
import PlaybackContext from "@src/context/playbackcontext";
import PlaybackHead from "./PlaybackHead";
import Piano from "./midi/Piano";

export default function MidiEditor(props: { patternId: string, trackId: string }) {
    const { project, setProject } = useContext(ProjectContext);
    const { socket } = useContext(NetworkContext);
    const { time, ...rest } = useContext(PlaybackContext);

    const [snap, setSnap] = useState(project.data.patterns[props.patternId].snap);
    const [tact, setTact] = useState(project.data.patterns[props.patternId].tact);
    const [selectedTrack, setSelectedTrack] = useState(props.trackId);

    const mode = useRef<{ x?: 'move' | 'resize_right' | 'resize_left', y?: 'move' }>();

    const contentRef = createRef<HTMLDivElement>();
    const editorRef = createRef<HTMLDivElement>();

    //Freq = note x 2^(N/12)
    const noteList = Array.from(genLookupTable()).sort(([, v1], [, v2]) => v2 - v1);

    const [zoom, setZoom] = useState(project.data.patterns[props.patternId].zoom);
    const _zoom = useRef(zoom);

    const [position, setPosition] = useState(project.data.patterns[props.patternId].position);
    const _position = useRef(position);

    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
    const [selecting, setSelecting] = useState(false);

    const [mouseMoveRelative, setMouseMoveRelative] = useState({ x: 0, y: 0 });
    const _mouseDownOrigin = useRef({ x: 0, y: 0 });

    function correctNoteErrors() {
        setProject(produce(draft => {
            Object.keys(draft.data.patterns[props.patternId].notes).forEach(id => {
                const note = draft.data.patterns[props.patternId].notes[id];
                if (!note) return;

                if (note.length < 0) {
                    note.start += note.length;
                    note.length *= -1;
                }

                if (note.start < 0) {
                    note.length += note.start;
                    note.start = 0;
                }
            });
        }))
    }

    function handleSnapNotes(_ev: React.MouseEvent) {
        function run(note: Note) {
            note.start = slipFloor(note.start, 1 / snap);
            note.length = slipFloor(note.length, 1 / snap);
        }

        setProject(produce(draft => {
            const notes = draft.data.patterns[props.patternId].notes;
            if (selectedNotes.size == 0) {
                Object.keys(draft.data.patterns[props.patternId].notes).forEach(id => run(notes[id]));
            }
            else {
                selectedNotes.forEach(id => run(notes[id]));
            }
        }));

        setMouseMoveRelative({ x: 0, y: 0 });
    }

    // todo: refactor this
    function handleEditorWheel(ev: WheelEvent) {
        if (ev.ctrlKey) {
            ev.preventDefault();

            let oldSize = zoomBase * Math.E ** _zoom.current;
            let value = _zoom.current - ev.deltaY / 300;
            _zoom.current = Math.max(Math.min(value, 3), 0);
            let newSize = zoomBase * Math.E ** _zoom.current;
            setZoom(_zoom.current);

            let counterWeight = ev.offsetX - ev.offsetX * newSize / oldSize;
            _position.current = Math.max(_position.current / oldSize * newSize - counterWeight, 0);
            setPosition(_position.current);
        }

        else if (ev.shiftKey) {
            ev.preventDefault();
            let value = _position.current + ev.deltaX + ev.deltaY;
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
        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        let start = slipFloor((x + _position.current) / (zoomBase * Math.E ** _zoom.current / tact), 1 / snap);
        let pitch = Math.floor(y / 36);

        const id = generateId(new Set(Object.keys(project.data.patterns[props.patternId].notes)));
        const note = {
            start: start,
            pitch: pitch,
            length: 1 / snap
        };

        setProject(produce(draft => {
            draft.data.patterns[props.patternId].notes[id] = note
        }))


        socket?.broadcast('sqw:note-update', {
            patternId: props.patternId,
            id: id,
            note: note
        });

        _mouseDownOrigin.current = { x: start, y: pitch };
        setSelectedNotes(new Set([id]));
        mode.current = { x: 'resize_right', y: 'move' };
    }

    function handleEditorMouseUp(_ev: React.MouseEvent) {
        mode.current = undefined;
        correctNoteErrors();
    }

    function handleEditorMouseMove(ev: React.MouseEvent) {
        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        let start = slipFloor((x + _position.current) / (zoomBase * Math.E ** _zoom.current / tact), 1 / snap);
        let pitch = Math.floor(y / 36);
        if (start != _mouseDownOrigin.current.x || pitch != _mouseDownOrigin.current.y) {
            setMouseMoveRelative({ x: start - _mouseDownOrigin.current.x, y: pitch - _mouseDownOrigin.current.y });
            _mouseDownOrigin.current = { x: start, y: pitch };
        }
    }

    function handleSelectionChange(selection: string[]) {
        setSelectedNotes(new Set(selection));
    }

    useEffect(() => {
        if (!mode.current) return;

        setProject(produce(draft => {
            selectedNotes.forEach(selectedNote => {
                const note = draft.data.patterns[props.patternId].notes[selectedNote];
                if (!note) return;
                
                var oldValues = {length: note.length, start: note.start, pitch: note.pitch};

                if (mode.current?.x == 'resize_left') {
                    note.start += mouseMoveRelative.x;
                    if (note.start < 0) {
                        note.length += note.start;
                        note.start = 0;
                    }
                    note.length -= mouseMoveRelative.x;
                }

                if (mode.current?.x == 'resize_right') {
                    note.length += mouseMoveRelative.x;
                    if (note.start + note.length < 0) {
                        note.length = -note.start;
                    }
                }

                if (mode.current?.x == 'move') {
                    note.start += mouseMoveRelative.x;
                    if (note.start < 0) {
                        note.length += note.start;
                        note.start = 0;
                    }
                }

                if (mode.current?.y == 'move') {
                    note.pitch += mouseMoveRelative.y;
                }
                
                if(socket && (note.start != oldValues.start || note.length != oldValues.length || note.pitch != oldValues.pitch)){
                    socket!.volatile.broadcast('sqw:note-update', {patternId: props.patternId, id: selectedNote, note}) 
                }
            });
        }));
    }, [mouseMoveRelative])

    function handleNoteMouseDown(ev: React.MouseEvent) {
        if (ev.button == 2) {
            handleNoteMouseMove(ev);
            return;
        };
        ev.stopPropagation();
        let rect = editorRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        let start = slipFloor((x + _position.current) / (zoomBase * Math.E ** _zoom.current / tact), 1 / snap);
        let pitch = Math.floor(y / 36);

        const id = ev.currentTarget.getAttribute("data-id")!

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

        _mouseDownOrigin.current = { x: start, y: pitch };
        if (selectedNotes.has(id)) {
            setSelectedNotes(new Set([...selectedNotes, id]));
        } else {
            setSelectedNotes(new Set([id]));
        }
    }

    function handleNoteMouseMove(ev: React.MouseEvent) {
        if (ev.button != 2) return;
        ev.stopPropagation();

        const id = ev.currentTarget.getAttribute('data-id')!;
        setProject(produce(draft => {
            if(socket){
              socket.broadcast('sqw:note-deleted', {patternId: props.patternId, id});
            }

            delete draft.data.patterns[props.patternId].notes[id];
            selectedNotes.delete(id);
        }));

    }

    function handleResizeRightMouseDown(_ev: React.MouseEvent) {
        mode.current = { x: 'resize_right' }
    }

    function handleResizeLeftMouseDown(_ev: React.MouseEvent) {
        mode.current = { x: 'resize_left' }
    }

    function handleResizeMiddleMouseDown(_ev: React.MouseEvent) {
        mode.current = { x: 'move', y: 'move' }
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
        editorRef.current?.addEventListener('wheel', handleEditorWheel);
        return () => {
            editorRef.current?.removeEventListener('wheel', handleEditorWheel);
        }
    }, [])

    useEffect(() => {
        setProject(produce(draft => {
            let pattern = draft.data.patterns[props.patternId]
            pattern.zoom = zoom;
            pattern.position = position;
            pattern.snap = snap;
            pattern.tact = tact;
        }));
    }, [zoom, position, snap, tact])

    useEffect(() => {
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
        }
    }, []);

    function handleTrackOnChange(ev: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedTrack(ev.target.value);
    }

    function calculateTimeOffset(time: number): number {
        const pattern = Object
            .keys(project.data.tracks[selectedTrack].patterns)
            .map(id => project.data.tracks[selectedTrack].patterns[id])
            .find(pattern => pattern.start <= time && pattern.start + pattern.length >= time);
        if (!pattern) {
            return 0;
        }
        return time - pattern.start;
    }

    return (
        <ContextContext.Provider value={{
            context: `midi-editor:${props.patternId}`
        }}>
            <ZoomContext.Provider value={{
                zoom, factor: zoomBase * Math.E ** zoom / tact
            }}>
                <PositionContext.Provider value={{
                    position
                }}>
                    <PlaybackContext.Provider value={{
                        time: calculateTimeOffset(time), ...rest
                    }}>
                        <ModalContainer mode="fill" className="piano-roll overlay-fill">
                            <div className="toolbar">
                                <span>Notes / Beat: </span>
                                <NumberUpDown
                                    value={tact}
                                    onChange={(value) => setTact(value)}
                                    min={1}
                                    max={16}
                                    step={1} />
                                <span>Snapping: </span>
                                <NumberUpDown
                                    value={snap}
                                    onChange={(value) => setSnap(value)}
                                    min={1}
                                    max={8}
                                    step={1} />
                                <button onClick={handleSnapNotes}>Snap notes to rythm</button>

                                <select onChange={handleTrackOnChange} value={selectedTrack}>
                                    {Object.keys(project.data.tracks).map((id, i) => {
                                        const track = project.data.tracks[id];
                                        return <option key={id} value={id}>{`${i}. ${track.name}`}</option>
                                    })}
                                </select>
                            </div>

                            <Timeline offset={170} />

                            <PlaybackHead />

                            <div className="content" ref={contentRef}>
                                <Piano
                                    trackId={selectedTrack}
                                    orientation="vertical" />

                                <ZoomContext.Consumer>{({ factor }) => (
                                    <section
                                        className="midi-editor"
                                        ref={editorRef}
                                        style={{
                                            backgroundSize: `${factor}px 72px`,
                                            backgroundPositionX: -position,
                                            backgroundImage: ` \
                                        linear-gradient(0deg,#00000000 50%,#00000044 50%), \
                                        linear-gradient(90deg,#6e6e6e 0px,#6e6e6e 4px,#00000000 4px), \
                                        linear-gradient(90deg, ${(function () {
                                                    let result = [];
                                                    for (let i = 0; i < tact; i++) {
                                                        let percent = 100 / tact * i;
                                                        result.push(`#00000000 ${percent}%,#a0a0a0 ${percent}%,#a0a0a0 ${percent + 1}%,#00000000 ${percent + 1}%`)
                                                    }
                                                    return result.join(',');
                                                })()})`
                                        }}
                                        onMouseDown={handleEditorMouseDown}
                                        onMouseMove={handleEditorMouseMove}
                                        onMouseUp={handleEditorMouseUp}
                                        onContextMenu={ev => ev.preventDefault()}>

                                        <MouseContainer>
                                            <SelectionContainer
                                                onSelectionChange={handleSelectionChange}
                                                onSelectionStart={() => setSelecting(true)}
                                                onSelectionEnd={() => setSelecting(false)}
                                                selection={Object.keys(project.data.patterns[props.patternId].notes).map(id => {
                                                    const note = project.data.patterns[props.patternId].notes[id];
                                                    return { id: id, x: note.start, y: note.pitch, width: note.length, height: 36 } // note height, todo: make this dynamic
                                                })}>
                                                <PositionContainer style={{ pointerEvents: selecting ? "none" : undefined }}>
                                                    {Object.keys(project.data.patterns[props.patternId].notes).map(id => {
                                                        const note = project.data.patterns[props.patternId].notes[id];
                                                        const style: React.CSSProperties = {
                                                            width: `${Math.abs(note.length) < Number.EPSILON
                                                                ? factor * 0.2
                                                                : factor * Math.abs(note.length)}px`,
                                                            left: `${Math.abs(note.length) < Number.EPSILON
                                                                ? factor * note.start - factor * 0.2 / 2
                                                                : note.length < 0
                                                                    ? factor * (note.start + note.length)
                                                                    : factor * note.start}px`,
                                                            top: `${note.pitch * 36}px`,
                                                        };
                                                        return (
                                                            <li key={`note-[${id}]`} data-id={id} style={style}
                                                                className={["note", selectedNotes.has(id) ? "selected" : undefined].join(" ")}
                                                                onMouseDown={handleNoteMouseDown}
                                                                onMouseMove={handleNoteMouseMove}>
                                                                <div onMouseDown={handleResizeLeftMouseDown} />
                                                                <div onMouseDown={handleResizeMiddleMouseDown} />
                                                                <div onMouseDown={handleResizeRightMouseDown} />
                                                            </li>
                                                        )
                                                    })}
                                                </PositionContainer>
                                            </SelectionContainer>
                                        </MouseContainer>
                                    </section>
                                )}</ZoomContext.Consumer>
                            </div>
                        </ModalContainer>
                    </PlaybackContext.Provider>
                </PositionContext.Provider>
            </ZoomContext.Provider>
        </ContextContext.Provider>
    )
}
