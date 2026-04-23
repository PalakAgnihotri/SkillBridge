import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/matches',   label: 'Find Matches' },
  { to: '/sessions',  label: 'Sessions' },
  { to: '/profile',   label: 'Profile' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">

        {/* Logo */}
        <NavLink to="/dashboard" className="font-display font-extrabold text-xl bg-gradient-to-r from-[#7c6ff7] to-[#2dd4bf] bg-clip-text text-transparent tracking-tight">
          SkillBridge
        </NavLink>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* User avatar + logout */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6ff7] to-[#2dd4bf] flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <button onClick={handleLogout} className="text-xs text-white/40 hover:text-white/70 transition-colors">
            Logout
          </button>
        </div>

      </div>
    </nav>
  )
}
