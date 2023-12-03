import 'react-toastify/dist/ReactToastify.css';
import '@styles/Home.css';
import OpenIcon from 'remixicon-react/ArrowRightFillIcon';
import NewIcon from 'remixicon-react/AddFillIcon';
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

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        openButton.current?.classList.remove('dragging-over');

        let file = event.target.files?.item(0);
        if (file && file.name.endsWith('.harmony')) {
            let reader = new FileReader();
            reader.onload = (event) => {
                try {
                    let project = JSON.parse(event.target?.result as string) as Project;
                    // TODO: save project to recent projects
                    setRecentProjects([project, ...recentProjects ?? []]);
                    openProject(project);
                } catch (e) {
                    console.error("Failed to open project, JSON could not parse.", e);
                    return false;
                }
            };
            reader.readAsText(file);
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

    function openProject(project: Project) {
        setTabs([...tabs, {
            name: project.name,
            content: <Music project={defaultProject} network={{
                name: "",
                room: undefined,
                socket: undefined,
            }} />
        }]);
        setTabIndex(tabs.length+1);
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
                <h1>Welcome to HarmonyHub!</h1>
            </main>

            <main id="home-controls">
                <div id='open-project'
                     className='hoverable'
                     ref={openButton}>
                    <input type="file" id="open-project-input"
                           ref={openInput}
                           onDragEnter={handleDragEnter}
                           onDragLeave={handleDragLeave}
                           onChange={handleChange} />
                    <OpenIcon size="1.2rem" />
                    <span>Open project</span>
                </div>

                <div id='new-project'
                     className='hoverable'
                     onClick={newProject}>
                    <NewIcon size="1.2rem" />
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
