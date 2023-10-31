import Split from "react-split";
import '@styles/Music.css';
import Project from "@models/project";
import useModal from "@stores/modal";
import { useState } from "react";
import { encrypt, extract, generateKey } from "@network/crypto";
import { upload } from "@network/network";

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

    const { setModalContent } = useModal();
    const [inviteLink, setInviteLink] = useState<string>();

    async function handleStartCollaboration() {
        let project = props.project;
        let key = await generateKey();
        let encrypted = await encrypt(key, project);
        let inviteUrl = await upload(encrypted);
        let inviteKey = await extract(key);
        let inviteLink = `${inviteUrl}#key=${inviteKey}`;
        setInviteLink(inviteLink);
    }

    function handleCollaborateClick() {
        setModalContent((
            <div id="collaboration-modal">
                <img src="/src/assets/collaboration-lock.png" alt="lock" width={48} />
                <div>
                    <h1 style={{margin: 0, lineHeight: 0.9}}>Collaborate</h1>
                    <p>Securely via E2E encryption - <a href={/*TODO*/ ""}>Learn more</a></p>
                </div>
                <div style={{gridColumn: '1/3'}}>
                    { inviteLink ? <>
                        <p>Share this link with your friends to collaborate on this project:</p>
                        <input type="text" value={inviteLink} readOnly />
                    </> : <>
                        <p>To start collaborating, click the button below to generate an invitation:</p>
                        <button onClick={handleStartCollaboration} />
                    </> }
                </div>
            </div>
        ));
    }

    return (
        <section id="music-layout">
            <ul id="toolbar">
                {toolbarItems.map((item, index) => 
                    <li key={`toolbaritem[${index}]`} className="toolbar-item" onClick={() => {
                        item.onClick ? item.onClick() : null; // TODO: Add dropdown menu
                    }}>
                        <img src={item.icon} alt={item.name} height={16} />
                        <span>{ item.name }{item.items && "..."}</span>
                    </li>
                )}
                <li style={{flex: 1}} />
                <li id="collaboration" className="toolbar-item" onClick={handleCollaborateClick}>
                    <img src="/src/assets/toolbar/collaboration.png" alt="collaboration" height={16} />
                    <span>Collaborate...</span>
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
                <section id="music-notes">
                    <section id="mouse-cursors"></section>
                </section>
                <section />
            </Split>
        </section>
    )
}