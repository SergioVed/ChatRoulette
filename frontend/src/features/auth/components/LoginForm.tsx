import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin.ts'
import { isValidEmail } from '../validation.ts'
import type { LoginInput } from '../types.ts'
import styles from './AuthForm.module.css'
import loginStyles from './LoginForm.module.css'

type Field = keyof LoginInput
const fields: Field[] = ['email', 'password']

export default function LoginForm() {
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' })
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const { loading, error, submit } = useLogin()
  const errors = {
    email: isValidEmail(values.email) ? '' : 'Please enter a valid email.',
    password: !values.password ? 'Please enter your password.'
      : values.password.length > 128 ? 'Password must contain at most 128 characters.' : '',
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ email: true, password: true })
    const invalid = fields.find((field) => errors[field])
    if (invalid) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${invalid}"]`)?.focus()
      return
    }
    void submit(values)
  }

  return (
    <div className={loginStyles.form}>
      <h1 className={styles.heading}>Welcome back.</h1>
      <form noValidate onSubmit={handleSubmit} aria-busy={loading}>
        <div className={styles.fields}>
          {fields.map((field) => {
            const message = touched[field] ? errors[field] : ''
            return (
              <div className={styles.field} key={field}>
                <label htmlFor={field}>{field === 'email' ? 'Email' : 'Password'}</label>
                <input id={field} name={field} type={field}
                  autoComplete={field === 'password' ? 'current-password' : 'email'}
                  required disabled={loading} value={values[field]}
                  aria-invalid={Boolean(message)} aria-describedby={message ? `${field}-error` : undefined}
                  onBlur={() => setTouched((previous) => ({ ...previous, [field]: true }))}
                  onChange={(event) => setValues((previous) => ({ ...previous, [field]: event.target.value }))} />
                {message && <p id={`${field}-error`} className={styles.fieldError}>{message}</p>}
              </div>
            )
          })}
        </div>
        <div className={loginStyles.error} aria-live="polite" aria-atomic="true">
          {error && <p>{error}</p>}
        </div>
        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className={styles.login}>Don't have an account? <Link to="/">Register.</Link></p>
    </div>
  )
}
