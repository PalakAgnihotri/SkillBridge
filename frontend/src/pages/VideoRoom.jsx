import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SimplePeer from 'simple-peer'
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

  useEffect(() => {
    if (!socket) return

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      streamRef.current = stream
      if (localRef.current) localRef.current.srcObject = stream

      // Initiator: create offer
      const peer = new SimplePeer({ initiator: true, trickle: false, stream })
      peerRef.current = peer

      peer.on('signal', offer => {
        socket.emit('webrtc:offer', { to: roomId, offer })
      })

      peer.on('stream', remoteStream => {
        if (remoteRef.current) remoteRef.current.srcObject = remoteStream
        setConnected(true); setWaiting(false)
      })

      // Receive answer from remote peer
      socket.on('webrtc:answer', ({ answer }) => peer.signal(answer))
      socket.on('webrtc:ice',    ({ candidate }) => peer.signal(candidate))
    })

    // If this peer is the receiver
    socket.on('webrtc:offer', ({ from, offer }) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        streamRef.current = stream
        if (localRef.current) localRef.current.srcObject = stream

        const peer = new SimplePeer({ initiator: false, trickle: false, stream })
        peerRef.current = peer

        peer.signal(offer)

        peer.on('signal', answer => {
          socket.emit('webrtc:answer', { to: from, answer })
        })

        peer.on('stream', remoteStream => {
          if (remoteRef.current) remoteRef.current.srcObject = remoteStream
          setConnected(true); setWaiting(false)
        })
      })
    })

    socket.on('webrtc:end', () => endCall())

    return () => {
      socket.off('webrtc:offer')
      socket.off('webrtc:answer')
      socket.off('webrtc:ice')
      socket.off('webrtc:end')
    }
  }, [socket])

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
          <div className="relative bg-[#111118] rounded-2xl overflow-hidden aspect-video">
            <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
            {waiting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#7c6ff7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Waiting for peer to join...</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 text-xs text-white/50 bg-black/40 px-2 py-1 rounded-lg">Remote</div>
          </div>

          <div className="relative bg-[#111118] rounded-2xl overflow-hidden aspect-video">
            <video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute bottom-3 left-3 text-xs text-white/50 bg-black/40 px-2 py-1 rounded-lg">You</div>
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
