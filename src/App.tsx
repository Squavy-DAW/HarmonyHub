import './App.css'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { useState } from 'react'
import TabProps from './model/Tab'
import '@styles/react-tabs.css'
import CloseIcon from 'remixicon-react/CloseLineIcon';
import HomeIcon from 'remixicon-react/Home2FillIcon';
import ConnectIcon from 'remixicon-react/LinkIcon';
import Music from '@components/Music'
import Home from '@components/Home'
import Connect from '@components/Connect'

function App() {

  const [tabs, setTabs] = useState<TabProps[]>([])

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Tabs style={{"display": "contents"}} onSelect={(index) => setSelectedTab(index)}>
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
              {tab.name}
              <CloseIcon size="1.2rem" className='close-btn' role="button" onClick={() => {                
                tabs.splice(i,1) && setTabs([...tabs])
              }} />
            </>
          </Tab>
        ) }
      </TabList>
      
      <TabPanel hidden={selectedTab != 0} key={"home"}>
        <Home />
      </TabPanel>
      <TabPanel hidden={selectedTab != 1} key={"connect"}>
        <Connect />
      </TabPanel>
      { tabs.map((tab, i) => 
          <TabPanel hidden={selectedTab != i+2} key={i+2}>{tab.content}</TabPanel>
      ) }
    </Tabs>
  )
}

export default App
