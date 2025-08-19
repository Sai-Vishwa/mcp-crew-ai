import './App.css'
import { BrowserRouter , Routes , Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'



function App() {

  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}/>
      </Routes>
   </BrowserRouter>
  )
}

export default App
