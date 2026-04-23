import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const POPULAR_SKILLS = [
  'React.js','Node.js','JavaScript','TypeScript','Python','Java','DSA','System Design',
  'MongoDB','MySQL','Express.js','Next.js','Spring Boot','AWS','Docker','Git',
  'Tailwind CSS','GraphQL','Redux','C++','Machine Learning','Django','Flutter','SQL'
]

export default function Profile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name:'', bio:'', college:'', skillsIKnow:[], skillsIWant:[] })
  const [knowInput, setKnowInput] = useState('')
  const [wantInput, setWantInput] = useState('')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (user) setForm({
      name: user.name || '', bio: user.bio || '', college: user.college || '',
      skillsIKnow: user.skillsIKnow || [], skillsIWant: user.skillsIWant || [],
    })
  }, [user])

  const addSkill = (list, skill, setter) => {
    const s = skill.trim()
    if (!s || form[list].includes(s)) return
    setForm(p => ({ ...p, [list]: [...p[list], s] }))
    setter('')
  }

  const removeSkill = (list, skill) =>
    setForm(p => ({ ...p, [list]: p[list].filter(s => s !== skill) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await api.put('/users/profile', form)
      updateUser(res.data)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display font-bold text-2xl text-white mb-8">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Avatar + name row */}
        <div className="card p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c6ff7] to-[#2dd4bf] flex items-center justify-center text-xl font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Full Name</label>
            <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
              className="input" placeholder="Your name" />
          </div>
        </div>

        {/* Bio + college */}
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">College / University</label>
            <input value={form.college} onChange={e => setForm(p=>({...p,college:e.target.value}))}
              className="input" placeholder="e.g. NIET, Greater Noida" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Short Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p=>({...p,bio:e.target.value}))}
              className="input resize-none h-20" placeholder="Tell peers about yourself..." maxLength={300} />
            <p className="text-xs text-white/20 mt-1 text-right">{form.bio.length}/300</p>
          </div>
        </div>

        {/* Skills I Know */}
        <div className="card p-6">
          <label className="block text-xs text-white/50 mb-3 uppercase tracking-widest">Skills I Can Teach</label>
          <div className="flex gap-2 mb-3">
            <input value={knowInput} onChange={e => setKnowInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('skillsIKnow', knowInput, setKnowInput))}
              className="input flex-1" placeholder="Type a skill and press Enter" />
            <button type="button" onClick={() => addSkill('skillsIKnow', knowInput, setKnowInput)}
              className="btn-ghost px-4 py-2 text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {form.skillsIKnow.map(s => (
              <span key={s} className="skill-tag-know flex items-center gap-1.5">
                {s}
                <button type="button" onClick={() => removeSkill('skillsIKnow', s)} className="text-white/40 hover:text-white leading-none">&times;</button>
              </span>
            ))}
          </div>
          <p className="text-xs text-white/20 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.filter(s => !form.skillsIKnow.includes(s)).slice(0,8).map(s => (
              <button type="button" key={s} onClick={() => addSkill('skillsIKnow', s, setKnowInput)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/40 hover:bg-[#7c6ff7]/15 hover:text-[#a78bfa] transition-colors border border-white/5">
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Skills I Want */}
        <div className="card p-6">
          <label className="block text-xs text-white/50 mb-3 uppercase tracking-widest">Skills I Want to Learn</label>
          <div className="flex gap-2 mb-3">
            <input value={wantInput} onChange={e => setWantInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('skillsIWant', wantInput, setWantInput))}
              className="input flex-1" placeholder="Type a skill and press Enter" />
            <button type="button" onClick={() => addSkill('skillsIWant', wantInput, setWantInput)}
              className="btn-ghost px-4 py-2 text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {form.skillsIWant.map(s => (
              <span key={s} className="skill-tag-want flex items-center gap-1.5">
                {s}
                <button type="button" onClick={() => removeSkill('skillsIWant', s)} className="text-white/40 hover:text-white leading-none">&times;</button>
              </span>
            ))}
          </div>
          <p className="text-xs text-white/20 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.filter(s => !form.skillsIWant.includes(s)).slice(0,8).map(s => (
              <button type="button" key={s} onClick={() => addSkill('skillsIWant', s, setWantInput)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/40 hover:bg-[#2dd4bf]/15 hover:text-[#5eead4] transition-colors border border-white/5">
                + {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Profile'}
        </button>

      </form>
    </div>
  )
}
