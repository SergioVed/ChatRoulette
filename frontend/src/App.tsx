import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import { SkillsSetupPage } from './pages/skills/SkillsSetupPage.tsx'
import {Chat} from "./pages/call";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/setup-skills" element={<SkillsSetupPage />} />
      </Routes>
    </BrowserRouter>
  )
}
