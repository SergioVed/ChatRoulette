import { useContext } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { UserContext } from './shared/context/userContext.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import { SkillsSetupPage } from './pages/skills/SkillsSetupPage.tsx'
import {Chat} from "./pages/call";

const protectedRoutes = [
  { path: '/', element: <Chat /> },
  { path: '/setup-skills', element: <SkillsSetupPage /> },
]

const publicRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]

export default function App() {
  const { token } = useContext(UserContext)!

  return (
    <BrowserRouter>
      <Routes>
        {protectedRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={token ? element : <Navigate to="/login" replace />} />
        ))}
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={token ? <Navigate to="/" replace /> : element} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}
