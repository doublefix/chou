"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "@xterm/xterm/css/xterm.css";

// Types
type TerminalStatus = "disconnected" | "connecting" | "connected";
type MessageType = "0" | "1" | "2" | "3" | "9";

interface ResizePayload {
  type: "resize";
  data: {
    columns: number;
    rows: number;
  };
}

// Utility functions
const encodeBase64 = (str: string): string => {
  const utf8Bytes = new TextEncoder().encode(str);
  const binary = Array.from(utf8Bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  return btoa(binary);
};

const decodeBase64 = (base64: string): string => {
  try {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "[Base64 Decode Error]\r\n";
  }
};

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
  // Refs
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<import("@xterm/xterm").Terminal | null>(null);
  const fitAddon = useRef<import("@xterm/addon-fit").FitAddon | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  // State
  const [status, setStatus] = useState<TerminalStatus>("disconnected");
  const searchParams = useSearchParams();

  // Connection management
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
      !fitAddon.current ||
      !terminalInstance.current ||
      socket.current?.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const dims = fitAddon.current.proposeDimensions();
    if (!dims) return;

    const resizePayload: ResizePayload = {
      type: "resize",
      data: {
        columns: dims.cols,
        rows: dims.rows,
      },
    };

    const sizeMsg = `9${encodeBase64(JSON.stringify(resizePayload))}`;
    socket.current.send(sizeMsg);
  };

  const initializeTerminal = async () => {
    const { Terminal } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");

    if (!terminalInstance.current && terminalRef.current) {
      terminalInstance.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#000000",
          foreground: "#f0f0f0",
        },
      });

      fitAddon.current = new FitAddon();
      terminalInstance.current.loadAddon(fitAddon.current);
      terminalInstance.current.open(terminalRef.current);
      fitAddon.current.fit();

      terminalInstance.current.onData((data: string) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
          socket.current.send(`0${encodeBase64(data)}`);
        }
      });
    }
  };

  const handleSocketMessage = (event: MessageEvent) => {
    if (!terminalInstance.current) return;

    if (event.data instanceof Blob) {
      event.data.arrayBuffer().then((buffer) => {
        terminalInstance.current?.write(new TextDecoder().decode(buffer));
      });
      return;
    }

    if (typeof event.data !== "string") return;

    const type = event.data.charAt(0) as MessageType;
    const payload = event.data.slice(1);

    switch (type) {
      case "1":
      case "2":
        terminalInstance.current.write(decodeBase64(payload));
        break;
      case "3":
        terminalInstance.current.write(
          `\r\n\x1b[33m[System] ${decodeBase64(payload)}\x1b[m\r\n`
        );
        break;
      default:
        terminalInstance.current.write(
          `\r\n\x1b[31m[Unknown Message Type]\x1b[m\r\n`
        );
    }
  };

  const connect = async () => {
    const namespace = searchParams.get("namespace");
    const pod = searchParams.get("pod");
    const container = searchParams.get("container");

    if (!namespace || !pod || !container) {
      console.error("Missing query parameters");
      return;
    }

    disconnect();
    setStatus("connecting");

    await initializeTerminal();
    terminalInstance.current?.write("\r\nConnecting to container...\r\n");

    const wsUrl = `ws://localhost:8081/namespace/${namespace}/pod/${pod}/container/${container}`;
    socket.current = new WebSocket(wsUrl);

    // Socket event handlers
    socket.current.addEventListener("open", () => {
      setStatus("connected");
      terminalInstance.current?.write(
        "\x1b[32m✅ Connected to container\x1b[m\r\n"
      );
      sendResize();
    });

    socket.current.addEventListener("message", handleSocketMessage);

    socket.current.addEventListener("close", () => {
      if (status !== "disconnected") {
        setStatus("disconnected");
        terminalInstance.current?.write(
          "\r\n\x1b[31m❌ Connection closed\x1b[m\r\n"
        );
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    });

    socket.current.addEventListener("error", () => {
      setStatus("disconnected");
      terminalInstance.current?.write(
        "\r\n\x1b[31m⚠️ Connection error\x1b[m\r\n"
      );
    });
  };

  // Effects
  useEffect(() => {
    connect();

    const handleResize = () => {
      if (fitAddon.current && terminalInstance.current) {
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
      terminalInstance.current?.dispose();
      terminalInstance.current = null;
    };
  }, [searchParams]);

  return (
    <div className="h-full w-full flex flex-col bg-black">
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

      <div ref={terminalRef} className="flex-grow overflow-hidden" />
    </div>
  );
}
