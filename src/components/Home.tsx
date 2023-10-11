import Session from "@models/Session"
import * as Network from "@network"
import { useRef, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import { Peer } from "peerjs";
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
    
    const [session, setSession] = useState<Session>();
    const [peer, setPeer] = useState<Peer>();

    const tokenRef = useRef<HTMLTextAreaElement>(null);

    function launchInteractive() {
        if (!session?.name) {
            toast.error("Please enter a display name", {
                autoClose: 2000,
            });
            return;
        }


        let token = Network.createToken();
        setSession({ ...session, id: token });
        let peer = Network.createSession(session.name, token);
        setPeer(peer);

        toast.success("Session created!", {
            autoClose: 2000,
        });
    }

    function copyToken() {
        if (!session?.id) return;

        tokenRef.current?.select();
        navigator.clipboard.writeText(session?.id || "");
        toast.success("Token copied to clipboard!", {
            autoClose: 2000,
        });
    }

    return (
        <section id="home-layout">
            <header style={{gridColumn: '1 / 3'}}>
                <h1>Hello!</h1>
            </header>
            
            <aside id="session-creator">
                <form id="connect-form" onSubmit={e => {
                    e.preventDefault();
                    launchInteractive();
                }}>
                    <label htmlFor="displayname">Display name</label>
                    <input type="text" name="displayname" id="displayname" onChange={(e) => {
                        setSession({ ...session, name: e.target.value })
                    }} />

                    <label htmlFor="launch">Ready?</label>
                    <button type="submit" name="launch" id="launch">Launch session</button>

                    <label htmlFor="token">Session token <u hidden={!session?.id} onClick={copyToken}>Click to copy</u></label>
                    <textarea ref={tokenRef} name="token" id="token" className="token-input" value={session?.id} readOnly onClick={copyToken} />
                </form>

                <ToastContainer />
            </aside>

            <main id="home-projects">
                <div className="project-card">Card 1</div>
            </main>
        </section>
    )
}