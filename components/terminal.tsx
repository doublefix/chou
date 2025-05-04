"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

function decodeBase64(base64: string): string {
  try {
    return atob(base64);
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

  const namespace = searchParams.get("namespace");
  const pod = searchParams.get("pod");
  const container = searchParams.get("container");

  const disconnect = useCallback(() => {
    setStatus("disconnected");
    reconnectTimer.current && clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;
    socket.current?.close();
    socket.current = null;
  }, []);

  const sendResize = useCallback(() => {
    const dims = fitAddon.current.proposeDimensions();
    if (dims && socket.current?.readyState === WebSocket.OPEN) {
      const sizeMsg = `9${btoa(
        JSON.stringify({ data: { columns: dims.cols, rows: dims.rows } })
      )}`;
      socket.current.send(sizeMsg);
    }
  }, []);

  const initTerminal = useCallback(() => {
    if (!terminal.current && terminalRef.current) {
      terminal.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#000000",
          foreground: "#f0f0f0",
        },
        allowProposedApi: true,
      });
      terminal.current.loadAddon(fitAddon.current);
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();

      terminal.current.onData((data) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
          socket.current.send(`0${btoa(data)}`);
        }
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (!namespace || !pod || !container) {
      console.error("Missing query parameters");
      return;
    }

    disconnect();
    setStatus("connecting");

    initTerminal();
    terminal.current?.clear();
    terminal.current?.write("\r\nConnecting to container...\r\n");

    const wsUrl = `ws://localhost:8081/namespace/${namespace}/pod/${pod}/container/${container}`;
    socket.current = new WebSocket(wsUrl);

    socket.current.onopen = () => {
      setStatus("connected");
      terminal.current?.write("\x1b[32m✅ Connected to container\x1b[m\r\n");
      (terminal.current as any).cursorHidden = false;
      sendResize();
    };

    socket.current.onmessage = (event) => {
      if (event.data instanceof Blob) {
        event.data.arrayBuffer().then((buffer) => {
          terminal.current?.write(new TextDecoder().decode(buffer));
        });
      } else if (typeof event.data === "string") {
        const [type, payload] = [event.data.charAt(0), event.data.slice(1)];
        const decoded = decodeBase64(payload);
        switch (type) {
          case "1":
          case "2":
            terminal.current?.write(decoded);
            break;
          case "3":
            terminal.current?.write(
              `\r\n\x1b[33m[System] ${decoded}\x1b[m\r\n`
            );
            break;
          default:
            terminal.current?.write(
              `\r\n\x1b[31m[Unknown Message Type]\x1b[m\r\n`
            );
        }
      }
    };

    socket.current.onclose = () => {
      if (status !== "disconnected") {
        setStatus("disconnected");
        terminal.current?.write("\r\n\x1b[31m❌ Connection closed\x1b[m\r\n");
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    };

    socket.current.onerror = () => {
      setStatus("disconnected");
      terminal.current?.write("\r\n\x1b[31m⚠️ Connection error\x1b[m\r\n");
    };
  }, [namespace, pod, container, disconnect, initTerminal, sendResize]);

  useEffect(() => {
    connect();
    window.addEventListener("resize", sendResize);

    return () => {
      window.removeEventListener("resize", sendResize);
      disconnect();
      terminal.current?.dispose();
      terminal.current = null;
    };
  }, [connect, disconnect, sendResize]);

  return (
    <div className="h-full w-full flex flex-col bg-black">
      <div className="sticky top-0 z-10 flex items-center p-2 bg-gray-800 text-white shadow">
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
      <div ref={terminalRef} className="flex-grow" />
    </div>
  );
}
