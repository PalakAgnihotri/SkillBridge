import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)
export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [onlineUsers, setOnlineUsers]         = useState([])
  const [incomingSession, setIncomingSession] = useState(null)

  useEffect(() => {
    if (!user) return

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    })

    const socket = socketRef.current
    socket.emit('user:online', user._id)

    socket.on('users:online',      (users) => setOnlineUsers(users))
    socket.on('session:incoming',  (session) => setIncomingSession(session))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  const emit = (event, data) => socketRef.current?.emit(event, data)

  const isOnline = (userId) => onlineUsers.includes(userId)

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
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
