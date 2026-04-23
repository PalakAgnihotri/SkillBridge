import { useState } from 'react'
import api from '../api/axios'

export default function RatingModal({ session, other, onClose }) {
  const [score, setScore]     = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)

  const initials = other?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/ratings', {
        sessionId: session._id,
        rateeId:   other._id,
        score,
        comment,
      })
      setDone(true)
      setTimeout(onClose, 1500)
    } catch { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white text-xl">&times;</button>

        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">⭐</div>
            <p className="font-medium text-white">Rating submitted!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c6ff7] to-[#2dd4bf] flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <div>
                <p className="font-medium text-white text-sm">Rate your session</p>
                <p className="text-xs text-white/40">with {other?.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-3 uppercase tracking-widest">Score</label>
                <div className="flex gap-2 justify-center">
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n} onClick={() => setScore(n)}
                      className={`text-2xl transition-all ${n <= score ? 'opacity-100 scale-110' : 'opacity-30'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Comment (optional)</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  className="input resize-none h-20 text-sm"
                  placeholder="Great session! Very helpful..." maxLength={200} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {saving ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
