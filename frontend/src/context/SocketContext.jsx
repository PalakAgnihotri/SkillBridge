import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)
export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket]             = useState(null)
  const [onlineUsers, setOnlineUsers]         = useState([])
  const [incomingSession, setIncomingSession] = useState(null)

  useEffect(() => {
    if (!user) return

    const s = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
    })

    setSocket(s)
    s.emit('user:online', user._id)

    s.on('users:online',      (users) => setOnlineUsers(users))
    s.on('session:incoming',  (session) => setIncomingSession(session))

    return () => {
      s.disconnect()
      setSocket(null)
    }
  }, [user])

  const emit = (event, data) => socket?.emit(event, data)

  const isOnline = (userId) => onlineUsers.includes(userId)

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      incomingSession,
      setIncomingSession,
      isOnline,
      emit,
    }}>
      {children}
    </SocketContext.Provider>
  )
}
