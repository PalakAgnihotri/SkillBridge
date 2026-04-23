import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,111,247,0.12),transparent_60%)] pointer-events-none" />
      <div className="w-full max-w-md relative">

        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-3xl bg-gradient-to-r from-[#7c6ff7] to-[#2dd4bf] bg-clip-text text-transparent mb-2">
            SkillBridge
          </h1>
          <p className="text-white/50 text-sm">Sign in to find your skill matches</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="input" placeholder="you@college.edu" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-5">
          No account?{' '}
          <Link to="/register" className="text-[#a78bfa] hover:text-[#7c6ff7] transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
