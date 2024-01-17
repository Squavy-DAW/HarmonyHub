import ProjectContext from "@src/context/projectcontext";
import { createRef, useContext, useEffect, useRef, useState } from "react";
import "@styles/editor/TrackEditor.css";
import { produce } from "immer";
import { generateId } from "@network/crypto";
import { defaultTrack } from "@models/track";
import DraggedPatternContext from "@src/context/draggedpatterncontext";
import { zoomBase } from "@models/project";
import { slipFloor } from "@src/scripts/math";
import { Allotment, LayoutPriority } from "allotment";
import Timeline from "./Timeline";
import PositionContainer from "./utility/PositionContainer";
import ZoomContext from "@src/context/zoomcontext";
import PatternPreview from "./PatternPreview";
import SelectionContainer, { ISelectable } from "./utility/SelectionContainer";
import SynthEditor from "@components/editor/SynthEditor";
import ModalContext from "@src/context/modalcontext";
import MouseContainer from "./utility/MouseContainer";
import ContextContext from "@src/context/contextcontext";
import { calculatePatternLength } from "@models/pattern";
import PlaybackHead from "./PlaybackHead";
import MidiEditor from "./MidiEditor";
import Adsr from "./synthesizer/Adsr";

export default function TrackEditor() {
    const { project, setProject } = useContext(ProjectContext);
    const { draggedPattern, setDraggedPattern } = useContext(DraggedPatternContext);
    const { factor } = useContext(ZoomContext);
    const { setModalContent } = useContext(ModalContext);

    const [sidebarSize, setSidebarSize] = useState(150);

    const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(new Set());
    const [selecting, setSelecting] = useState(false);
    const mode = useRef<{ x?: 'move' | 'resize_right' | 'resize_left', y?: 'move' }>();

    const [mouseMoveRelative, setMouseMoveRelative] = useState({ x: 0, track: 0 });
    const _mouseDownOrigin = useRef({ x: 0, track: 0 });

    const trackEditorRef = createRef<HTMLDivElement>();
    const contentRef = createRef<HTMLDivElement>();
    const _zoom = useRef(project.zoom);
    const _position = useRef(project.position);

    function correctPatternErrors() {
        setProject(produce(draft => {
            Object.keys(draft.data.tracks).forEach(trackId => {
                const track = draft.data.tracks[trackId];
                Object.keys(track.patterns).forEach(patternId => {
                    const pattern = track.patterns[patternId];
                    if (!pattern) return;

                    if (pattern.length < 0) {
                        pattern.start += pattern.length;
                        pattern.length *= -1;
                    }

                    if (pattern.start < 0) {
                        pattern.length += pattern.start;
                        pattern.start = 0;
                    }
                });
            });
        }))
    }

    // todo: refactor this
    function handleEditorWheel(ev: WheelEvent) {
        if (ev.ctrlKey) {
            ev.preventDefault();
            setProject(produce(draft => {
                const oldSize = zoomBase * Math.E ** _zoom.current;
                const value = _zoom.current - ev.deltaY / 300;
                _zoom.current = Math.max(Math.min(value, 2), -2.5);
                const newSize = zoomBase * Math.E ** _zoom.current;
                draft.zoom = _zoom.current;

                const counterWeight = ev.offsetX - ev.offsetX * newSize / oldSize;
                _position.current = Math.max(_position.current / oldSize * newSize - counterWeight, 0);
                draft.position = _position.current;
            }))
        }

        else if (ev.shiftKey) {
            ev.preventDefault();
            setProject(produce(draft => {
                const value = _position.current + ev.deltaX + ev.deltaY;
                _position.current = Math.max(value, 0);
                draft.position = _position.current;
            }))
        }

        else if (Math.abs(ev.deltaX) > 0) {
            ev.preventDefault();
            setProject(produce(draft => {
                const value = _position.current + ev.deltaX;
                _position.current = Math.max(value, 0);
                draft.position = _position.current;
            }))
        }
    }

    function handleAddTrack(_ev: React.MouseEvent) {
        setProject(produce(draft => {
            const tracks = Object.keys(draft.data.tracks);
            const id = generateId(new Set(tracks));
            draft.data.tracks[id] = {
                ...defaultTrack,
                index: tracks.length,
            };
        }))
    }

    function handleTrackAddPattern(ev: React.MouseEvent) {
        if (!draggedPattern || draggedPattern.dropped) return;
        const id = ev.currentTarget.getAttribute('data-id')!;
        setProject(produce(draft => {
            const track = draft.data.tracks[id];
            const left = draggedPattern.left + project.position - sidebarSize;
            const start = slipFloor(left / factor, 1 / project.snap);
            {
                const id = generateId(new Set(Object.keys(track.patterns)));
                track.patterns[id] = {
                    patternId: draggedPattern.id,
                    start: start,
                    length: calculatePatternLength(draft.data.patterns[draggedPattern.id]),
                }
            }
        }))
    }

    function handleTrackMouseEnter(ev: React.MouseEvent) {
        if (draggedPattern) {
            const id = ev.currentTarget.getAttribute('data-id')!;
            setDraggedPattern(produce(draft => {
                if (!draft) return;
                draft.over = project.data.tracks[id];
            }))
        }
    }

    function handleTrackMouseLeave(_ev: React.MouseEvent) {
        if (draggedPattern) {
            setDraggedPattern(produce(draft => {
                if (!draft) return;
                draft.over = undefined;
            }))
        }
    }

    function handlePatternMouseDown(ev: React.MouseEvent) {
        if (ev.button == 2) {
            const trackId = ev.currentTarget.getAttribute('data-track-id')!
            const patternId = ev.currentTarget.getAttribute('data-id')!

            setProject(produce(draft => {
                delete draft.data.tracks[trackId].patterns[patternId];
            }))
        } else {
            ev.stopPropagation();
            let rect = contentRef.current!.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let start = slipFloor((x + _position.current) / factor, 1 / project.snap);

            const id = ev.currentTarget.getAttribute("data-id")!
            const trackId = ev.currentTarget.getAttribute("data-track-id")!
            const track = project.data.tracks[trackId].index;

            if (ev.shiftKey) {
                if (selectedPatterns.has(id)) {
                    selectedPatterns.delete(id);
                    setSelectedPatterns(new Set(selectedPatterns));
                }
                else {
                    selectedPatterns.add(id);
                    setSelectedPatterns(new Set(selectedPatterns));
                }
                return;
            }

            _mouseDownOrigin.current = { x: start, track: track };
            if (selectedPatterns.has(id)) {
                setSelectedPatterns(new Set([...selectedPatterns, id]));
            } else {
                setSelectedPatterns(new Set([id]));
            }
        }
    }

    function handlePatternOpenEditor(ev: React.MouseEvent) {
        ev.stopPropagation();
        const id = ev.currentTarget.getAttribute("data-id")!;
        const trackId = ev.currentTarget.getAttribute("data-track-id")!;
        const pattern = project.data.tracks[trackId].patterns[id];

        setModalContent(
            <MidiEditor patternId={pattern.patternId} trackId={trackId} />
        )
    }

    function handleEditorMouseUp(_ev: React.MouseEvent) {
        mode.current = undefined;
        correctPatternErrors();
        setDraggedPattern(produce(draft => {
            if (!draft) return;
            draft.dropped = true;
        }));
    }

    function handleEditorMouseMove(ev: React.MouseEvent) {
        let rect = contentRef.current!.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;

        let start = slipFloor((x + _position.current) / factor, 1 / project.snap);
        let track = Math.floor(y / 72);
        if (start != _mouseDownOrigin.current.x || track != _mouseDownOrigin.current.track) {
            setMouseMoveRelative({ x: start - _mouseDownOrigin.current.x, track: track - _mouseDownOrigin.current.track });
            _mouseDownOrigin.current = { x: start, track: track };
        }
    }

    function handleResizeLeftMouseDown(_ev: React.MouseEvent) {
        mode.current = { x: 'resize_left' };
    }

    function handleResizeRightMouseDown(_ev: React.MouseEvent) {
        mode.current = { x: 'resize_right' };
    }

    function handleResizeMiddleMouseDown(_ev: React.MouseEvent) {
        mode.current = { x: 'move', y: 'move' };
    }

    function handleResizePatternToFit(ev: React.MouseEvent) {
        ev.stopPropagation();
        setProject(produce(draft => {
            Object.keys(draft.data.tracks).forEach(trackId => {
                const track = draft.data.tracks[trackId];
                selectedPatterns.forEach(patternId => {
                    const pattern = track.patterns[patternId];
                    if (!pattern) return;
                    pattern.length = calculatePatternLength(draft.data.patterns[pattern.patternId]);
                })
            });
        }));
    }

    function handleSelectionChange(selection: string[]) {
        setSelectedPatterns(new Set(selection));
    }

    function handleOpenSynthEditor(ev: React.MouseEvent) {
        const id = ev.currentTarget.getAttribute('data-id')!;
        setModalContent(
            <SynthEditor trackId={id} />
        )
    }

    useEffect(() => {
        trackEditorRef.current?.addEventListener('wheel', handleEditorWheel);
        return () => {
            trackEditorRef.current?.removeEventListener('wheel', handleEditorWheel);
        }
    }, [])

    useEffect(() => {
        if (!mode.current) return;

        setProject(produce(draft => {
            Object.keys(draft.data.tracks).forEach(trackId => {
                const track = draft.data.tracks[trackId];
                selectedPatterns.forEach(id => {
                    const pattern = track.patterns[id];
                    if (!pattern) return;

                    if (mode.current?.x == 'resize_left') {
                        pattern.start += mouseMoveRelative.x;
                        if (pattern.start < 0) {
                            pattern.length += pattern.start;
                            pattern.start = 0;
                        }
                        pattern.length -= mouseMoveRelative.x;
                    }

                    if (mode.current?.x == 'resize_right') {
                        pattern.length += mouseMoveRelative.x;
                        if (pattern.start + pattern.length < 0) {
                            pattern.length = -pattern.start;
                        }
                    }

                    if (mode.current?.x == 'move') {
                        pattern.start += mouseMoveRelative.x;
                        if (pattern.start < 0) {
                            pattern.length += pattern.start;
                            pattern.start = 0;
                        }
                    }

                    if (mode.current?.y == 'move') {
                        const oldIndex = track.index;
                        if (track.index + mouseMoveRelative.track < 0 ||
                            track.index + mouseMoveRelative.track >= Object.keys(draft.data.tracks).length ||
                            track.index + mouseMoveRelative.track == oldIndex) return;
                        // delete track.patterns[id];

                        // Variant 1: delete pattern from old track and add it to new track
                        //  Problem: Because we iterate over all tracks, it will move down by one track every time -> the pattern will ALWAYS be moved to the end of the track list
                        // /* UNCOMMENT THIS -> */ draft.data.tracks[Object.keys(draft.data.tracks)[track.index + mouseMoveRelative.track]].patterns[id] = pattern;

                        // Variant 2: delete pattern from old track and set it as a dragged pattern
                        //  Problem: Can't move multiple patterns at once
                        //       /* OR THIS -> */ setDraggedPattern({
                        //     ...project.data.patterns[pattern.patternId],
                        //     id: pattern.patternId,
                        //     left: pattern.start * factor,
                        //     top: (track.index + mouseMoveRelative.track) * 72,
                        //     over: project.data.tracks[Object.keys(draft.data.tracks)[track.index + mouseMoveRelative.track]],
                        //     rotate: 0,
                        // })
                    }
                });
            })
        }));
    }, [mouseMoveRelative])

    return (
        <ContextContext.Provider value={{
            context: 'track-editor'
        }}>
            <section className="track-layout" ref={trackEditorRef} style={{ "--sidebar-width": `${sidebarSize}px` }}>
                <Timeline offset={sidebarSize} />
                <PlaybackHead />

                <div className="content">
                    <ul className={["track-sidebar", sidebarSize < Number.EPSILON ? "hidden" : ""].join(' ')}>
                        {Object.keys(project.data.tracks).sort((a, b) => {
                            return project.data.tracks[a].index - project.data.tracks[b].index
                        }).map(id => {
                            const track = project.data.tracks[id];
                            return (
                                <li key={`track[${id}]`} className="track" data-id={id}
                                    onClick={handleOpenSynthEditor}>
                                    <div className="track-mixer">
                                        Mixer
                                    </div>
                                    <span className="track-name">
                                        {track.name}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>

                    <div className="container" ref={contentRef} onMouseMove={handleEditorMouseMove} onMouseUp={handleEditorMouseUp}>
                        <MouseContainer>
                            <SelectionContainer
                                onSelectionChange={handleSelectionChange}
                                onSelectionStart={() => setSelecting(true)}
                                onSelectionEnd={() => setSelecting(false)}
                                selection={Object.keys(project.data.tracks).flatMap(id => {
                                    const track = project.data.tracks[id];
                                    return Object.keys(track.patterns).map<ISelectable>(id => {
                                        const pattern = track.patterns[id];
                                        return { id: id, x: pattern.start, y: track.index, width: pattern.length, height: 72 }
                                    })
                                })}>
                                <ul className="track-list" style={{
                                    backgroundSize: `${factor}px 144px`,
                                    backgroundPositionX: -project.position,
                                    backgroundImage: `\
                                        linear-gradient(0deg,#00000000 50%,#00000044 50%), \
                                        linear-gradient(90deg, #110600 0px, #110600 2px, #00000000 4px), \
                                        linear-gradient(90deg, ${(function () {
                                            let result = [];
                                            for (let i = 0; i < 8; i++) {
                                                let percent = 100 / 8 * i;
                                                result.push(`#00000000 ${percent}%,#241e1e ${percent}%,#241e1e ${percent + 0.5}%,#00000000 ${percent + 0.5}%`)
                                            }
                                            return result.join(',');
                                        })()})`
                                }}>
                                    {Object.keys(project.data.tracks).sort((a, b) => {
                                        return project.data.tracks[a].index - project.data.tracks[b].index
                                    }).map(trackId => {
                                        const track = project.data.tracks[trackId];

                                        return (
                                            <ul className="track" key={`track[${trackId}]`} data-id={trackId}
                                                onMouseUp={handleTrackAddPattern}
                                                onMouseEnter={handleTrackMouseEnter}
                                                onMouseLeave={handleTrackMouseLeave}>
                                                <PositionContainer style={{ pointerEvents: selecting ? "none" : undefined }}>
                                                    {Object.keys(track.patterns).map(patternId => {
                                                        const pattern = track.patterns[patternId];
                                                        return (
                                                            <li key={`track[${trackId}]:pattern[${patternId}]`} data-id={patternId} data-track-id={trackId}
                                                                onMouseDown={handlePatternMouseDown}
                                                                onDoubleClick={handlePatternOpenEditor}
                                                                className={["track-pattern", selectedPatterns.has(patternId) ? "selected" : undefined].join(" ")}
                                                                style={{
                                                                    opacity: Math.abs(pattern.length) < Number.EPSILON ? 0.5 : 1,
                                                                    width: `${Math.abs(pattern.length) < Number.EPSILON
                                                                        ? factor * 0.5
                                                                        : factor * Math.abs(pattern.length)}px`,
                                                                    left: `${Math.abs(pattern.length) < Number.EPSILON
                                                                        ? factor * pattern.start - factor * 0.5 / 2
                                                                        : pattern.length < 0
                                                                            ? factor * (pattern.start + pattern.length)
                                                                            : factor * pattern.start}px`,
                                                                }}>
                                                                <div onMouseDown={handleResizeLeftMouseDown} />
                                                                <div onMouseDown={handleResizeMiddleMouseDown} />
                                                                <div onMouseDown={handleResizeRightMouseDown}
                                                                    onDoubleClick={handleResizePatternToFit} />
                                                                <PatternPreview id={pattern.patternId} style={{ opacity: 0.5 }} />
                                                                <PatternPreview className="overflow" id={pattern.patternId} style={{ opacity: 0.1 }} />
                                                            </li>
                                                        )
                                                    })}

                                                    {draggedPattern && !draggedPattern.dropped && draggedPattern.over == track && (() => {
                                                        const left = draggedPattern.left + project.position - sidebarSize;
                                                        const start = slipFloor(left / factor, 1 / project.snap);
                                                        return (
                                                            <li className="track-pattern preview" style={{
                                                                width: calculatePatternLength(project.data.patterns[draggedPattern.id]) * factor,
                                                                left: start * factor,
                                                            }}>
                                                                <PatternPreview id={draggedPattern.id} />
                                                            </li>
                                                        )
                                                    })()}
                                                </PositionContainer>
                                            </ul>
                                        )
                                    })}
                                </ul>
                            </SelectionContainer>
                        </MouseContainer>
                    </div>
                </div>

                <Allotment className="allotment" vertical={false} separator={true} proportionalLayout={false} onChange={(sizes => {
                    setSidebarSize(sizes[0]);
                })}>
                    <Allotment.Pane snap minSize={100} maxSize={200} preferredSize={150} children />
                    <Allotment.Pane priority={LayoutPriority.High} children />
                </Allotment>

                <div className="controls">
                    <button className="add-track" onClick={handleAddTrack}>
                        <span>Add Track</span>
                    </button>
                </div>

                <div className="misc">
                    <div style={{margin: 100}}>
                    <Adsr />
                    </div>
                </div>
            </section>
        </ContextContext.Provider>
    )
}