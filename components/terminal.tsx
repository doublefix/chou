"use client";

import { useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import "@xterm/xterm/css/xterm.css";

// 类型定义
type TerminalStatus = "disconnected" | "connecting" | "connected";

// 状态颜色函数
const getStatusColor = (status: TerminalStatus): string => {
  switch (status) {
    case "connected":
      return "text-green-400";
    case "connecting":
      return "text-yellow-400";
    case "disconnected":
      return "text-red-400";
  }
};

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<import("@xterm/xterm").Terminal | null>(null);
  const fitAddon = useRef<import("@xterm/addon-fit").FitAddon | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<TerminalStatus>("disconnected");

  const sendResize = () => {
    if (!fitAddon.current || !terminal.current || !socket.current) return;

    const dims = fitAddon.current.proposeDimensions();
    if (!dims || dims.cols === 0 || dims.rows === 0) return;

    const resizeMsg = JSON.stringify({
      type: "resize",
      width: dims.cols,
      height: dims.rows,
    });

    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(resizeMsg);
      console.log(`[resize] cols=${dims.cols}, rows=${dims.rows}`);
    }
  };

  const debouncedResize = useRef(debounce(sendResize, 200)).current;

  const initTerminal = async () => {
    if (!terminalRef.current || terminal.current) return;

    const { Terminal } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");

    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#000000",
        foreground: "#f0f0f0",
      },
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    terminal.current.open(terminalRef.current);

    // 初次挂载时尝试 fit，直到容器尺寸可用
    const tryFit = () => {
      const width = terminalRef.current?.offsetWidth || 0;
      const height = terminalRef.current?.offsetHeight || 0;
      if (width > 0 && height > 0) {
        fitAddon.current!.fit();
        sendResize();
      } else {
        setTimeout(tryFit, 100);
      }
    };
    tryFit();

    terminal.current.onData((data) => {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: "stdin", data }));
      }
    });
  };

  const connect = async () => {
    setStatus("connecting");

    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }

    await initTerminal();
    terminal.current?.writeln("\r\nConnecting...\r\n");

    socket.current = new WebSocket("ws://localhost:8080/api/v1/ws");

    socket.current.onopen = () => {
      setStatus("connected");
      terminal.current?.writeln("\x1b[32m✓ Connected\x1b[0m");
      setTimeout(() => {
        fitAddon.current?.fit();
        sendResize();
      }, 50);
    };

    socket.current.onmessage = (e) => {
      terminal.current?.write(e.data);
    };

    socket.current.onclose = () => {
      setStatus("disconnected");
      terminal.current?.writeln("\x1b[31m✗ Connection closed\x1b[0m");
    };

    socket.current.onerror = () => {
      setStatus("disconnected");
      terminal.current?.writeln("\x1b[31m⚠️ Connection error\x1b[0m");
    };
  };

  useEffect(() => {
    connect();

    const resizeHandler = () => {
      if (fitAddon.current) {
        try {
          fitAddon.current.fit();
          debouncedResize();
        } catch (err) {
          console.error("fit() failed:", err);
        }
      }
    };

    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      socket.current?.close();
      terminal.current?.dispose();
      terminal.current = null;
      debouncedResize.cancel();
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-black">
      {/* Top status bar (English, styled like v1) */}
      <div className="sticky top-0 z-10 flex items-center p-2 bg-gray-800 text-white">
        <span className="mr-4">
          Status:
          <span className={`ml-2 ${getStatusColor(status)}`}>
            {status.toUpperCase()}
          </span>
        </span>
        <button
          onClick={connect}
          disabled={status === "connecting"}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600"
        >
          {status === "connecting" ? "Connecting..." : "Reconnect"}
        </button>
      </div>

      {/* Terminal container */}
      <div className="flex-grow overflow-hidden px-1 py-1">
        <div
          ref={terminalRef}
          className="w-full h-full rounded-lg overflow-hidden bg-black"
        />
      </div>
    </div>
  );
}