import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.08),transparent_60%)] pointer-events-none" />
      <div className="w-full max-w-md relative">

        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-3xl bg-gradient-to-r from-[#7c6ff7] to-[#2dd4bf] bg-clip-text text-transparent mb-2">
            Join SkillBridge
          </h1>
          <p className="text-white/50 text-sm">Trade skills. Grow together.</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="input" placeholder="Palak Agnihotri" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="input" placeholder="you@college.edu" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="input" placeholder="Min. 6 characters" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#a78bfa] hover:text-[#7c6ff7] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
