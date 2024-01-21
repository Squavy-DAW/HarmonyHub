import 'react-toastify/dist/ReactToastify.css';
import '@styles/Home.css';
import OpenIcon from '@src/assets/forward.png';
import NewIcon from '@src/assets/plus.png';
import { createRef, useContext, useEffect, useState } from 'react';
import Project, { defaultProject } from '@models/project';
import Music from './Music';
import AsciiLogo from './AsciiLogo';
import TabsContext from '@src/context/tabscontext';

export default function Home() {

    const { tabs, setTabs, setTabIndex } = useContext(TabsContext);

    const [recentProjects, setRecentProjects] = useState<Project[]>();

    useEffect(() => {
        // load recent projects
    });

    const openButton = createRef<HTMLDivElement>();
    const openInput = createRef<HTMLInputElement>();

    function handleDragLeave(event: React.DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        openButton.current?.classList.remove('dragging-over');
    }

    function handleDragEnter(event: React.DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        openButton.current?.classList.add('dragging-over');
    }

    async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        openButton.current?.classList.remove('dragging-over');

        let file = event.target.files?.item(0);
        if (file && file.name.endsWith('.harmony')) {
            const project = JSON.parse(await file.text()) as Project;
            setRecentProjects([project, ...recentProjects ?? []]);
            setTabs([...tabs, {
                name: project.name,
                content: <Music project={project} network={{
                    name: "",
                    room: undefined,
                    socket: undefined,
                }} fileHandle={undefined /* Todo: get filehandle to save without dialog */} /> // To do this, create custom input field with support for new FileSystem API
            }]);
            setTabIndex(tabs.length+1);
        }
        else {
            console.error("Failed to open project, file was not accepted. Valid files are .harmony files");
            openButton.current?.classList.add('error');
            setTimeout(() => {
                openButton.current?.classList.remove('error');
            }, 1500);
        }

        event.target.value = '';
    }

    function newProject() {
        // i smell ✨magic✨, maybe there'll be a wizard?
        setTabs([...tabs, {
            name: 'New Project',
            content: <Music project={defaultProject} network={{
                name: "",
                room: undefined,
                socket: undefined,
            }} />
        }]);
        setTabIndex(tabs.length+1);
    }

    return (
        <section id="home-layout">
            <AsciiLogo />

            <main id="home-title">
                <h1>Welcome to SquidWave!</h1>
            </main>

            <main id="home-controls">
                <div id='open-project'
                     className='hoverable'
                     ref={openButton}>
                    <input type="file" id="open-project-input"
                           ref={openInput}
                           accept='.harmony'
                           onDragEnter={handleDragEnter}
                           onDragLeave={handleDragLeave}
                           onChange={handleChange} />
                    <img src={OpenIcon} className='open-icon' role="button" />
                    <span>Open project</span>
                </div>

                <div id='new-project'
                     className='hoverable'
                     onClick={newProject}>
                    <img src={NewIcon} className='new-icon' role="button" />
                    <span>Create new</span>
                </div>

                {/* <h3>Recently opened</h3>

                <ul id='recently-opened'>
                    {recentProjects.map((project, index) =>
                        <li key={`recent-project[${index}]`} className='recent-project hoverable'>
                            <span style={{fontSize: '1.2em'}}>{project.name}</span>
                            <span>{project.description}</span>
                        </li>
                    )}
                </ul> */}
            </main>
        </section>
    )
}
