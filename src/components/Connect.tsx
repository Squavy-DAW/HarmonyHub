import * as Network from "@network/sessions"
import { useRef } from "react"
import { toast } from 'react-toastify';
import { useTabs } from "@stores/tabs";
import Music from "@components/Music";
import 'react-toastify/dist/ReactToastify.css';
import '@styles/Connect.css'

export default function Connect() {

    const { tabs, setTabs } = useTabs();

    const displaynameRef = useRef<HTMLInputElement>(null);
    const tokenRef = useRef<HTMLTextAreaElement>(null);

    function joinSession() {
        if (!displaynameRef.current?.value) {
            toast.error("Please enter a display name");
            return;
        }

        if (!tokenRef.current?.value) {
            toast.error("Please enter a session token");
            return;
        }

        const socket = Network.createSocket();
        if (!socket) {
            toast.error("Failed to create socket");
            return;
        }

        let token = tokenRef.current.value;
        if (!Network.joinSession(socket, displaynameRef.current.value, token)) {
            toast.error("Failed to join session");
            return;
        }

        toast.success("Session joined!");

        setTabs([...tabs, {
            name: `Remote: ${displaynameRef.current.value}`,
            content: <Music session={{
                id: token,
                socket: socket,
                name: displaynameRef.current.value,
            }} />
        }])
    }

    return (
        <section id="connect-layout">
            <h1>Connect remotely to a session</h1>

            <form id="connect-form" onSubmit={e => {
                e.preventDefault();
                joinSession();
            }}>
                <label htmlFor="displayname">Display name</label>
                <input ref={displaynameRef} type="text" name="displayname" id="displayname" />

                <label htmlFor="token">Session token</label>
                <textarea ref={tokenRef} name="token" id="token" className="token-input" />

                <button type="submit" name="launch">Connect</button>
            </form>
        </section>
    )
}