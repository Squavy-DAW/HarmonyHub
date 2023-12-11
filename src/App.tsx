import './App.css';
import '@styles/react-tabs.css';
import '@styles/react-modal.css';
import '@styles/retro-wave.css';
import '@styles/react-toastify.css';
import "allotment/dist/style.css";
import '@styles/allotment.css';
import { Tab as TabItem, TabList, TabPanel, Tabs } from 'react-tabs'
import CloseIcon from '@src/assets/close.png';
import HomeIcon from '@src/assets/home.png'
import Home from '@components/Home';
import { ToastContainer } from 'react-toastify';
import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import ConnectModal from '@components/modal/Connect';
import TabContext from './context/tabcontext';
import SoundContext from './context/soundcontext';
import { createAudioEngine } from '@synth/audioengine';
import TabsContext from './context/tabscontext';
import Tab from '@models/tab';

function App() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [tabIndex, setTabIndex] = useState(0);
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
            if (event.key === "E" && import.meta.env.DEV) {
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
            {effectsEnabled && <>
                <div id="crt-lines"></div>
                <div id="darken"></div>
                <div id="vignette"></div>
            </>}

            <TabsContext.Provider value={{ tabs, setTabs, tabIndex, setTabIndex }}>
                <SoundContext.Provider value={{ ctx: audioCtx, engine: audioEngine }}>
                    <Tabs style={{ "display": "contents" }} onSelect={setTabIndex} selectedIndex={tabIndex} forceRenderTabPanel={true}>
                        <TabList>
                            <TabItem key={"home"}>
                                <img className='home-icon' src={HomeIcon} />
                            </TabItem>
                            {tabs.map((tab, i) =>
                                <TabItem key={`tab[${i}]`}>
                                    <>
                                        <span>{tab.name}</span>
                                        <img src={CloseIcon} className='home-icon close-btn' role="button" onClick={(event) => {
                                            event.stopPropagation();
                                            tabs.splice(i, 1);
                                            setTabs([...tabs]);
                                            setTabIndex(0);
                                        }} />
                                    </>
                                </TabItem>
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
            </TabsContext.Provider>
        </>
    )
}

export default App
