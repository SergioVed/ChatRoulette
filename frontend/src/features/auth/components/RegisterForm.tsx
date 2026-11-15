import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useRegistration } from '../hooks/useRegistration.ts'
import type { RegistrationInput } from '../types.ts'
import styles from './AuthForm.module.css'
import { isValidEmail } from '../validation.ts'

type Field = keyof RegistrationInput
const fields: Field[] = ['name', 'email', 'password']
const labels = { name: 'Name', email: 'Email', password: 'Password' }

function validate(values: RegistrationInput): Record<Field, string> {
  return {
    name: values.name.trim() ? '' : 'Please enter your name.',
    email: isValidEmail(values.email) ? '' : 'Please enter a valid email.',
    password: values.password.length >= 8 && values.password.length <= 128 ? '' : 'Password must contain 8–128 characters.',
  }
}

export default function RegisterForm() {
  const [values, setValues] = useState<RegistrationInput>({ name: '', email: '', password: '' })
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const { loading, error, submit } = useRegistration()
  const errors = validate(values)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ name: true, email: true, password: true })
    const invalid = fields.find((field) => errors[field])
    if (invalid) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${invalid}"]`)?.focus()
      return
    }
    void submit(values)
  }

  return (
    <>
      <h1 className={styles.heading}>Create account</h1>
      <form noValidate onSubmit={handleSubmit} aria-busy={loading}>
        <div className={styles.fields}>
          {fields.map((field) => {
            const message = touched[field] ? errors[field] : ''
            return (
              <div className={styles.field} key={field}>
                <label htmlFor={field}>{labels[field]}</label>
                <input id={field} name={field} type={field === 'name' ? 'text' : field}
                  autoComplete={field === 'password' ? 'new-password' : field}
                  required disabled={loading} value={values[field]}
                  aria-invalid={Boolean(message)} aria-describedby={message ? `${field}-error` : undefined}
                  onBlur={() => setTouched((previous) => ({ ...previous, [field]: true }))}
                  onChange={(event) => setValues((previous) => ({ ...previous, [field]: event.target.value }))} />
                {message && <p id={`${field}-error`} className={styles.fieldError}>{message}</p>}
              </div>
            )
          })}
        </div>
        {error && <p role="alert" className={styles.serverError}>{error}</p>}
        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className={styles.login}>Already have an account? <Link to="/login">Log in</Link>.</p>
    </>
  )
}
