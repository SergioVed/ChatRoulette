import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { SetupPage } from './pages/SetupPage'
import { CallPage } from './pages/CallPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/call" element={<CallPage />} />
        <Route path="/" element={<SetupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
