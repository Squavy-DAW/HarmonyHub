import Split from "react-split";
import '@styles/Music.css';
import Project from "@models/project";
import Modal from 'react-modal';
import { createRef, useEffect, useState } from "react";
import CollaborationModal from "./modal/Collaboration";
import { generateKey, extract } from "@network/crypto";

export default function Music(props: { project: Project }) {

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
    
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    useEffect(() => {
        setModalIsOpen(!!modalContent);
    }, [modalContent]);

    const [inviteLink, setInviteLink] = useState<string>();
    const [cryptoKey, setCryptoKey] = useState<CryptoKey>();

    async function handleCollaborateClick() {
        setModalContent((
            <CollaborationModal 
                cryptoKey={cryptoKey}
                setCryptoKey={setCryptoKey}
                inviteLink={inviteLink} 
                setInviteLink={setInviteLink} />
        ));
    }

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
                <li className={["toolbar-item collaboration", inviteLink && 'active'].join(' ')} onClick={handleCollaborateClick}>
                    <img src="/src/assets/toolbar/collaboration.png" alt="collaboration" height={16} />
                    <span>{ inviteLink ? 'Collaborating' : 'Collaborate...' }</span>
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
                isOpen={modalIsOpen} 
                onRequestClose={() => setModalIsOpen(false)}
                parentSelector={() => layoutRef}>
                {modalContent}
            </Modal> }
        </section>
    );
}