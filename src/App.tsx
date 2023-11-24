import './App.css';
import '@styles/react-tabs.css';
import '@styles/react-modal.css';
import '@styles/retro-wave.css';
import '@styles/react-toastify.css';
import "allotment/dist/style.css";
import '@styles/allotment.css';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import CloseIcon from 'remixicon-react/CloseLineIcon';
import HomeIcon from 'remixicon-react/Home2FillIcon';
import Home from '@components/Home';
import { ToastContainer } from 'react-toastify';
import { useTabs } from '@stores/tabs';
import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import ConnectModal from '@components/modal/Connect';
import TabContext from './context/tabcontext';
import SoundContext from './context/soundcontext';
import { createAudioEngine } from '@synth/audioengine';

function App() {

    const { tabIndex, setTabIndex, tabs, setTabs } = useTabs();

    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [effectsEnabled, setEffectsEnabled] = useState(true);
    const _effectsEnabled = useRef(effectsEnabled);

    const audioCtx = new AudioContext();
    const audioEngine = createAudioEngine();

    Modal.setAppElement('#root');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        let session = params.get('session');
        if (!session) return;

        let jwkKey = window.location.hash.slice("#key=".length);
        setModalContent((
            <ConnectModal room={session} jwkKey={jwkKey} onClose={() => setModalContent(null)} />
        ));
    }, [])

    useEffect(() => {
        const toggleEffects = (event: KeyboardEvent) => {
            if (event.key === "E") {
                console.log("toggle effects", _effectsEnabled.current);

                setEffectsEnabled(!_effectsEnabled.current);
                _effectsEnabled.current = !_effectsEnabled.current;
            }
        }

        document.addEventListener('keydown', toggleEffects);
        return () => {
            document.removeEventListener('keydown', toggleEffects);
        }
    }, [])

    return (
        <>
            {import.meta.env.DEV && effectsEnabled && <>
                <div id="crt-lines"></div>
                <div id="darken"></div>
                <div id="vignette"></div>
            </>}

            <SoundContext.Provider value={{ ctx: audioCtx, engine: audioEngine }}>
                <Tabs style={{ "display": "contents" }} onSelect={(index) => setTabIndex(index)} selectedIndex={tabIndex} forceRenderTabPanel={true}>
                    <TabList>
                        <Tab key={"home"}>
                            <HomeIcon size="1.2rem" />
                        </Tab>
                        {tabs.map((tab, i) =>
                            <Tab key={`tab[${i}]`}>
                                <>
                                    <span>{tab.name}</span>
                                    <CloseIcon size="1.2rem" className='close-btn' role="button" onClick={(event) => {
                                        event.stopPropagation();
                                        tabs.splice(i, 1);
                                        setTabs([...tabs]);
                                        setTabIndex(0);
                                    }} />
                                </>
                            </Tab>
                        )}
                    </TabList>

                    <TabPanel hidden={tabIndex != 0} key={"home"}>
                        <Home />
                    </TabPanel>
                    {tabs.map((tab, i) =>
                        <TabPanel hidden={tabIndex != i + 1} key={`tab-panel[${i}]`}>
                            <TabContext.Provider value={{ tab: tab }} >
                                {tab.content}
                            </TabContext.Provider>
                        </TabPanel>
                    )}
                </Tabs>

                <Modal
                    isOpen={!!modalContent}
                    parentSelector={() => document.body}>
                    {modalContent}
                </Modal>

                <ToastContainer autoClose={2000} />

                {import.meta.env.DEV && <div id="development">
                    <span>
                        Mode: <span style={{ color: 'red' }}>{import.meta.env.MODE}</span>
                    </span>
                    <span>
                        Effects (shift-E): <span style={{ color: 'red' }}>{effectsEnabled ? "ON" : "OFF"}</span>
                    </span>
                </div>}
            </SoundContext.Provider>
        </>
    )
}

export default App
