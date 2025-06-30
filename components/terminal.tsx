"use client";

import { useEffect, useRef, useState } from "react";
import "@xterm/xterm/css/xterm.css";

type TerminalStatus = "disconnected" | "connecting" | "connected";

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<any>(null);
  const fitAddon = useRef<any>(null);
  const socket = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<TerminalStatus>("disconnected");

  const initTerminal = async () => {
    if (terminalRef.current && !terminal.current) {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");

      terminal.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#1e1e1e",
          foreground: "#f0f0f0",
        },
      });

      fitAddon.current = new FitAddon();
      terminal.current.loadAddon(fitAddon.current);
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();

      terminal.current.onData((data: string) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
          const msg = JSON.stringify({
            type: "stdin",
            data,
          });
          socket.current.send(msg);
        }
      });
    }
  };

  const sendResize = () => {
    if (!fitAddon.current || !terminal.current || !socket.current) return;

    const dims = fitAddon.current.proposeDimensions();
    if (!dims) return;

    const msg = JSON.stringify({
      type: "resize",
      width: dims.cols,
      height: dims.rows,
    });

    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(msg);
    }
  };

  const handleResize = () => {
    if (fitAddon.current && terminal.current) {
      try {
        fitAddon.current.fit();
        sendResize();
      } catch (e) {
        console.error("调整大小出错:", e);
      }
    }
  };

  const connect = async () => {
    setStatus("connecting");

    if (socket.current) {
      socket.current.close();
    }

    await initTerminal();

    terminal.current?.writeln("\x1b[33m正在连接终端服务器...\x1b[0m");

    socket.current = new WebSocket("ws://localhost:8080/api/v1/ws");

    socket.current.onopen = () => {
      setStatus("connected");
      terminal.current?.writeln("\x1b[32m✓ 已连接到终端\x1b[0m");
      sendResize();
    };

    socket.current.onmessage = (event) => {
      terminal.current?.write(event.data);
    };

    socket.current.onclose = () => {
      setStatus("disconnected");
      terminal.current?.writeln("\x1b[31m✗ 连接已断开\x1b[0m");
    };

    socket.current.onerror = () => {
      setStatus("disconnected");
      terminal.current?.writeln("\x1b[31m⚠️ 连接发生错误\x1b[0m");
    };
  };

  useEffect(() => {
    connect();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      socket.current?.close();
      terminal.current?.dispose();
    };
  }, []);

  const statusColor = {
    connected: "text-green-400",
    connecting: "text-yellow-400",
    disconnected: "text-red-400",
  };

  const statusText = {
    connected: "已连接",
    connecting: "连接中...",
    disconnected: "已断开",
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      {/* 顶部状态栏 */}
      <div className="sticky top-0 z-10 flex items-center p-2 bg-gray-800 text-white">
        <span className="mr-4">
          连接状态:
          <span className={`ml-2 ${statusColor[status]}`}>
            {statusText[status]}
          </span>
        </span>
        <button
          onClick={connect}
          disabled={status === "connecting"}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600"
        >
          {status === "connecting" ? "正在连接..." : "重新连接"}
        </button>
      </div>

      {/* 终端容器 */}
      <div ref={terminalRef} className="flex-grow overflow-hidden" />
    </div>
  );
}