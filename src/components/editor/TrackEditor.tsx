import { broadcast, handle } from "@network/sessions";
import NetworkContext from "@src/context/networkcontext";
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
import PositionContainer from "./PositionContainer";
import ZoomContext from "@src/context/zoomcontext";
import PatternPreview from "./PatternPreview";
import Selection, { ISelectable } from "./Selection";
import SynthEditor from "@components/synthesizer/SynthEditor";
import ModalContext from "@src/context/modalcontext";
import SoundContext from "@src/context/soundcontext";
import { createSynth } from "@synth/synth";

export default function TrackEditor() {
    const { socket, cryptoKey } = useContext(NetworkContext);
    const { project, setProject } = useContext(ProjectContext);
    const { draggedPattern, setDraggedPattern } = useContext(DraggedPatternContext);
    const { factor } = useContext(ZoomContext);
    const { setModalContent } = useContext(ModalContext);

    const [mousePositions, setMousePositions] = useState<{ [id: string]: { x: number, y: number } }>({});
    const [sidebarSize, setSidebarSize] = useState(150);

    const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(new Set());
    const [selecting, setSelecting] = useState(false);

    const trackEditorRef = createRef<HTMLDivElement>();
    const _zoom = useRef(project.zoom);
    const _position = useRef(project.position);

    function handleMouseMove(ev: React.MouseEvent) {
        if (socket) {
            broadcast(socket, cryptoKey!, 'hh:mouse-position', {
                x: ev.nativeEvent.clientX - trackEditorRef.current!.getBoundingClientRect().left,
                y: ev.nativeEvent.clientY - trackEditorRef.current!.getBoundingClientRect().top
            });
        }
    }

    function handleEditorWheel(ev: WheelEvent) {
        if (ev.ctrlKey) {
            ev.preventDefault();
            setProject(produce(draft => {
                const oldSize = zoomBase * Math.E ** _zoom.current;
                const value = _zoom.current - ev.deltaY / 300;
                _zoom.current = Math.max(Math.min(value, 2), -4);
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
        if (!draggedPattern) return;
        const id = ev.currentTarget.getAttribute('data-id')!;
        setProject(produce(draft => {
            const track = draft.data.tracks[id];
            const width = factor * draggedPattern.length;
            const left = draggedPattern.left + project.position - sidebarSize;
            const start = slipFloor(left, width / project.snap) / factor;
            {
                const id = generateId(new Set(Object.keys(track.patterns)));
                track.patterns[id] = {
                    ...draggedPattern,
                    start: start,
                }
            }
        }))
    }

    function handleTrackMouseEnter(ev: React.MouseEvent) {
        if (draggedPattern) {
            const id = ev.currentTarget.getAttribute('data-id')!;
            setDraggedPattern(produce(draft => {
                if (!draft) return;
                draft.over = id;
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

    function handleSelectionChange(selection: string[]) {
        setSelectedPatterns(new Set(selection));
    }

    function handleOpenSynthEditor(ev: React.MouseEvent) {
        const id = ev.currentTarget.getAttribute('data-id')!;
        setModalContent(
            <SynthEditor synth={createSynth()}/* TODO: pass 'trackId' */ />
        )
    }

    useEffect(() => {
        trackEditorRef.current?.addEventListener('wheel', handleEditorWheel);
        return () => {
            trackEditorRef.current?.removeEventListener('wheel', handleEditorWheel);
        }
    }, [])

    useEffect(() => {
        if (socket) {
            socket.on('hh:user-disconnected', ({ id }) => {
                setMousePositions((prevMousePositions) => {
                    const updatedMousePositions = { ...prevMousePositions };
                    delete updatedMousePositions[id];
                    return updatedMousePositions;
                });
            });

            handle(socket, cryptoKey!, 'hh:user-joined', (id) => {
                setMousePositions({
                    ...mousePositions,
                    [id]: { x: 0, y: 0 }
                });
            });

            handle(socket, cryptoKey!, 'hh:mouse-position', async (id, { x, y }) => {
                setMousePositions({
                    ...mousePositions,
                    [id]: { x, y }
                });
            });
        }
        else {
            setMousePositions({});
        }
    }, [socket]);

    return (
        <section className="track-layout" onMouseMove={handleMouseMove} ref={trackEditorRef} style={{ "--sidebar-width": `${sidebarSize}px` }}>
            <Timeline offset={sidebarSize} />

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

                <Selection
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
                        }).map(id => {
                            const track = project.data.tracks[id];

                            return (
                                <ul className="track" key={`track[${id}]`} data-id={id}
                                    onMouseUp={handleTrackAddPattern}
                                    onMouseEnter={handleTrackMouseEnter}
                                    onMouseLeave={handleTrackMouseLeave}>
                                    <PositionContainer style={{ pointerEvents: selecting ? "none" : undefined }}>
                                        {Object.keys(track.patterns).map(patternId => {
                                            const pattern = track.patterns[patternId];
                                            return (
                                                <li key={`track[${id}]:pattern[${patternId}]`} data-id={patternId}
                                                    className={["track-pattern", selectedPatterns.has(patternId) ? "selected" : undefined].join(" ")}
                                                    style={{
                                                        width: pattern.length * factor,
                                                        left: pattern.start * factor,
                                                    }}>
                                                    <PatternPreview id={pattern.id} style={{opacity: 0.5}} />
                                                </li>
                                            )
                                        })}

                                        {draggedPattern && !draggedPattern.dropped && draggedPattern.over == id && (() => {
                                            const width = draggedPattern.length * factor;
                                            const left = draggedPattern.left + project.position - sidebarSize;
                                            const start = slipFloor(left, width / project.snap) / factor;
                                            return (
                                                <li className="track-pattern preview" style={{
                                                    width: width,
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
                </Selection>
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
                
            </div>

            <section className="mouse-cursors">
                {Object.keys(mousePositions).map(id => {
                    const pos = mousePositions[id];
                    return <div key={id} className="cursor" style={{ left: pos.x, top: pos.y }}>
                        <span className="cursor-name">{id}</span>
                    </div>
                })}
            </section>
        </section>
    )
}