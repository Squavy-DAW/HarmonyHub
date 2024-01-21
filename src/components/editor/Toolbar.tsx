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
import CollaborationIconNotAvailable from '@src/assets/toolbar/collaboration-notavailable.png';
import ProjectContext from "@src/context/projectcontext";
import FileContext from "@src/context/filecontext";

export default function Toolbar() {

    interface ToolbarItem {
        name: string;
        icon?: string;
        items?: ToolbarItem[];
        onClick?: () => void;
    }

    const { socket } = useContext(NetworkContext);
    const { project } = useContext(ProjectContext);
    const { fileHandle, setFileHandle } = useContext(FileContext);
    const { setModalContent } = useContext(ModalContext);
    const { serverUp } = useContext(NetworkContext);

    async function handleSaveProject() {
        if (!fileHandle) {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: `${project.name}.harmony`
            });
            setFileHandle(fileHandle);
            await saveProject(fileHandle);
            return;
        }

        const state = await fileHandle.requestPermission({ mode: "readwrite" });
        if (state == "granted") {
            await saveProject(fileHandle);
        }
        else {
            console.error("Error writing file. Could not create writable");
        }
    }

    async function saveProject(fileHandle: FileSystemFileHandle) {
        const writableFile = await fileHandle.createWritable({ });
        await writableFile.truncate(0);
        await writableFile.write(JSON.stringify(project));
        await writableFile.close();
    }

    const toolbarItems: ToolbarItem[] = [{
        name: 'File',
        icon: FileIcon,
        items: [{
            name: 'New',
            icon: NewIcon
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
            onClick: handleSaveProject
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
            <li className={["toolbar-item collaboration", serverUp && socket && 'active', !serverUp && 'error'].join(' ')} onClick={handleCollaborateClick}>
                <img src={serverUp ? CollaborationIcon : CollaborationIconNotAvailable} alt="collaboration" height={16} />
                <span>{socket ? 'Collaborating' : 'Collaborate...'}</span>
            </li>
        </ul>

        <div className={["toolbar-overlay", toolbarOpen ? "active" : null].join(' ')} onClick={() => {
            setToolbarOpen(false);
        }} />
    </>
}