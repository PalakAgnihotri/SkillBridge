import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SimplePeer from 'simple-peer/simplepeer.min.js'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'

export default function VideoRoom() {
  const { roomId } = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const { socket } = useSocket()

  const localRef  = useRef(null)
  const remoteRef = useRef(null)
  const peerRef   = useRef(null)
  const streamRef = useRef(null)

  const [connected, setConnected] = useState(false)
  const [muted, setMuted]         = useState(false)
  const [camOff, setCamOff]       = useState(false)
  const [waiting, setWaiting]     = useState(true)
  const [remoteStream, setRemoteStream] = useState(null)

  useEffect(() => {
    if (!socket) return

    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]

    let localStream = null

    const createPeer = (isInitiator, partnerOffer = null) => {
      if (peerRef.current || !localStream) return

      const peer = new SimplePeer({
        initiator: isInitiator,
        trickle: true,
        stream: localStream,
        config: { iceServers }
      })

      peerRef.current = peer

      peer.on('signal', signal => {
        if (signal.type === 'offer') {
          socket.emit('webrtc:offer', { to: roomId, offer: signal })
        } else if (signal.type === 'answer') {
          socket.emit('webrtc:answer', { to: roomId, answer: signal })
        } else if (signal.candidate) {
          socket.emit('webrtc:ice', { to: roomId, candidate: signal })
        }
      })

      peer.on('error', err => console.error('Peer error:', err))

      peer.on('stream', stream => {
        setRemoteStream(stream)
        setConnected(true)
        setWaiting(false)
      })

      if (partnerOffer) peer.signal(partnerOffer)
    }

    // 1. Get local stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStream = stream
        streamRef.current = stream
        if (localRef.current) localRef.current.srcObject = stream
        
        // Join the room after camera is ready
        socket.emit('join:room', roomId)
      })
      .catch(err => console.error("Media error:", err))

    // 2. Listen for room events immediately
    socket.on('user:joined', () => {
      console.log('Partner joined the room!')
      if (localStream) createPeer(true)
    })

    socket.on('webrtc:offer', ({ offer }) => {
      console.log('Received offer from partner')
      const interval = setInterval(() => {
        if (localStream) {
          createPeer(false, offer)
          clearInterval(interval)
        }
      }, 100)
    })

    socket.on('webrtc:answer', ({ answer }) => {
      console.log('Received answer from partner')
      peerRef.current?.signal(answer)
    })

    socket.on('webrtc:ice', ({ candidate }) => {
      console.log('Received ICE candidate')
      peerRef.current?.signal(candidate)
    })

    socket.on('webrtc:end', () => {
      console.log('Call ended by partner')
      endCall()
    })

    return () => {
      socket.off('user:joined')
      socket.off('webrtc:offer')
      socket.off('webrtc:answer')
      socket.off('webrtc:ice')
      socket.off('webrtc:end')
    }
  }, [socket, roomId])

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    peerRef.current?.destroy()
    socket?.emit('webrtc:end', { to: roomId })
    navigate('/sessions')
  }

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = muted })
    setMuted(m => !m)
  }

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = camOff })
    setCamOff(c => !c)
  }

  // Ensure video elements play when stream is attached
  useEffect(() => {
    if (localRef.current && streamRef.current) {
      localRef.current.srcObject = streamRef.current
    }
  }, [streamRef.current, localRef.current])

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream
    }
  }, [remoteStream, remoteRef.current])

  return (
    <div className="min-h-screen bg-[#070710] flex flex-col items-center justify-center p-4">

      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="font-display font-bold text-white text-lg">SkillBridge Session</div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#2dd4bf]' : 'bg-[#fbbf24] animate-pulse'}`} />
            <span className="text-xs text-white/50">{connected ? 'Connected' : 'Waiting for peer...'}</span>
          </div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="relative bg-[#111118] rounded-2xl overflow-hidden aspect-video border border-white/5 shadow-2xl">
            <video 
              ref={remoteRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
            />
            {waiting && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#111118]/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#7c6ff7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Waiting for peer...</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-white/40 bg-black/40 px-2 py-1 rounded-md border border-white/5">Remote</div>
          </div>

          <div className="relative bg-[#111118] rounded-2xl overflow-hidden aspect-video border border-white/5 shadow-2xl">
            <video 
              ref={localRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1]" 
            />
            <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-white/40 bg-black/40 px-2 py-1 rounded-md border border-white/5">You</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${muted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            {muted ? '🔇' : '🎤'}
          </button>
          <button onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-xl transition-all">
            📵
          </button>
          <button onClick={toggleCam}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${camOff ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            {camOff ? '📷' : '📹'}
          </button>
        </div>

        <p className="text-center text-xs text-white/20 mt-4">
          Room ID: {roomId} · Share this page URL with your session partner to connect
        </p>
      </div>
    </div>
  )
}
