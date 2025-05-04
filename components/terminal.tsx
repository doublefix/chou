"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

// UTF-8 安全的 Base64 编码
function encodeBase64(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  const binary = Array.from(utf8Bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  return btoa(binary);
}

// UTF-8 安全的 Base64 解码
function decodeBase64(base64: string): string {
  try {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "[Base64 Decode Error]\r\n";
  }
}

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const disconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
    setStatus("disconnected");
  };

  const sendResize = () => {
    if (
      fitAddon.current &&
      terminal.current &&
      socket.current?.readyState === WebSocket.OPEN
    ) {
      const dims = fitAddon.current.proposeDimensions();
      if (dims) {
        const sizeMsg = `9${encodeBase64(
          JSON.stringify({ data: { columns: dims.cols, rows: dims.rows } })
        )}`;
        socket.current.send(sizeMsg);
      }
    }
  };

  const connect = () => {
    const namespace = searchParams.get("namespace");
    const pod = searchParams.get("pod");
    const container = searchParams.get("container");

    if (!namespace || !pod || !container) {
      console.error("Missing query parameters");
      return;
    }

    disconnect();
    setStatus("connecting");

    if (!terminal.current && terminalRef.current) {
      terminal.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#000000",
          foreground: "#f0f0f0",
        },
      });

      terminal.current.loadAddon(fitAddon.current);
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();

      terminal.current.onData((data: string) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
          socket.current.send(`0${encodeBase64(data)}`);
        }
      });
    }

    terminal.current?.write("\r\nConnecting to container...\r\n");

    const wsUrl = `ws://localhost:8081/namespace/${namespace}/pod/${pod}/container/${container}`;
    socket.current = new WebSocket(wsUrl);

    socket.current.addEventListener("open", () => {
      setStatus("connected");
      terminal.current?.write("\x1b[32m✅ Connected to container\x1b[m\r\n");
      sendResize();
    });

    socket.current.addEventListener("message", (event) => {
      if (event.data instanceof Blob) {
        event.data.arrayBuffer().then((buffer) => {
          terminal.current?.write(new TextDecoder().decode(buffer));
        });
      } else if (typeof event.data === "string") {
        const type = event.data.charAt(0);
        const payload = event.data.slice(1);

        switch (type) {
          case "1": // stdout
          case "2": // stderr
            terminal.current?.write(decodeBase64(payload));
            break;
          case "3": // system message
            terminal.current?.write(
              `\r\n\x1b[33m[System] ${decodeBase64(payload)}\x1b[m\r\n`
            );
            break;
          default:
            terminal.current?.write(
              `\r\n\x1b[31m[Unknown Message Type]\x1b[m\r\n`
            );
        }
      }
    });

    socket.current.addEventListener("close", () => {
      if (status !== "disconnected") {
        setStatus("disconnected");
        terminal.current?.write("\r\n\x1b[31m❌ Connection closed\x1b[m\r\n");
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    });

    socket.current.addEventListener("error", () => {
      setStatus("disconnected");
      terminal.current?.write("\r\n\x1b[31m⚠️ Connection error\x1b[m\r\n");
    });
  };

  useEffect(() => {
    connect();

    const handleResize = () => {
      if (fitAddon.current && terminal.current) {
        try {
          fitAddon.current.fit();
          sendResize();
        } catch (e) {
          console.error("Resize error:", e);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      disconnect();
      terminal.current?.dispose();
      terminal.current = null;
    };
  }, [searchParams]);

  return (
    <div className="h-full w-full flex flex-col bg-black">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex items-center p-2 bg-gray-800 text-white">
        <span className="mr-4">
          Status:
          <span
            className={`ml-2 ${
              status === "connected"
                ? "text-green-400"
                : status === "connecting"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
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

      {/* Terminal */}
      <div ref={terminalRef} className="flex-grow overflow-hidden" />
    </div>
  );
}
