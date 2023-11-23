import { broadcast, handle } from "@network/sessions";
import NetworkContext from "@src/context/networkcontext";
import ProjectContext from "@src/context/projectcontext";
import { createRef, useContext, useEffect, useState } from "react";
import "@styles/editor/TrackEditor.css";
import { produce } from "immer";
import { generateId } from "@network/crypto";
import { defaultTrack } from "@models/track";
import DraggedPatternContext from "@src/context/draggedpatterncontext";
import { zoomBase } from "@models/project";
import { slipFloor } from "@src/scripts/math";

export default function TrackEditor() {
    const { socket, cryptoKey } = useContext(NetworkContext);
    const { project, setProject } = useContext(ProjectContext);
    const { draggedPattern, setDraggedPattern } = useContext(DraggedPatternContext);

    const [mousePositions, setMousePositions] = useState<{ [id: string]: { x: number, y: number } }>({});

    const musicNotes = createRef<HTMLDivElement>();

    function handleMouseMove(ev: React.MouseEvent) {
        if (socket) {
            broadcast(socket, cryptoKey!, 'hh:mouse-position', {
                x: ev.nativeEvent.clientX - musicNotes.current!.getBoundingClientRect().left,
                y: ev.nativeEvent.clientY - musicNotes.current!.getBoundingClientRect().top
            });
        }
    }

    function handleAddTrack(ev: React.MouseEvent) {
        setProject(produce(draft => {
            const id = generateId(new Set(Object.keys(draft.data.tracks)));
            draft.data.tracks[id] = { ...defaultTrack };
        }))
    }

    function handlePatternListMouseMove(ev: React.MouseEvent) {
        const { x: offsetX, y: offsetY } = musicNotes.current!.getBoundingClientRect();
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
        <section className="track-layout" onMouseMove={handleMouseMove} ref={musicNotes}>
            <ul className="track-list">
                {Object.keys(project.data.tracks).map((id, i) => {
                    const track = project.data.tracks[id];
                    return <li key={`track[${id}]`} data-id={id}>
                        <div className="sidebar">
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
                            onMouseLeave={handlePatternListMouseLeave}>
                            {track.patterns.map((pattern, i) => {
                                return <li key={`track[${id}]:pattern[${i}]`}>
                                    Pattern {i}
                                </li>
                            })}

                            { !draggedPattern?.dropped && draggedPattern?.over == id && (
                                <li className="pattern-drop-preview" style={{
                                    left: slipFloor(draggedPattern.left + project.position, zoomBase * Math.E ** project.zoom / project.snap),
                                    width: zoomBase * Math.E ** project.zoom /* * draggedPattern.length */
                                }} />
                            )}
                        </ul>
                    </li>
                })}

                <div className="controls">
                    <button className="add-track" onClick={handleAddTrack}>
                        <span>Add Track</span>
                    </button>
                </div>
            </ul>

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