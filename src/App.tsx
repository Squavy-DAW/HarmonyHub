import Split from 'react-split'
import './App.css'
import Header from './components/Header'
import Content from './components/Content'

function App() {
  return (
    <main id='root'>
      <Header />
      <Split
        sizes={[70, 30]}
        minSize={100}
        gutterSize={1}
        snapOffset={20}
        gutterAlign=''
        direction="vertical"
        cursor="row-resize">
      <Content />
      <section />
    </Split>
    </main>
  )
}

export default App
