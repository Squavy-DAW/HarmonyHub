import { extract, generateKey } from '@network/crypto';
import { getSessionId } from '@network/sessions';
import '@styles/modal/Collaboration.css'
import { useEffect, useState } from 'react';

export interface CollaborationModalProps {
    cryptoKey: CryptoKey | undefined;
    setCryptoKey: (key: CryptoKey | undefined) => void;
    inviteLink: string | undefined;
    setInviteLink: (link: string | undefined) => void;
}

export default function CollaborationModal(props: CollaborationModalProps) {

    const [cryptoKey, setCryptoKey] = useState(props.cryptoKey);
    const [inviteLink, setInviteLink] = useState(props.inviteLink);

    useEffect(() => {
        props.setCryptoKey(cryptoKey);
    }, [cryptoKey]);

    useEffect(() => {
        props.setInviteLink(inviteLink);
    }, [inviteLink]);

    async function handleStartCollaboration() {
        let key = await generateKey();
        setCryptoKey(key);
        let inviteKey = await extract(key);
        let sessionId = await getSessionId();
        let inviteLink = `${import.meta.env.VITE_HARMONYHUB}/invite/?session=${sessionId}#key=${inviteKey}`;
        setInviteLink(inviteLink);
    }

    function handleStopCollaboration() {
        setInviteLink(undefined);
        setCryptoKey(undefined);
    }

    return (
        <div className={['collaboration-modal', inviteLink && 'active'].join(' ')}>
            <img src="/src/assets/collaboration-lock.png" alt="lock" width={48} />
            <div>
                <h1 className='title' style={{ margin: 0, lineHeight: 0.9 }}>Collaborate</h1>
                <p>Securely via E2E encryption - <a href={/*TODO*/ ""}>Learn more</a></p>
            </div>
            <div style={{ gridColumn: '1/3' }}>
                {inviteLink ? <>
                    <p>Share this link with your friends to collaborate on this project:</p>
                    <pre className='invite-link'>{inviteLink}</pre>
                </> : <>
                    <p>To start collaborating, click the button below to generate an invitation:</p>
                    <button onClick={handleStartCollaboration}>Start collaboration</button>
                </>}
            </div>
            { inviteLink && <div style={{ gridColumn: '1/3', display: 'flex' }}>
                <h2 style={{ margin: 0 }}>Connected:</h2>
                <ul></ul>
                <div style={{flex: 1}} />
                <button onClick={handleStopCollaboration}>Stop collaboration</button>
            </div> }
        </div>
    );
};