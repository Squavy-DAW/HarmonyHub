import Session from "@models/Session"
import * as Network from "@network"
import { FormEvent, useRef, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import { Peer } from "peerjs";
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {

    const displaynameRef = useRef<HTMLInputElement>(null);
    const tokenRef = useRef<HTMLTextAreaElement>(null);

    function joinSession() {
        if (!displaynameRef.current?.value) {
            toast.error("Please enter a display name", {
                autoClose: 2000,
            });
            return;
        }

        if (!tokenRef.current?.value) {
            toast.error("Please enter a session token", {
                autoClose: 2000,
            });
            return;
        }

        let token = tokenRef.current.value;
        let peer = Network.joinSession(displaynameRef.current.value, token);
        toast.success("Session joined!", {
            autoClose: 2000,
        });
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

            <ToastContainer />
        </section>
    )
}