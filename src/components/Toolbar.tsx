import ModalContext from "@src/context/modalcontext";
import NetworkContext from "@src/context/networkcontext";
import { useContext, useEffect, useState } from "react";
import CollaborationModal from "./modal/Collaboration";
import '@styles/Toolbar.css'

export default function Toolbar() {

    interface ToolbarItem {
        name: string;
        icon?: string;
        items?: ToolbarItem[];
        onClick?: () => void;
    }

    const toolbarItems: ToolbarItem[] = [{
        name: 'File',
        icon: '/src/assets/toolbar/file.png',
        items: [{
            name: 'New',
            icon: '/src/assets/toolbar/new.png',
        }, {
            name: 'Open',
            icon: '/src/assets/toolbar/open.png',
            items: [{
                name: 'From disk',
                icon: '/src/assets/toolbar/disk.png',
            }, {
                name: 'Browser storage',
                icon: '/src/assets/toolbar/browser.png',
            }, {
                name: 'Recently opened',
                icon: '/src/assets/toolbar/recents.png',
            }]
        }, {
            name: 'Save',
            icon: '/src/assets/toolbar/save.png',
        }, {
            name: 'Export',
            icon: '/src/assets/toolbar/export.png',
            items: [{
                "name": "As mp3",
            }, {
                "name": "As wav",
            }]
        }]
    }, {
        name: 'Edit',
        icon: '/src/assets/toolbar/edit.png',
        items: [{
            name: 'Undo',
            icon: '/src/assets/toolbar/undo.png',
            onClick: () => console.log('undo')
        }, {
            name: 'Redo',
            icon: '/src/assets/toolbar/redo.png',
            onClick: () => console.log('redo')
        }]
    }];

    const { socket } = useContext(NetworkContext);
    const { setModalContent } = useContext(ModalContext);

    async function handleCollaborateClick() {
        setModalContent((
            <CollaborationModal />
        ));
    }

    const [toolbarOpen, setToolbarOpen] = useState(false);
    const [currentToolbarItem, setCurrentToolbarItem] = useState<ToolbarItem | undefined>(undefined);

    useEffect(() => {
        if (!toolbarOpen) {
            setCurrentToolbarItem(undefined);
        }
    }, [toolbarOpen])

    function ToolbarItem(props: { item: ToolbarItem }) {
        const [open, setOpen] = useState(false);

        return (
            <li className={["toolbar-item", open ? "active" : ''].join(' ')} onClick={(ev) => {
                ev.stopPropagation();
                props.item.onClick ? props.item.onClick() : null;
                setToolbarOpen(false);
            }} onMouseEnter={() => {
                if (props.item.items) {
                    setOpen(true);
                }
            }} onMouseLeave={() => {
                if (props.item.items) {
                    setOpen(false);
                }
            }}>
                { props.item.icon &&
                    <img src={props.item.icon} alt={props.item.name} height={16} /> }
                <span>{props.item.name}{props.item.items && "..."}</span>
                {open && <ul className="toolbar-items-container">
                    {props.item.items?.map(child =>
                        <ToolbarItem item={child} key={`${props.item.name}/${child.name}`} />
                    )}
                </ul>}
            </li>
        )
    }

    return <>
        <ul className={["toolbar", toolbarOpen ? "active" : null].join(' ')}>
            {toolbarItems.map(item =>
                <li key={`toolbaritem[${item.name}]`} className={["toolbar-item", currentToolbarItem?.name == item.name ? "active" : ''].join(' ')} onClick={(ev) => {
                    ev.stopPropagation();
                    setCurrentToolbarItem(item);
                    item.items && setToolbarOpen(!toolbarOpen);
                    item.onClick ? item.onClick() : null;
                }} onMouseEnter={() => {
                    if (toolbarOpen && currentToolbarItem?.name != item.name) {
                        setCurrentToolbarItem(item);
                    }
                }}>
                    <img src={item.icon} alt={item.name} height={16} />
                    <span>{item.name}{item.items && "..."}</span>
                    {currentToolbarItem?.name == item.name && toolbarOpen &&
                        <ul className="toolbar-items-container-toplevel">
                            {item.items?.map(child =>
                                <ToolbarItem item={child} key={`${item.name}/${child.name}`} />
                            )}
                        </ul>
                    }
                </li>
            )}
            <li style={{ flex: 1 }} />
            <li className={["toolbar-item collaboration", socket && 'active'].join(' ')} onClick={handleCollaborateClick}>
                <img src="/src/assets/toolbar/collaboration.png" alt="collaboration" height={16} />
                <span>{socket ? 'Collaborating' : 'Collaborate...'}</span>
            </li>
        </ul>

        <div className={["toolbar-overlay", toolbarOpen ? "active" : null].join(' ')} onClick={() => {
            setToolbarOpen(false);
        }} />
    </>
}