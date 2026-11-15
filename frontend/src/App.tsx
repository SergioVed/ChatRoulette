import { useContext } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { UserContext } from './shared/context/userContext.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import { SkillsSetupPage } from './pages/skills/SkillsSetupPage.tsx'
import {Chat} from "./pages/call";

const protectedRoutes = [
  { path: '/', element: <Chat /> },
]

const publicRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]

function ProtectedLayout() {
  const { token, completedOnBoarding } = useContext(UserContext)!

  if (!token) return <Navigate to="/login" replace />
  if (completedOnBoarding === null) return null
  if (!completedOnBoarding) return <Navigate to="/setup-skills" replace />
  return <Outlet />
}

function PublicLayout() {
  const { token, completedOnBoarding } = useContext(UserContext)!

  if (!token) return <Outlet />
  if (completedOnBoarding === null) return null
  return <Navigate to={completedOnBoarding ? '/' : '/setup-skills'} replace />
}

function SetupLayout() {
  const { token, completedOnBoarding } = useContext(UserContext)!

  if (!token) return <Navigate to="/login" replace />
  if (completedOnBoarding === null) return null
  if (completedOnBoarding) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
        <Route element={<PublicLayout />}>
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
        <Route element={<SetupLayout />}>
          <Route path="/setup-skills" element={<SkillsSetupPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
