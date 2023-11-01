import { extract, generateKey } from '@network/crypto';
import { createSession, createSocket } from '@network/sessions';
import { useEffect, useState } from 'react';
import { TypedSocket as Socket } from '@network/packets';
import '@styles/modal/Collaboration.css'

export interface CollaborationModalProps {
    cryptoKey: CryptoKey | undefined;
    setCryptoKey: (key: CryptoKey | undefined) => void;
    room: string | undefined;
    setRoom: (room: string | undefined) => void;
    socket: Socket | undefined;
    setSocket: (socket: Socket | undefined) => void;
}

export default function CollaborationModal(props: CollaborationModalProps) {
    const [cryptoKey, setCryptoKey] = useState(props.cryptoKey);
    const [room, setRoom] = useState(props.room);
    const [inviteLink, setInviteLink] = useState<string>();
    const [socket, setSocket] = useState(props.socket);

    useEffect(() => {
        props.setCryptoKey(cryptoKey);
        props.setRoom(room);
        props.setSocket(socket);

        if (cryptoKey) {
            handleExtractKey(cryptoKey).then((key) => {
                let inviteLink = `${import.meta.env.VITE_HARMONYHUB}/?session=${room}#key=${key}`;
                setInviteLink(inviteLink);
            });
        }
    }, [cryptoKey, room, socket]);

    async function handleStartCollaboration() {
        await handleCryptoKeyGeneration();
        let socket = await handleSocketCreation();
        if (!socket) return;
        let room = await handleCreateSession(socket);
        if (!room) return;
    }

    async function handleCryptoKeyGeneration() : Promise<CryptoKey> {
        let key = await generateKey();
        setCryptoKey(key);
        return key;
    }

    async function handleSocketCreation() : Promise<Socket | undefined> {
        let socket = createSocket();
        setSocket(socket);
        return socket;
    }

    async function handleCreateSession(socket: Socket) : Promise<string | undefined> {
        let room = await createSession(socket)
        setRoom(room);
        return room;
    }

    async function handleExtractKey(key: CryptoKey) : Promise<string> {
        return await extract(key);
    }

    function handleStopCollaboration() {
        socket?.disconnect();
        setCryptoKey(undefined);
        setRoom(undefined);
        setInviteLink(undefined);
        setSocket(undefined);
    }

    let copyTimeout : number | undefined;
    function handleCopyInviteLink(event: React.MouseEvent<HTMLPreElement, MouseEvent>) {
        if (copyTimeout) clearTimeout(copyTimeout);
        navigator.clipboard.writeText(inviteLink!);
        event.currentTarget.classList.add('copied');
        copyTimeout = setTimeout(() => {
            (event.target as HTMLElement)?.classList.remove('copied');
        }, 1000);
    }

    return (
        <div className={['collaboration-modal', socket && 'active'].join(' ')}>
            <img src="/src/assets/collaboration-lock.png" alt="lock" width={48} />
            <div>
                <h1 className='title' style={{ margin: 0, lineHeight: 0.9 }}>Collaborate</h1>
                <p>Securely via E2E encryption - <a href={/*TODO*/ ""}>Learn more</a></p>
            </div>
            <div style={{ gridColumn: '1/3' }}>
                {socket ? <>
                    <p>Share this link with your friends to collaborate on this project:</p>
                    <pre className='invite-link' onClick={handleCopyInviteLink}>{inviteLink}</pre>
                </> : <>
                    <p>To start collaborating, click the button below to generate an invitation:</p>
                    <button onClick={handleStartCollaboration}>Start collaboration</button>
                </>}
            </div>
            { socket && <div style={{ gridColumn: '1/3', display: 'flex' }}>
                <div style={{flex: 1}} />
                <button onClick={handleStopCollaboration}>Stop collaboration</button>
            </div> }
        </div>
    );
};