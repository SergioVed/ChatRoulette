import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import { CallPage } from './pages/call/CallPage.tsx'
import {Chat} from "./pages/call";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/call" element={<CallPage />} />
        <Route path="/" element={<Chat />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
