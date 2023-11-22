import { broadcast, handle } from "@network/sessions";
import NetworkContext from "@src/context/networkcontext";
import ProjectContext from "@src/context/projectcontext";
import { createRef, useContext, useEffect, useState } from "react";
import "@styles/editor/TrackEditor.css";
import { produce } from "immer";
import { generateId } from "@network/crypto";

export default function TrackEditor() {
    const { socket, cryptoKey } = useContext(NetworkContext);
    const { project, setProject } = useContext(ProjectContext);

    const [mousePositions, setMousePositions] = useState<{ [id: string]: { x: number, y: number } }>({});
    
    const musicNotes = createRef<HTMLDivElement>();

    function handleMouseMove(ev: React.MouseEvent) {
        if (socket) {
            broadcast(socket, cryptoKey!, 'hh:mouse-position',   {
                x: ev.nativeEvent.clientX - musicNotes.current!.getBoundingClientRect().left,
                y: ev.nativeEvent.clientY - musicNotes.current!.getBoundingClientRect().top
            });
        }
    }
    
    function handleAddTrack(ev: React.MouseEvent) {
        setProject(produce(draft => {
            const id = generateId(new Set(Object.keys(draft.data.tracks)));
            draft.data.tracks[id] = {
                patterns: [],
                instrument: null! // TODO: add default instrument
            }
        }))
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

    useEffect(() => {
        
    }, [project])

    return (
        <section className="track-layout" onMouseMove={handleMouseMove} ref={musicNotes}>
            <ul className="track-list">
                { Object.keys(project.data.tracks).map(id => {
                    const track = project.data.tracks[id];
                    return <li key={`track[${id}]`} data-key={id}>
                        <ul className="pattern-list">
                            { track.patterns.map((pattern, i) => {
                                return <li key={`track[${id}]:pattern[${i}]`}>
                                    Pattern {i}
                                </li>
                            })}
                        </ul>
                    </li>
                }) }

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