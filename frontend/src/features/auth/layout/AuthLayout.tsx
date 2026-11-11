import type { ReactNode } from 'react'
import styles from './AuthLayout.module.css'

export default function AuthLayout({ children, label }: { children: ReactNode, label: string }) {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label={label}>
        <p className={styles.brand}>TeacherStudent</p>
        {children}
      </section>
    </main>
  )
}
