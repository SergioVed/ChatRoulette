import AuthLayout from '../features/auth/layout/AuthLayout.tsx'
import RegisterForm from '../features/auth/components/RegisterForm.tsx'

export default function RegisterPage() {
  return (
    <AuthLayout label="Create your TeacherStudent account">
      <RegisterForm />
    </AuthLayout>
  )
}
