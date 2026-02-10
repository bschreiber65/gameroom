import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, name)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg px-4">
        <div className="w-full max-w-sm bg-dark p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-text mb-4">Check Your Email</h2>
          <p className="text-muted mb-4">
            We sent a confirmation link to <strong className="text-text">{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link to="/login" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-primary text-center mb-8">Codenames</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-dark p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-text text-center">Create Account</h2>
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded p-2 text-red-300 text-sm">
              {error}
            </div>
          )}
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your display name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
