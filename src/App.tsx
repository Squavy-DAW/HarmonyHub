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
import MouseMoveContext from './context/mousemove';

function App() {

  const { tabIndex, setTabIndex, tabs, setTabs } = useTabs();

  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [mouseDelta, setMouseDelta] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [propagating, _setPropagating] = useState<boolean>(true);
  const propagatingRef = useRef(propagating);

  Modal.setAppElement('#root');

  function setPropagating(value: boolean) {
    propagatingRef.current = value;
    _setPropagating(value);
  }

  function handleMouseMove(ev: MouseEvent) {
    if (!propagatingRef.current) return;
    setMouseDelta({
      x: ev.movementX,
      y: ev.movementY
    });
    setMousePosition({
      x: ev.clientX,
      y: ev.clientY
    });
  }

  function handleMouseDown(_ev: MouseEvent) {
    if (!propagatingRef.current) return;
    setMouseDown(true);
  }

  function handleMouseUp(_ev: MouseEvent) {
    if (!propagatingRef.current) return;
    setMouseDown(false);
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let session = params.get('session');
    if (!session) return;

    let jwkKey = window.location.hash.slice("#key=".length);
    setModalContent((
      <ConnectModal room={session} jwkKey={jwkKey} onClose={() => setModalContent(null)} />
    ));
  }, [])

  return (
    <>
      <div id="crt-lines"></div>
      <div id="darken"></div>
      <div id="vignette"></div>

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
              <MouseMoveContext.Provider value={{
                mousePosition, mouseDelta, mouseDown, propagating, setPropagating
              }}>
                {tab.content}
              </MouseMoveContext.Provider>
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
    </>
  )
}

export default App
