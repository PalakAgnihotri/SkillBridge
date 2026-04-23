import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ matches: 0, sessions: 0 })
  const [recentMatches, setRecentMatches] = useState([])

  useEffect(() => {
    api.get('/matches').then(res => {
      setRecentMatches(res.data.slice(0, 3))
      setStats(s => ({ ...s, matches: res.data.length }))
    }).catch(() => {})
    api.get('/sessions/my').then(res => {
      setStats(s => ({ ...s, sessions: res.data.length }))
    }).catch(() => {})
  }, [])

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">

      {/* Welcome hero */}
      <div className="card p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c6ff7]/10 to-[#2dd4bf]/5 pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c6ff7] to-[#2dd4bf] flex items-center justify-center text-xl font-bold text-white shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white/50 text-sm mb-1">Welcome back</p>
            <h1 className="font-display font-bold text-2xl text-white">{user?.name}</h1>
            <p className="text-white/40 text-sm mt-0.5">{user?.college || 'Add your college in profile'}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/8">
          {[
            { label: 'Skills I Know',  value: user?.skillsIKnow?.length || 0, color: '#a78bfa' },
            { label: 'Skills I Want',  value: user?.skillsIWant?.length || 0, color: '#2dd4bf' },
            { label: 'Skill Matches',  value: stats.matches,                  color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile incomplete warning */}
      {(!user?.skillsIKnow?.length || !user?.skillsIWant?.length) && (
        <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[#fbbf24] font-medium text-sm">Complete your profile to get matches</p>
            <p className="text-white/40 text-xs mt-0.5">Add skills you know and skills you want to learn</p>
          </div>
          <Link to="/profile" className="btn-primary text-sm px-4 py-2 shrink-0">Update Profile</Link>
        </div>
      )}

      {/* Recent matches preview */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-white">Your Top Matches</h2>
        <Link to="/matches" className="text-sm text-[#a78bfa] hover:text-[#7c6ff7] transition-colors">See all →</Link>
      </div>

      {recentMatches.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-white/30 text-sm">No matches yet — add skills to your profile first</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {recentMatches.map(match => {
            const init = match.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
            return (
              <div key={match._id} className="card p-5 hover:border-white/15 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c6ff7] to-[#2dd4bf] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {init}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{match.name}</p>
                    <p className="text-xs text-white/40">{match.college || 'Student'}</p>
                  </div>
                  <span className="badge-score ml-auto">{match.matchScore}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {match.canTeachMe?.slice(0,2).map(s => (
                    <span key={s} className="skill-tag-want">{s}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link to="/matches" className="card p-6 hover:border-[#7c6ff7]/40 transition-all group">
          <div className="text-2xl mb-3">🎯</div>
          <h3 className="font-display font-bold text-white mb-1">Find Matches</h3>
          <p className="text-sm text-white/40">Discover students who have what you need and need what you have</p>
        </Link>
        <Link to="/sessions" className="card p-6 hover:border-[#2dd4bf]/40 transition-all group">
          <div className="text-2xl mb-3">📅</div>
          <h3 className="font-display font-bold text-white mb-1">My Sessions</h3>
          <p className="text-sm text-white/40">View pending requests and schedule your next learning session</p>
        </Link>
      </div>

    </div>
  )
}
