import '@styles/Music.css';
import Project, { zoomBase } from "@models/project";
import Modal from 'react-modal';
import { createRef, useContext, useEffect, useRef, useState } from "react";
import Network from "@models/network";
import NetworkContext from "@src/context/networkcontext";
import Toolbar from "./editor/Toolbar";
import ModalContext from "@src/context/modalcontext";
import TabContext from "@src/context/tabcontext";
import { Allotment, LayoutPriority } from "allotment";
import { init } from '@synth/engineOLD';
import TrackEditor from './editor/TrackEditor';
import Patterns, { PatternDragOverlay } from './editor/Patterns';
import ProjectContext from '@src/context/projectcontext';
import { produce } from 'immer';
import { DraggingPattern } from '@models/pattern';
import DraggedPatternContext from '@src/context/draggedpatterncontext';
import { generateId } from '@network/crypto';
import TabsContext from '@src/context/tabscontext';
import ZoomContext from '@src/context/zoomcontext';
import PositionContext from '@src/context/positioncontext';
import UserContext from '@src/context/usercontext';

export default function Music(props: { project: Project, network: Network }) {

    const { tabs } = useContext(TabsContext);
    const { tab } = useContext(TabContext);

    const [project, setProject] = useState<Project>(props.project);
    const _project = useRef<Project>(props.project);

    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [draggedPattern, setDraggedPattern] = useState<DraggingPattern>();

    const [room, setRoom] = useState(props.network.room);
    const [socket, setSocket] = useState(props.network.socket);
    const [username, setUsername] = useState<string>('');
    
    const [usernames, setUsernames] = useState<{ [id: string]: string }>({});
    
    const patternDragOverlay = createRef<HTMLDivElement>();
    const id = useRef(generateId());

    function handleStopCollaboration() {
        socket?.disconnect();
        setSocket(undefined);
    }

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        return () => {
            if (!tabs.includes(tab)) {
                handleStopCollaboration();
            }
        }
    }, [tabs, socket]);

    useEffect(() => {
        _project.current = project;
    }, [project]);

    useEffect(() => {
        socket?.request('hh:request-project', null).then((project: Project) => {
            setProject(project);
        });

        socket?.on('hh:user-disconnected', ({ id }) => {
            console.log(`User with id=${id} disconnected`);
            setUsernames(produce(draft => {
                delete draft[id];
            }))
        });

        socket?.addEventListener('hh:user-joined', (id, { name }) => {
            console.log(`${name} with id=${id} joined the session`);
            socket.broadcast('hh:username-update', { name: username });
            setUsernames(produce(draft => {
                draft[id] = name;
            }))
        });

        socket?.addEventListener('hh:request-project', () => {
            console.log("Requested project");
            return _project.current;
        });

        socket?.addEventListener('hh:note-update', (_id, { patternId, id, note }) => {
            setProject(produce(draft => {
                draft.data.patterns[patternId].notes[id] = note;
            }));
        })

        socket?.addEventListener('hh:note-deleted', (_id, { patternId, id }) => {
            setProject(produce(draft => {
                delete draft.data.patterns[patternId].notes[id];
            }))
        })

        socket?.addEventListener('hh:username-update', (id, { name }) => {
            console.log(`${name} with id=${id} updated their username to ${name}`);
            
            setUsernames(produce(draft => {
                draft[id] = name;
            }))
        })
    }, [socket]);

    return (
        <UserContext.Provider value={{
            usernames, setUsernames
        }}>
            <ProjectContext.Provider value={{
                project, setProject
            }}>
                <NetworkContext.Provider value={{
                    socket, setSocket, room, setRoom, username, setUsername
                }}>
                    <ModalContext.Provider value={{
                        modalContent, setModalContent
                    }}>
                        <DraggedPatternContext.Provider value={{
                            draggedPattern, setDraggedPattern
                        }}>
                            <ZoomContext.Provider value={{
                                zoom: project.zoom, factor: zoomBase * Math.E ** project.zoom
                            }}>
                                <PositionContext.Provider value={{
                                    position: project.position
                                }}>
                                    <section className="music-layout" id={id.current}>
                                        <Toolbar />

                                        <Allotment vertical={false} separator={true} proportionalLayout={false}>
                                            <Allotment.Pane priority={LayoutPriority.High}>
                                                <TrackEditor />
                                            </Allotment.Pane>
                                            <Allotment.Pane snap minSize={150} maxSize={300} preferredSize={200}>
                                                <Patterns overlay={patternDragOverlay} />
                                            </Allotment.Pane>
                                        </Allotment>

                                        <PatternDragOverlay ref={patternDragOverlay} />

                                        {<Modal
                                            isOpen={!!modalContent}
                                            onRequestClose={() => setModalContent(null)}
                                            parentSelector={() => document.getElementById(id.current)!}>
                                            {modalContent}
                                        </Modal>}
                                    </section>
                                </PositionContext.Provider>
                            </ZoomContext.Provider>
                        </DraggedPatternContext.Provider>
                    </ModalContext.Provider>
                </NetworkContext.Provider>
            </ProjectContext.Provider>
        </UserContext.Provider>
    );
}
