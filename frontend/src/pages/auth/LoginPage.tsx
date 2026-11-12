import AuthLayout from '../../features/auth/layout/AuthLayout.tsx'
import LoginForm from '../../features/auth/components/LoginForm.tsx'

export default function LoginPage() {
  return (
    <AuthLayout label="Log in to TeacherStudent">
      <LoginForm />
    </AuthLayout>
  )
}
