import { extract, generateKey } from '@network/crypto';
import { checkServerUp, createCryptoSocket, createSession, createSocket } from '@network/sockets';
import { useCallback, useContext, useEffect, useState } from 'react';
import '@styles/modal/Collaboration.css'
import NetworkContext from '@src/context/networkcontext';
import ModalContainer from './ModalContainer';
import { debounce } from 'throttle-debounce';

export default function CollaborationModal() {
    const [inviteLink, setInviteLink] = useState<string>();

    const { socket, setSocket, room, setRoom, username, setUsername, serverUp } = useContext(NetworkContext);

    useEffect(() => {
        if (socket?.key) {
            handleExtractKey(socket.key).then((key) => {
                const inviteLink = `${import.meta.env.VITE_HARMONYHUB}/?session=${room}#key=${key}`;
                window.history.pushState({}, '', inviteLink);
                setInviteLink(inviteLink);
            });
        }
    }, [socket, room]);

    async function handleStartCollaboration() { // todo add error handling
        if (!await checkServerUp()) return;

        const ns = await createSession();
        if (!ns) return;

        const socket = await createSocket(ns);
        if (!socket) return;

        const key = await generateKey();
        if (!key) return;

        setRoom(ns);
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

    const sendUsernameUpdate = useCallback(debounce(1000, function (name: string) {
        socket?.broadcast('sqw:username-update', {
            name: name
        })
    }), [socket])

    function handleSetUsername(event: React.ChangeEvent<HTMLInputElement>) {
        setUsername(event.target.value);
        sendUsernameUpdate(event.target.value);
    }

    return (
        <ModalContainer className={['collaboration-modal', serverUp && socket && 'active', !serverUp && 'error'].join(' ')} mode='center'>
            <div className='collaboration-lock' />
            {serverUp ?
                <>
                    {socket && <button className='stop-collaboration' onClick={handleStopCollaboration} />}
                    <div>
                        <h1 className='title'>Collaborate</h1>
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
                        <input type='text' placeholder='Username' value={username} onChange={handleSetUsername} />
                    </div>
                </> : <>
                    <h1 className='title'>Collaborate</h1>
                    <p>Sorry, the server is currently offline. Please try again later.</p>
                </>
            }
        </ModalContainer>
    );
};