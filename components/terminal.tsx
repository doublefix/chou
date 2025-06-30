"use client";

import { useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import "@xterm/xterm/css/xterm.css";

type TerminalStatus = "disconnected" | "connecting" | "connected";

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<any>(null);
  const fitAddon = useRef<any>(null);
  const socket = useRef<WebSocket | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const [status, setStatus] = useState<TerminalStatus>("disconnected");

  const sendResize = () => {
    if (!fitAddon.current || !terminal.current || !socket.current) return;

    let dims = fitAddon.current.proposeDimensions();
    if (!dims || dims.cols === 0 || dims.rows === 0) {
      // fallback 尺寸防止 undefined
      dims = {
        cols: terminal.current.cols,
        rows: terminal.current.rows,
      };
    }

    const msg = JSON.stringify({
      type: "resize",
      width: dims.cols,
      height: dims.rows,
    });

    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(msg);
      console.log(`[终端尺寸变化] cols=${dims.cols}, rows=${dims.rows}, 已发送 resize 消息到后端`);
    } else {
      console.warn("[WebSocket] 无法发送 resize，连接未就绪");
    }
  };

  const debouncedResize = useRef(debounce(sendResize, 200)).current;

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

      // ✅ 初次挂载时容器必须可见
      if (
        terminalRef.current.offsetWidth > 0 &&
        terminalRef.current.offsetHeight > 0
      ) {
        fitAddon.current.fit();
      }

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

      // ✅ 延迟执行 fit + resize，防止第一次为 0 尺寸
      setTimeout(() => {
        if (fitAddon.current && terminalRef.current) {
          fitAddon.current.fit();
          sendResize();
        }
      }, 50);
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

    if (terminalRef.current) {
      resizeObserver.current = new ResizeObserver(() => {
        if (fitAddon.current && terminal.current) {
          try {
            fitAddon.current.fit();
            debouncedResize();
          } catch (e) {
            console.error("ResizeObserver fit error:", e);
          }
        }
      });
      resizeObserver.current.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;

      socket.current?.close();
      terminal.current?.dispose();

      debouncedResize.cancel();
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
      <div ref={terminalRef} className="flex-grow overflow-hidden min-h-0" />
    </div>
  );
}