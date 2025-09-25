import './App.css'
import { BrowserRouter , Routes , Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'
// import ChatInterface from './pages/DummyPage'
// import DummyPage from './pages/DummyPage'
// import ChatHistorySidebar from './components/ChatPage/PreviousChat'


function App() {

  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}/>
        <Route path="/chat-page" element={<ChatPage />}/>
        <Route path='/admin' element={<AdminPage/>} />
        {/* <Route path='/dummy' element={<ChatHistorySidebar />} /> */}

        {/* <Route path='/dummy' element={<ChatInterface />} /> */}
      </Routes>
   </BrowserRouter>
  )
}

export default App
