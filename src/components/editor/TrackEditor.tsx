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
import { slipCeil, slipFloor } from "@src/scripts/math";
import { Allotment, LayoutPriority } from "allotment";
import Timeline from "./Timeline";

export default function TrackEditor() {
    const { socket, cryptoKey } = useContext(NetworkContext);
    const { project, setProject } = useContext(ProjectContext);
    const { draggedPattern, setDraggedPattern } = useContext(DraggedPatternContext);

    const [mousePositions, setMousePositions] = useState<{ [id: string]: { x: number, y: number } }>({});
    const [sidebarSize, setSidebarSize] = useState(150);

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
                _zoom.current = Math.max(Math.min(value, 5), -2);
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
                const value = _position.current + ev.deltaX;
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

    function handleAddTrack(ev: React.MouseEvent) {
        setProject(produce(draft => {
            const id = generateId(new Set(Object.keys(draft.data.tracks)));
            draft.data.tracks[id] = { ...defaultTrack };
        }))
    }

    function handlePatternListMouseMove(ev: React.MouseEvent) {
        const { x: offsetX, y: offsetY } = trackEditorRef.current!.getBoundingClientRect();
        if (draggedPattern) {
            const x = ev.nativeEvent.clientX - offsetX;
            const y = ev.nativeEvent.clientY - offsetY;
        }
    }

    function handlePatternListMouseEnter(ev: React.MouseEvent) {
        if (draggedPattern) {
            const id = ev.currentTarget.getAttribute('data-id')!;
            setDraggedPattern(produce(draft => {
                if (!draft) return;
                draft.over = id;
            }))
        }
    }

    function handlePatternListMouseLeave(_ev: React.MouseEvent) {
        if (draggedPattern) {
            setDraggedPattern(produce(draft => {
                if (!draft) return;
                draft.over = undefined;
            }))
        }
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
            {(() => {
                return <>
                    <div className="timeline-container">
                        <Timeline zoom={project.zoom} position={project.position} />
                    </div>
                    <ul className="track-list">
                        {Object.keys(project.data.tracks).map((id, i) => {
                            const track = project.data.tracks[id];

                            return <li key={`track[${id}]`} data-id={id}>
                                <div className={["sidebar", sidebarSize < Number.EPSILON ? "hidden" : ""].join(' ')}>
                                    <div className="track-mixer">
                                        {/* Mixer */}
                                    </div>
                                    <span className="track-name">
                                        {track.name}
                                    </span>
                                </div>

                                <ul className="pattern-list" data-id={id}
                                    onMouseMove={handlePatternListMouseMove}
                                    onMouseEnter={handlePatternListMouseEnter}
                                    onMouseLeave={handlePatternListMouseLeave}
                                    style={{
                                        backgroundSize: `${zoomBase * Math.E ** project.zoom}px 72px`,
                                        backgroundPositionX: -project.position,
                                        backgroundImage: `linear-gradient(90deg, #332b2b 0px, #332b2b 2px, #00000000 4px)`
                                    }}>
                                    {track.patterns.map((pattern, i) => {
                                        return <li key={`track[${id}]:pattern[${i}]`}>
                                            Pattern {i}
                                        </li>
                                    })}

                                    {!draggedPattern?.dropped && draggedPattern?.over == id && (() => {
                                        const width = zoomBase * Math.E ** project.zoom; /* * draggedPattern.length */
                                        const left = draggedPattern.left + project.position - sidebarSize - width / 2;
                                        return <li className="pattern-drop-preview" style={{
                                            left: slipFloor(left, width / project.snap),
                                            width: width,
                                        }} />
                                    })()}
                                </ul>
                            </li>
                        })}
                    </ul>
                </>
            })()}

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
                {/* TODO: Add cool stuff (pixel art, oscilloscope, etc...) */}
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