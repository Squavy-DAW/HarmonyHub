import ModalContext from "@src/context/modalcontext";
import NetworkContext from "@src/context/networkcontext";
import { useCallback, useContext, useEffect, useState } from "react";
import CollaborationModal from "../modal/Collaboration";
import '@styles/Toolbar.css'
import FileIcon from '@src/assets/toolbar/file.png';
import NewIcon from '@src/assets/toolbar/new.png';
import OpenIcon from '@src/assets/toolbar/open.png';
import DiskIcon from '@src/assets/toolbar/disk.png';
import BrowserIcon from '@src/assets/toolbar/browser.png';
import RecentsIcon from '@src/assets/toolbar/recents.png';
import SaveIcon from '@src/assets/toolbar/save.png';
import ExportIcon from '@src/assets/toolbar/export.png';
import EditIcon from '@src/assets/toolbar/edit.png';
import UndoIcon from '@src/assets/toolbar/undo.png';
import RedoIcon from '@src/assets/toolbar/redo.png';
import CollaborationIcon from '@src/assets/toolbar/collaboration.png';

export default function Toolbar() {

    interface ToolbarItem {
        name: string;
        icon?: string;
        items?: ToolbarItem[];
        onClick?: () => void;
    }

    const toolbarItems: ToolbarItem[] = [{
        name: 'File',
        icon: FileIcon,
        items: [{
            name: 'New',
            icon: NewIcon,
        }, {
            name: 'Open',
            icon: OpenIcon,
            items: [{
                name: 'From disk',
                icon: DiskIcon,
            }, {
                name: 'Browser storage',
                icon: BrowserIcon,
            }, {
                name: 'Recently opened',
                icon: RecentsIcon,
            }]
        }, {
            name: 'Save',
            icon: SaveIcon,
        }, {
            name: 'Export',
            icon: ExportIcon,
            items: [{
                "name": "As mp3",
            }, {
                "name": "As wav",
            }]
        }]
    }, {
        name: 'Edit',
        icon: EditIcon,
        items: [{
            name: 'Undo',
            icon: UndoIcon,
            onClick: () => console.log('undo')
        }, {
            name: 'Redo',
            icon: RedoIcon,
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

    const ToolbarItem = useCallback((props: { item: ToolbarItem }) => {
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
                {props.item.icon && <img src={props.item.icon} alt={props.item.name} height={16} />}
                <span>{props.item.name}{props.item.items && "..."}</span>
                {open && <ul className="toolbar-items-container">
                    {props.item.items?.map(child =>
                        <ToolbarItem item={child} key={`${props.item.name}/${child.name}`} />
                    )}
                </ul>}
            </li>
        )
    }, []);

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
                <img src={CollaborationIcon} alt="collaboration" height={16} />
                <span>{socket ? 'Collaborating' : 'Collaborate...'}</span>
            </li>
        </ul>

        <div className={["toolbar-overlay", toolbarOpen ? "active" : null].join(' ')} onClick={() => {
            setToolbarOpen(false);
        }} />
    </>
}