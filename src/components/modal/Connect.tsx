import Music from "@components/Music";
import Project from "@models/project";
import { importKey } from "@network/crypto";
import { broadcast, createSocket, joinSession, request } from "@network/sessions";
import { useTabs } from "@stores/tabs";
import { useState } from "react";

export interface ConnectModalProps {
    room: string,
    jwkKey: string,
    onClose: () => void
}

export default function ConnectModal(props: ConnectModalProps) {
    const [userName, setUserName] = useState<string>("");
    const { setTabIndex, tabs, setTabs } = useTabs();
    
    const { room, jwkKey } = props;

    async function handleJoinSession() {
        let key = await importKey(jwkKey);
        let socket = createSocket();
        if (!socket) return;
    
        let success = await joinSession(socket, room);
        if (!success) return;

        broadcast(socket, key, 'hh:user-joined', { name: userName });

        let project = await request(socket, key, 'hh:request-project', null);
        if (!project) return;

        props.onClose();

        setTabs([...tabs, {
            name: project.name,
            content: <Music project={project} networkData={{
                name: userName,
                cryptoKey: key,
                room: room,
                socket: socket
            }} />
        }]);

        setTabIndex(tabs.length+1);
    }

    return (
        <div className={'connect-modal'}>
            <input type="text" placeholder="Username" value={userName} onChange={(event) => setUserName(event.target.value)} />
            <button onClick={handleJoinSession}>Continue</button>
        </div>
    )
}