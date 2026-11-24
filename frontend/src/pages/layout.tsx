import { Outlet } from 'react-router-dom'
import { useLogout } from '../features/auth/hooks/useLogout.tsx'
import styles from './Layout.module.css'
import {useUserContext} from "../features/shared/hooks/useUserContext.ts";

export const Layout = () => {
  const { logout } = useLogout()
  const {user} = useUserContext()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.brand}>TeacherStudent</p>
        <div className={styles.account}>
          <span>{user.name}</span>
          <button className={styles.logout} type="button" onClick={logout}>Log out</button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
