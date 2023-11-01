import Split from "react-split";
import '@styles/Music.css';
import Project from "@models/project";
import Modal from 'react-modal';
import { useEffect, useState } from "react";
import CollaborationModal from "./modal/Collaboration";
import { TypedSocket as Socket } from "@network/packets";
import { handle } from "@network/sessions";

export default function Music(props: { project: Project, networkData: {
    name: string;
    cryptoKey: CryptoKey | undefined;
    room: string | undefined;
    socket: Socket | undefined;
} }) {

    interface ToolbarItem {
        name: string;
        icon: string;
        onClick?: () => void;
        items?: ToolbarItem[];
        content?: React.ReactNode;
    }

    const toolbarItems: ToolbarItem[] = [{
        name: 'File',
        icon: '/src/assets/toolbar/file.png',
        items: [{
            name: 'New',
            icon: '/src/assets/toolbar/new.png',
            onClick: () => console.log('new')
        }, {
            name: 'Open',
            icon: '/src/assets/toolbar/open.png',
            onClick: () => console.log('open')
        }, {
            name: 'Save',
            icon: '/src/assets/toolbar/save.png',
            onClick: () => console.log('save')
        }, {
            name: 'Export',
            icon: '/src/assets/toolbar/export.png',
            onClick: () => console.log('export')
        }]
    }];

    const [layoutRef, setLayoutRef] = useState<HTMLElement | null>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const [cryptoKey, setCryptoKey] = useState(props.networkData.cryptoKey);
    const [room, setRoom] = useState(props.networkData.room);
    const [socket, setSocket] = useState(props.networkData.socket);

    async function handleCollaborateClick() {
        setModalContent((
            <CollaborationModal 
                cryptoKey={cryptoKey}
                setCryptoKey={setCryptoKey}
                room={room}
                setRoom={setRoom}
                socket={socket}
                setSocket={setSocket} />
        ));
    }

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
        <section className="music-layout" ref={ref => setLayoutRef(ref)}>
            <ul className="toolbar">
                {toolbarItems.map((item, index) =>
                    <li key={`toolbaritem[${index}]`} className="toolbar-item" onClick={() => {
                        item.onClick ? item.onClick() : null; // TODO: Add dropdown menu
                    }}>
                        <img src={item.icon} alt={item.name} height={16} />
                        <span>{item.name}{item.items && "..."}</span>
                    </li>
                )}
                <li style={{ flex: 1 }} />
                <li className={["toolbar-item collaboration", socket && 'active'].join(' ')} onClick={handleCollaborateClick}>
                    <img src="/src/assets/toolbar/collaboration.png" alt="collaboration" height={16} />
                    <span>{ socket ? 'Collaborating' : 'Collaborate...' }</span>
                </li>
            </ul>
            
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

            { layoutRef && <Modal
                isOpen={!!modalContent} 
                onRequestClose={() => setModalContent(null)}
                parentSelector={() => layoutRef}>
                {modalContent}
            </Modal> }
        </section>
    );
}