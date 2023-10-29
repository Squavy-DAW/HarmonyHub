import './App.css'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import '@styles/react-tabs.css'
import '@styles/react-toastify.css'
import CloseIcon from 'remixicon-react/CloseLineIcon';
import HomeIcon from 'remixicon-react/Home2FillIcon';
import '@styles/react-tabs.css';
import '@styles/retro-wave.css';
import ConnectIcon from 'remixicon-react/LinkIcon';
import Home from '@components/Home';
import Connect from '@components/Connect';
import { useTabs } from '@stores/tabs';
import { ToastContainer } from 'react-toastify';

function App() {

  const { tabIndex, setTabIndex, tabs, setTabs } = useTabs();
  
  return <>
    <div id="crt-lines"></div>
    <div id="darken"></div>
    <div id="vignette"></div>

    <Tabs id='content' style={{"display": "contents"}} onSelect={(index) => setTabIndex(index)}>
      <TabList>
        <Tab key={"home"}>
          <HomeIcon size="1.2rem" />
        </Tab>
        <Tab key={"connect"}>
          <ConnectIcon size="1.2rem" />
        </Tab>
        { tabs.map((tab, i) => 
          <Tab key={i+2}>
            <>
              <span>{tab.name}</span>
              <CloseIcon size="1.2rem" className='close-btn' role="button" onClick={() => {
                tabs.splice(i, 1) && setTabs([...tabs])
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
      { tabs.map((tab, i) => 
          <TabPanel hidden={tabIndex != i+2} key={i+2}>{tab.content}</TabPanel>
      ) }
    </Tabs>

    <ToastContainer autoClose={2000} />
  </>
}

export default App
