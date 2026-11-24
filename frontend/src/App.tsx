import { useContext } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { UserContext } from './shared/context/userContext.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import { SkillsSetupPage } from './pages/skills/SkillsSetupPage.tsx'
import { Chat } from './pages/call'
import { Layout } from './pages/layout.tsx'

const publicRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]

function ProtectedLayout() {
  const { token, user } = useContext(UserContext)!
  if (!token) return <Navigate to="/login" replace />

  if (!user) return <p role="status">Loading your account…</p>

  if (user.onBoardingCompleted === null) return null
  if (!user.onBoardingCompleted) return <Navigate to="/setup-skills" replace />
  return <Outlet />
}

function PublicLayout() {
  const { token, user } = useContext(UserContext)!
  if (!token) return <Outlet />

  if (!user) return <p role="status">Loading your account…</p>

  if (user.onBoardingCompleted === null) return null
  return <Navigate to={user.onBoardingCompleted ? '/' : '/setup-skills'} replace />
}

function SetupLayout() {
  const { token, user } = useContext(UserContext)!
  if (!token) return <Navigate to="/login" replace />

  if (!user) return <p role="status">Loading your account…</p>

  if (user.onBoardingCompleted == null) return null
  if (user.onBoardingCompleted) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route element={<Layout />}>
            <Route index element={<Chat />} />
          </Route>
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
