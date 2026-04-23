import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

export default function SessionRequestModal({ match, onClose }) {
  const { user }  = useAuth()
  const { emit }  = useSocket()
  const [form, setForm] = useState({
    skillOffered: user?.skillsIKnow?.[0] || '',
    skillWanted:  match.canTeachMe?.[0] || '',
    scheduledAt:  '',
    duration:     60,
    notes:        '',
  })
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await api.post('/sessions', {
        receiverId:   match._id,
        skillOffered: form.skillOffered,
        skillWanted:  form.skillWanted,
        scheduledAt:  form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        duration:     form.duration,
        notes:        form.notes,
      })
      emit('session:request', { to: match._id, session: res.data })
      setDone(true)
      setTimeout(onClose, 1800)
    } catch { setSending(false) }
  }

  const initials = match.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white text-xl leading-none">&times;</button>

        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-medium text-white">Request sent to {match.name}!</p>
            <p className="text-sm text-white/40 mt-1">They'll be notified if they're online</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c6ff7] to-[#2dd4bf] flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <div>
                <p className="font-medium text-white text-sm">Request session with {match.name}</p>
                <p className="text-xs text-white/40">Match score: {match.matchScore}%</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">I will teach</label>
                <select value={form.skillOffered}
                  onChange={e => setForm(p=>({...p,skillOffered:e.target.value}))}
                  className="input">
                  {(user?.skillsIKnow || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">I want to learn</label>
                <select value={form.skillWanted}
                  onChange={e => setForm(p=>({...p,skillWanted:e.target.value}))}
                  className="input">
                  {(match.canTeachMe || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Date & Time</label>
                  <input type="datetime-local" value={form.scheduledAt}
                    onChange={e => setForm(p=>({...p,scheduledAt:e.target.value}))}
                    className="input" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Duration (min)</label>
                  <select value={form.duration}
                    onChange={e => setForm(p=>({...p,duration:+e.target.value}))}
                    className="input">
                    {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Message (optional)</label>
                <textarea value={form.notes}
                  onChange={e => setForm(p=>({...p,notes:e.target.value}))}
                  className="input resize-none h-16 text-sm"
                  placeholder="Hi! I'd love to swap skills with you..." />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
                {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {sending ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
