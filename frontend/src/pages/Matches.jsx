import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import SessionRequestModal from '../components/SessionRequestModal'

export default function Matches() {
  const { user } = useAuth()
  const { isOnline } = useSocket()
  const [matches, setMatches]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)

  useEffect(() => {
    api.get('/matches')
      .then(res => setMatches(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#7c6ff7] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white mb-1">Skill Matches</h1>
        <p className="text-white/40 text-sm">Ranked by how well you complement each other</p>
      </div>

      {matches.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-white/30 text-sm">No matches found. Add more skills to your profile to find peers.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map(match => {
            const online = isOnline(match._id)
            const init   = match.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
            return (
              <div key={match._id} className="card p-5 hover:border-white/15 transition-all hover:-translate-y-1">

                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c6ff7] to-[#2dd4bf] flex items-center justify-center text-sm font-bold text-white">
                      {init}
                    </div>
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2dd4bf] rounded-full border-2 border-[#1a1a24]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{match.name}</p>
                    <p className="text-xs text-white/40 truncate">{match.college || 'Student'}</p>
                    {match.rating > 0 && (
                      <p className="text-xs text-[#fbbf24] mt-0.5">{'★'.repeat(Math.round(match.rating))} {match.rating}/5 ({match.totalRatings})</p>
                    )}
                  </div>
                  <span className="badge-score shrink-0">{match.matchScore}%</span>
                </div>

                {/* Skills they can teach me */}
                {match.canTeachMe?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-white/30 mb-1.5 uppercase tracking-wider">Can teach you</p>
                    <div className="flex flex-wrap gap-1">
                      {match.canTeachMe.map(s => <span key={s} className="skill-tag-want">{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Skills I can teach them */}
                {match.iCanTeach?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-white/30 mb-1.5 uppercase tracking-wider">You can teach them</p>
                    <div className="flex flex-wrap gap-1">
                      {match.iCanTeach.map(s => <span key={s} className="skill-tag-know">{s}</span>)}
                    </div>
                  </div>
                )}

                {match.bio && (
                  <p className="text-xs text-white/30 mb-4 line-clamp-2">{match.bio}</p>
                )}

                <button
                  onClick={() => setSelected(match)}
                  className="btn-primary w-full text-sm py-2"
                >
                  Request Session
                </button>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <SessionRequestModal
          match={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
