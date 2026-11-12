import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Chat from './features/chat/Chat'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { SetupPage } from './pages/SetupPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
