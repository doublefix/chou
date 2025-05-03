'use client'

import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: '#000000',
      },
    })

    terminal.open(terminalRef.current)
    terminal.write('Connecting to server...\r\n')

    const socket = new WebSocket('ws://localhost:8081/ws')

    socket.addEventListener('open', () => {
      terminal.write('✅ Connected to backend\r\n')
    })

    socket.addEventListener('message', (event) => {
      terminal.write(event.data)
    })

    socket.addEventListener('close', () => {
      terminal.write('\r\n❌ Connection closed\r\n')
    })

    socket.addEventListener('error', (err) => {
      terminal.write('\r\n⚠️ Connection error\r\n')
    })

    terminal.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data)
      }
    })

    return () => {
      terminal.dispose()
      socket.close()
    }
  }, [])

  return <div ref={terminalRef} className="h-full w-full" />
}