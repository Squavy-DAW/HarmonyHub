import './App.css'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import '@styles/react-tabs.css'
import '@styles/react-toastify.css'
import CloseIcon from 'remixicon-react/CloseLineIcon';
import HomeIcon from 'remixicon-react/Home2FillIcon';
import ConnectIcon from 'remixicon-react/LinkIcon';
import '@styles/react-tabs.css';
import '@styles/react-modal.css';
import '@styles/retro-wave.css';
import Home from '@components/Home';
import Connect from '@components/Connect';
import { ToastContainer } from 'react-toastify';
import Modal from 'react-modal';
import { useTabs } from '@stores/tabs';
import useModal from '@stores/modal';

function App() {

  const { tabIndex, setTabIndex, tabs, setTabs } = useTabs();
  const { isModalOpen, modalContent, setModalContent } = useModal();

  return <>
    <div id="crt-lines"></div>
    <div id="darken"></div>
    <div id="vignette"></div>

    <Tabs style={{ "display": "contents" }} onSelect={(index) => setTabIndex(index)} selectedIndex={tabIndex}>
      <TabList>
        <Tab key={"home"}>
          <HomeIcon size="1.2rem" />
        </Tab>
        <Tab key={"connect"}>
          <ConnectIcon size="1.2rem" />
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
      <TabPanel hidden={tabIndex != 1} key={"connect"}>
        <Connect />
      </TabPanel>
      {tabs.map((tab, i) =>
        <TabPanel hidden={tabIndex != i + 2} key={`tab-panel[${i}]`}>{tab.content}</TabPanel>
      )}
    </Tabs>

    <Modal 
      isOpen={isModalOpen} 
      appElement={document.querySelector('#root') as HTMLElement}
      parentSelector={() => document.querySelector('#root')!}
      onRequestClose={() => setModalContent(undefined)}>
      {modalContent}
    </Modal>

    <ToastContainer autoClose={2000} />
  </>
}

export default App
