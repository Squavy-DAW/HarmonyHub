import Split from "react-split";
import '@styles/Music.css';
import Project from "@models/project";
import Modal from 'react-modal';
import { useEffect, useState } from "react";
import { handle } from "@network/sessions";
import Network from "@models/network";
import NetworkContext from "@src/context/networkcontext";
import Toolbar from "./Toolbar";
import ModalContext from "@src/context/modalcontext";

export default function Music(props: { project: Project, network: Network }) {
    const [layoutRef, setLayoutRef] = useState<HTMLElement | null>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const [cryptoKey, setCryptoKey] = useState(props.network.cryptoKey);
    const [room, setRoom] = useState(props.network.room);
    const [socket, setSocket] = useState(props.network.socket);

    useEffect(() => {
        if (socket) {
            handle(socket, cryptoKey!, 'hh:user-joined', ({ name }) => {
                console.log(`${name} joined the session`);
            })

            handle(socket, cryptoKey!, 'hh:request-project', () => {
                console.log("Requested project");
                return props.project;
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
                <section className="music-layout" ref={ref => setLayoutRef(ref)}>
                    <Toolbar />

                    <Split
                        sizes={[70, 30]}
                        minSize={100}
                        gutterSize={5}
                        snapOffset={20}
                        gutterAlign=''
                        direction="vertical"
                        cursor="row-resize">
                        <section className="music-notes">
                            <section className="mouse-cursors"></section>
                        </section>
                        <section />
                    </Split>

                    {layoutRef && <Modal
                        isOpen={!!modalContent}
                        onRequestClose={() => setModalContent(null)}
                        parentSelector={() => layoutRef}>
                        {modalContent}
                    </Modal>}
                </section>
            </ModalContext.Provider>
        </NetworkContext.Provider>
    );
}