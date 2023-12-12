import Music from "@components/Music";
import { importKey } from "@network/crypto";
import { createCryptoSocket, createSocket, joinSession } from "@network/sockets";
import TabsContext from "@src/context/tabscontext";
import { useContext, useState } from "react";
import ModalContainer from "./ModalContainer";
import { defaultProject } from "@models/project";

export interface ConnectModalProps {
    room: string,
    jwkKey: string,
    onClose: () => void
}

export default function ConnectModal({ room, jwkKey, onClose }: ConnectModalProps) {
    const [userName, setUserName] = useState<string>("");
    const { setTabIndex, tabs, setTabs } = useContext(TabsContext);

    async function handleJoinSession() {
        let key = await importKey(jwkKey);
        let typedSocket = createSocket();
        if (!typedSocket) return;
        let socket = createCryptoSocket(typedSocket, key);
    
        let success = await joinSession(socket, room);
        if (!success) return;

        socket.broadcast('hh:user-joined', { name: userName });

        onClose();

        setTabs([...tabs, {
            name: "Gathering...",
            content: <Music project={{...defaultProject}} network={{
                name: userName,
                room: room,
                socket: socket
            }} />
        }]);

        setTabIndex(tabs.length+1);
    }

    return (
        <ModalContainer className={['connect-modal'].join(' ')} mode="center">
            <input type="text" placeholder="Username" value={userName} onChange={(event) => setUserName(event.target.value)} />
            <button onClick={handleJoinSession}>Continue</button>
        </ModalContainer>
    )
}