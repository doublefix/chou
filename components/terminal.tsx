"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

function decodeBase64(base64: string): string {
  try {
    return atob(base64);
  } catch (e) {
    return "[Base64 Decode Error]\r\n";
  }
}

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const fitAddon = useRef(new FitAddon());
  const terminal = useRef<Terminal | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (!terminalRef.current) {
      console.error("Terminal DOM not mounted");
      return;
    }

    const namespace = searchParams.get("namespace");
    const pod = searchParams.get("pod");
    const container = searchParams.get("container");

    if (!namespace || !pod || !container) {
      console.error("Missing query parameters");
      return;
    }

    disconnect();

    setStatus("connecting");

    // Initialize terminal if not already done
    if (!terminal.current) {
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
    }

    terminal.current.write("\r\nConnecting to container...\r\n");
    terminal.current.options.cursorStyle = "block";

    const wsUrl = `ws://localhost:8081/namespace/${namespace}/pod/${pod}/container/${container}`;
    socket.current = new WebSocket(wsUrl);

    socket.current.addEventListener("open", () => {
      setStatus("connected");
      terminal.current?.write("\x1b[32m✅ Connected to container\x1b[m\r\n");
      if (terminal.current) {
        (terminal.current as any).cursorHidden = false;
      }

      // Send initial terminal size with '9' prefix
      const dims = fitAddon.current.proposeDimensions();
      if (dims) {
        const sizeMsg = `9${btoa(
          JSON.stringify({
            data: {
              columns: dims.cols,
              rows: dims.rows,
            },
          })
        )}`;
        socket.current?.send(sizeMsg);
      }
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
        // Attempt to reconnect after 5 seconds
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    });

    socket.current.addEventListener("error", () => {
      setStatus("disconnected");
      terminal.current?.write("\r\n\x1b[31m⚠️ Connection error\x1b[m\r\n");
    });
  };

  const disconnect = () => {
    setStatus("disconnected");
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
  };

  useEffect(() => {
    // Initialize terminal and connect
    connect();

    // Handle window resize
    const handleResize = () => {
      if (fitAddon.current && terminal.current) {
        try {
          fitAddon.current.fit();
          if (socket.current?.readyState === WebSocket.OPEN) {
            const dims = fitAddon.current.proposeDimensions();
            if (dims) {
              // Updated to use '9' prefix and proper structure
              const sizeMsg = `9${btoa(
                JSON.stringify({
                  data: {
                    columns: dims.cols,
                    rows: dims.rows,
                  },
                })
              )}`;
              socket.current.send(sizeMsg);
            }
          }
        } catch (e) {
          console.error("Resize error:", e);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    // Set up terminal data handler
    const dataHandler = (data: string) => {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(`0${btoa(data)}`);
      }
    };

    terminal.current?.onData(dataHandler);

    return () => {
      window.removeEventListener("resize", handleResize);
      disconnect();
      terminal.current?.dispose();
      terminal.current = null;
    };
  }, [searchParams]);

  return (
    <div className="h-full w-full flex flex-col bg-black">
      <div className="flex items-center p-2 bg-gray-800 text-white">
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
