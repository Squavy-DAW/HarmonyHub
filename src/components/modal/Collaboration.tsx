import { extract, generateKey } from '@network/crypto';
import { createCryptoSocket, createSession, createSocket } from '@network/sockets';
import { useContext, useEffect, useState } from 'react';
import '@styles/modal/Collaboration.css'
import NetworkContext from '@src/context/networkcontext';
import ModalContainer from './ModalContainer';
import { debounce } from 'throttle-debounce';

export default function CollaborationModal() {
    const [inviteLink, setInviteLink] = useState<string>();

    const { socket, setSocket, room, setRoom, username, setUsername } = useContext(NetworkContext);

    useEffect(() => {
        if (socket?.key) {
            handleExtractKey(socket.key).then((key) => {
                let inviteLink = `${import.meta.env.VITE_HARMONYHUB}/?session=${room}#key=${key}`;
                setInviteLink(inviteLink);
            });
        }
    }, [socket, room]);

    async function handleStartCollaboration() { // todo add error handling
        let key = await generateKey();
        if (!key) return;

        let socket = await createSocket();
        if (!socket) return;

        let room = await createSession(socket);
        if (!room) return;

        setRoom(room);
        setSocket(createCryptoSocket(socket, key));
    }

    async function handleExtractKey(key: CryptoKey): Promise<string> {
        return await extract(key);
    }

    function handleStopCollaboration() {
        socket?.disconnect();
        setSocket(undefined);
    }

    let copyTimeout: NodeJS.Timeout;
    function handleCopyInviteLink(event: React.MouseEvent<HTMLPreElement, MouseEvent>) {
        if (copyTimeout) clearTimeout(copyTimeout);
        navigator.clipboard.writeText(inviteLink!);
        event.currentTarget.classList.add('copied');
        copyTimeout = setTimeout(() => {
            (event.target as HTMLElement).classList.remove('copied');
        }, 1000);
    }

    const handleSetUsername = debounce(1000, function (event: React.ChangeEvent<HTMLInputElement>) {
        setUsername(event.target.value);
        socket?.broadcast('hh:username-update', {
            name: event.target.value
        })
    });

    return (
        <ModalContainer className={['collaboration-modal', socket ? 'active' : null].join(' ')} mode='center'>
            <div className='collaboration-lock' />
            {socket && <button className='stop-collaboration' onClick={handleStopCollaboration} />}
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
            <div className='username-input'>
                <input type='text' placeholder='Username' onChange={handleSetUsername} />
            </div>
        </ModalContainer>
    );
};