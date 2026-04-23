import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import RatingModal from '../components/RatingModal'

const STATUS_COLORS = {
  pending:   'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20',
  accepted:  'bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20',
  rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-[#7c6ff7]/10 text-[#a78bfa] border-[#7c6ff7]/20',
  cancelled: 'bg-white/5 text-white/30 border-white/10',
}

export default function Sessions() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [rateSession, setRateSession] = useState(null)
  const [filter, setFilter]       = useState('all')

  const load = () => {
    api.get('/sessions/my')
      .then(res => setSessions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await api.patch(`/sessions/${id}/status`, { status })
    load()
  }

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#7c6ff7] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white mb-1">Sessions</h1>
        <p className="text-white/40 text-sm">Manage your skill-swap requests and upcoming sessions</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'accepted', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all capitalize
              ${filter === f ? 'bg-[#7c6ff7] border-[#7c6ff7] text-white' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-white/30 text-sm">No {filter === 'all' ? '' : filter} sessions yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(session => {
            const isRequester = session.requester._id === user._id
            const other = isRequester ? session.receiver : session.requester
            const otherInit = other?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

            return (
              <div key={session._id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c6ff7] to-[#2dd4bf] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {otherInit}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-white text-sm">{other?.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[session.status]}`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mb-3">
                      {isRequester ? 'You requested' : 'Requested from you'} ·{' '}
                      {session.scheduledAt
                        ? new Date(session.scheduledAt).toLocaleString()
                        : 'No time set'} · {session.duration} min
                    </p>
                    <div className="flex gap-2 flex-wrap text-xs">
                      <span className="skill-tag-know">You teach: {session.skillOffered}</span>
                      <span className="skill-tag-want">You learn: {session.skillWanted}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {!isRequester && session.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(session._id, 'accepted')}
                          className="text-xs px-3 py-1.5 bg-[#2dd4bf]/15 text-[#2dd4bf] rounded-lg hover:bg-[#2dd4bf]/25 transition-colors">
                          Accept
                        </button>
                        <button onClick={() => updateStatus(session._id, 'rejected')}
                          className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                          Decline
                        </button>
                      </>
                    )}
                    {session.status === 'accepted' && (
                      <>
                        <button onClick={() => navigate(`/room/${session.roomId}`)}
                          className="text-xs px-3 py-1.5 bg-[#7c6ff7]/20 text-[#a78bfa] rounded-lg hover:bg-[#7c6ff7]/30 transition-colors">
                          Join Room
                        </button>
                        <button onClick={() => updateStatus(session._id, 'completed')}
                          className="text-xs px-3 py-1.5 bg-white/5 text-white/40 rounded-lg hover:bg-white/10 transition-colors">
                          Mark Done
                        </button>
                      </>
                    )}
                    {session.status === 'completed' && (
                      <button onClick={() => setRateSession({ session, other })}
                        className="text-xs px-3 py-1.5 bg-[#fbbf24]/10 text-[#fbbf24] rounded-lg hover:bg-[#fbbf24]/20 transition-colors">
                        Rate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {rateSession && (
        <RatingModal
          session={rateSession.session}
          other={rateSession.other}
          onClose={() => { setRateSession(null); load() }}
        />
      )}
    </div>
  )
}
