import Session from "@models/Session"
import * as Network from "@network"
import React, { useRef, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTabs } from "@stores/Tabs";
import Project from "@models/Project";
import Music from "./Music";
import '@styles/Home.css';

export default function Home() {

    const { tabs, setTabs } = useTabs();
    
    const [session, setSession] = useState<Session>();
    const [selectedProject, setSelectedProject] = useState<Project | undefined>();

    const tokenRef = useRef<HTMLTextAreaElement>(null);

    function launchInteractive() {
        if (!selectedProject) {
            toast.error("Please select a project", {
                autoClose: 2000,
            });
            return;
        }

        if (!session?.name) {
            toast.error("Please enter a display name", {
                autoClose: 2000,
            });
            return;
        }

        let token = Network.createToken();
        let peer = Network.createSession(session.name, token);
        setSession({ id: token, peer: peer, ...session });

        toast.success("Session created!", {
            autoClose: 2000,
        });

        setTabs([...tabs, {
            name: selectedProject.name,
            content: <Music session={session} />
        }])
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
                    { !selectedProject && <>
                        <b>Select a project to continue!</b>
                        <hr />
                    </> }
                    { selectedProject && <>
                        <label htmlFor="selected project">Selected Project</label>
                        <div className="project-card" onClick={() => setSelectedProject(undefined)}>Card 1</div>
                    </> }

                    <label htmlFor="displayname">Display name</label>
                    <input type="text" name="displayname" id="displayname" onChange={(e) => {
                        setSession({ ...session, name: e.target.value })
                    }} />

                    <label htmlFor="launch">Ready?</label>
                    <button type="submit" name="launch" id="launch">Launch session</button>

                    <label htmlFor="token">Session token <u hidden={!session?.id} onClick={copyToken}>Click to copy</u></label>
                    <textarea ref={tokenRef} name="token" id="token" className="token-input" value={session?.id} readOnly onClick={copyToken} disabled={session === undefined} />
                </form>

                <ToastContainer />
            </aside>

            <main id="home-projects">
                <div className="project-card" onClick={() => setSelectedProject({
                    name: "Project 1",
                })}>Card 1</div>
            </main>
        </section>
    )
}