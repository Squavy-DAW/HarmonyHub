import '@styles/Music.css';
import Project from "@models/project";
import Modal from 'react-modal';
import { useContext, useEffect, useState } from "react";
import { broadcast, handle } from "@network/sessions";
import Network from "@models/network";
import NetworkContext from "@src/context/networkcontext";
import Toolbar from "./Toolbar";
import ModalContext from "@src/context/modalcontext";
import useTabs from "@stores/tabs";
import TabContext from "@src/context/tabcontext";
import MousePositionsContext from "@src/context/mousepositions";
import { Allotment, LayoutPriority } from "allotment";

export default function Music(props: { project: Project, network: Network }) {

    const { tabs } = useTabs();
    const { tab } = useContext(TabContext);
    const [layoutRef, setLayoutRef] = useState<HTMLElement | null>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const [cryptoKey, setCryptoKey] = useState(props.network.cryptoKey);
    const [room, setRoom] = useState(props.network.room);
    const [socket, setSocket] = useState(props.network.socket);

    const [mousePositions, setMousePositions] = useState<{ [id: string]: { x: number, y: number } }>({});

    function handleMouseMove(ev: React.MouseEvent) {
        if (socket) {
            broadcast(socket, cryptoKey!, 'hh:mouse-position', {
                x: ev.nativeEvent.offsetX,
                y: ev.nativeEvent.offsetY
            });
        }
    }

    function handleStopCollaboration() {
        socket?.disconnect();
        setCryptoKey(undefined);
        setRoom(undefined);
        setSocket(undefined);
        setMousePositions({});
    }

    useEffect(() => {
        return () => {
            if (!tabs.includes(tab)) {
                handleStopCollaboration();
            }
        }
    }, [tabs, socket])

    useEffect(() => {
        if (socket) {
            socket.on('hh:user-disconnected', ({ id }) => {
                console.log(`User with id=${id} disconnected`);
                setMousePositions((prevMousePositions) => {
                    const updatedMousePositions = { ...prevMousePositions };
                    delete updatedMousePositions[id];
                    return updatedMousePositions;
                });
            });

            handle(socket, cryptoKey!, 'hh:user-joined', (id, { name }) => {
                console.log(`${name} with id=${id} joined the session`);
                setMousePositions({
                    ...mousePositions,
                    [id]: { x: 0, y: 0 }
                });
            })

            handle(socket, cryptoKey!, 'hh:request-project', () => {
                console.log("Requested project");
                return props.project;
            })

            handle(socket, cryptoKey!, 'hh:mouse-position', async (id, { x, y }) => {
                setMousePositions({
                    ...mousePositions,
                    [id]: { x, y }
                });
            })
        }
    }, [socket])

    return (
        <NetworkContext.Provider value={{
            cryptoKey, setCryptoKey,
            room, setRoom,
            socket, setSocket
        }}>
            <ModalContext.Provider value={{
                modalContent, setModalContent
            }}>
                <MousePositionsContext.Provider value={{
                    mousePositions, setMousePositions
                }}>
                    <section className="music-layout" ref={ref => setLayoutRef(ref)}>
                        <Toolbar />

                        <Allotment vertical={false} separator={true} proportionalLayout={false}>
                            <Allotment.Pane priority={LayoutPriority.High}>
                                <section className="music-notes" onMouseMove={handleMouseMove}>
                                    <section className="mouse-cursors">
                                        {Object.keys(mousePositions).map(id => {
                                            const pos = mousePositions[id];
                                            return <div key={id} className="cursor" style={{ left: pos.x, top: pos.y }}>
                                                <span className="cursor-name">{id}</span>
                                            </div>
                                        })}
                                    </section>
                                </section>
                            </Allotment.Pane>
                            <Allotment.Pane snap minSize={150} maxSize={300} preferredSize={200}>
                                <section className='music-patterns'>
                                    
                                </section>
                            </Allotment.Pane>
                        </Allotment>

                        {layoutRef && <Modal
                            isOpen={!!modalContent}
                            onRequestClose={() => setModalContent(null)}
                            parentSelector={() => layoutRef}>
                            {modalContent}
                        </Modal>}
                    </section>
                </MousePositionsContext.Provider>
            </ModalContext.Provider>
        </NetworkContext.Provider>
    );
}