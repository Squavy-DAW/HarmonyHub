import './App.css'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { useState } from 'react'
import TabProps from './model/Tab'
import CloseIcon from 'remixicon-react/CloseLineIcon';
import HomeIcon from 'remixicon-react/Home2FillIcon';
import Music from '@components/Music';
import '@styles/react-tabs.css';
import '@styles/retro-wave.css';

function App() {

  const [tabs, setTabs] = useState<TabProps[]>([{
    name: "test",
    content: <Music />
  }, {
    name: "test2",
    content: <h2>test2</h2>
  }, {
    name: "test3",
    content: <h3>test3</h3>
  },])

  const [selectedTab, setSelectedTab] = useState(0);

  return <>
    <div id="crt-lines"></div>
    <div id="darken"></div>
    <div id="vignette"></div>

    <Tabs style={{ "display": "contents" }} onSelect={(index) => setSelectedTab(index)}>
      <TabList>
        <Tab key={0}>
          <HomeIcon size="1.2rem" />
        </Tab>
        {tabs.map((tab, i) =>
          <Tab key={i + 1}>
            <>
              <span>{tab.name}</span>
              <CloseIcon size="1.2rem" className='close-btn' role="button" onClick={() => {
                tabs.splice(i, 1) && setTabs([...tabs])
              }} />
            </>
          </Tab>
        )}
      </TabList>

      <TabPanel hidden={selectedTab != 0} key={0}>
        <h1>Home</h1>
      </TabPanel>
      {tabs.map((tab, i) =>
        <TabPanel hidden={selectedTab != i + 1} key={i + 1}>{tab.content}</TabPanel>
      )}
    </Tabs>
  </>
}

export default App
