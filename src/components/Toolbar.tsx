import ModalContext from "@src/context/modalcontext";
import NetworkContext from "@src/context/networkcontext";
import { useContext } from "react";
import CollaborationModal from "./modal/Collaboration";

export default function Toolbar() {
    interface ToolbarItem {
        name: string;
        icon: string;
        items?: ToolbarItem[];
        onClick?: () => void;
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

    const { socket } = useContext(NetworkContext);
    const { setModalContent } = useContext(ModalContext);

    async function handleCollaborateClick() {
        setModalContent((
            <CollaborationModal />
        ));
    }

    return (
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
                <span>{socket ? 'Collaborating' : 'Collaborate...'}</span>
            </li>
        </ul>

    )
}