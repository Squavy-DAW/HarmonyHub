import { SessionDTO } from "@models/session"
import * as Network from "@network/sessions"
import { useRef, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTabs } from "@stores/tabs";
import Project from "@models/project";
import Music from "./Music";
import '@styles/Home.css';

export default function Home() {

    const { tabs, setTabs, setTabIndex } = useTabs();
    
    const [session, setSession] = useState<SessionDTO>();
    const [selectedProject, setSelectedProject] = useState<Project | undefined>();

    const tokenRef = useRef<HTMLTextAreaElement>(null);

    async function launchInteractive() {
        if (!selectedProject) {
            toast.error("Please select a project");
            return;
        }

        if (!session?.name) {
            toast.error("Please enter a display name");
            return;
        }

        const socket = Network.createSocket();
        if (!socket) {
            toast.error("Failed to create socket");
            return;
        }

        const token = await Network.createSession(socket, session.name);
        if (!token) {
            toast.error("Failed to create session");
            return;
        }
        
        setSession({ id: token, socket: socket, ...session });

        toast.success("Session created!");

        setTabs([...tabs, {
            name: selectedProject.name,
            content: <Music session={{
                id: token,
                socket: socket,
                name: session.name,
            }} />
        }])

        setTabIndex(tabs.length);
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
                        <span>Select a project to continue!</span>
                        <hr />
                    </> }
                    { selectedProject && <>
                        <label htmlFor="selected-project">Selected Project</label>
                        <div id="selected-project" className="project-card" onClick={() => setSelectedProject(undefined)}>Card 1</div>
                    </> }

                    <label htmlFor="display-name">Display name</label>
                    <input type="text" name="display-name" id="display-name" onChange={(e) => {
                        setSession({ ...session, name: e.target.value })
                    }} />

                    <label htmlFor="launch">Ready?</label>
                    <button type="submit" name="launch" id="launch">Launch session</button>

                    <label htmlFor="token">Session token <u hidden={!session?.id} onClick={copyToken}>Click to copy</u></label>
                    <textarea ref={tokenRef} name="token" id="token" className="token-input" value={session?.id} readOnly onClick={copyToken} disabled={session?.id === undefined} />
                </form>
            </aside>

            <main id="home-projects">
                <div className="project-card" onClick={() => setSelectedProject({
                    name: "Project 1",
                })}>Card 1</div>
            </main>
        </section>
    )
}