import Music from "@components/Music";
import { importKey } from "@network/crypto";
import { createCryptoSocket, createSocket, joinSession } from "@network/sockets";
import TabsContext from "@src/context/tabscontext";
import { useContext, useState } from "react";

export interface ConnectModalProps {
    room: string,
    jwkKey: string,
    onClose: () => void
}

export default function ConnectModal(props: ConnectModalProps) {
    const [userName, setUserName] = useState<string>("");
    const { setTabIndex, tabs, setTabs } = useContext(TabsContext);
    
    const { room, jwkKey } = props;

    async function handleJoinSession() {
        let key = await importKey(jwkKey);
        let typedSocket = createSocket();
        if (!typedSocket) return;
        let socket = createCryptoSocket(typedSocket, key);
    
        let success = await joinSession(socket, room);
        if (!success) return;

        socket.broadcast('hh:user-joined', { name: userName });

        let project = await socket.request('hh:request-project', null);
        console.log("Received project: ", project);
        
        if (!project) return;

        props.onClose();

        setTabs([...tabs, {
            name: project.name,
            content: <Music project={project} network={{
                name: userName,
                room: room,
                socket: socket
            }} />
        }]);

        setTabIndex(tabs.length+1);
    }

    return (
        <div className={['connect-modal', 'overlay-center'].join(' ')}>
            <input type="text" placeholder="Username" value={userName} onChange={(event) => setUserName(event.target.value)} />
            <button onClick={handleJoinSession}>Continue</button>
        </div>
    )
}