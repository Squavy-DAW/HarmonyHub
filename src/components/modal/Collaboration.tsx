import { extract, generateKey } from '@network/crypto';
import { createSession, createSocket } from '@network/sessions';
import { useContext, useEffect, useState } from 'react';
import { TypedSocket as Socket } from '@network/packets';
import '@styles/modal/Collaboration.css'
import NetworkContext from '@src/context/networkcontext';

export default function CollaborationModal() {
    const [inviteLink, setInviteLink] = useState<string>();

    const { cryptoKey, setCryptoKey, room, setRoom, socket, setSocket } = useContext(NetworkContext);

    useEffect(() => {
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

    async function handleCryptoKeyGeneration(): Promise<CryptoKey> {
        let key = await generateKey();
        setCryptoKey(key);
        return key;
    }

    async function handleSocketCreation(): Promise<Socket | undefined> {
        let socket = createSocket();
        setSocket(socket);
        return socket;
    }

    async function handleCreateSession(socket: Socket): Promise<string | undefined> {
        let room = await createSession(socket)
        setRoom(room);
        return room;
    }

    async function handleExtractKey(key: CryptoKey): Promise<string> {
        return await extract(key);
    }

    function handleStopCollaboration() {
        socket?.disconnect();
        setCryptoKey(undefined);
        setRoom(undefined);
        setInviteLink(undefined);
        setSocket(undefined);
    }

    let copyTimeout: number | undefined;
    function handleCopyInviteLink(event: React.MouseEvent<HTMLPreElement, MouseEvent>) {
        if (copyTimeout) clearTimeout(copyTimeout);
        navigator.clipboard.writeText(inviteLink!);
        event.currentTarget.classList.add('copied');
        copyTimeout = setTimeout(() => {
            (event.target as HTMLElement).classList.remove('copied');
        }, 1000);
    }

    return (
        <div className={['collaboration-modal', 'overlay-center', socket && 'active'].join(' ')}>
            <img src="/src/assets/collaboration-lock.png" alt="lock" className='collaboration-lock' />
            { socket && <button className='stop-collaboration' onClick={handleStopCollaboration} /> }
            <div>
                <h1 className='title' style={{ margin: 0, lineHeight: 0.9 }}>Collaborate</h1>
                <p>Securely via E2E encryption - <a href={/*TODO*/ ""}>Learn more</a></p>
            </div>
            <div>
                {socket ? <>
                    <p>Share this link with your friends to collaborate on this project:</p>
                    <pre className='invite-link' onClick={handleCopyInviteLink}>{inviteLink}</pre>
                </> : <>
                    <p>To start collaborating, click the button below to generate an invitation:</p>
                    <button className='start-collaboration' onClick={handleStartCollaboration}>Start collaboration</button>
                </>}
            </div>
        </div>
    );
};