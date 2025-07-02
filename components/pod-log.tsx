"use client";

import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";

export default function LogViewer() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<import("@xterm/xterm").Terminal | null>(null);
  const fitAddon = useRef<import("@xterm/addon-fit").FitAddon | null>(null);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!terminalRef.current) return;

      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");

      terminal.current = new Terminal({
        fontSize: 14,
        scrollback: 2000,
        disableStdin: true,
        cursorBlink: false,         // 不闪烁
        cursorStyle: "bar",         // 光标样式
        theme: {
          background: "#000000",
          foreground: "#f0f0f0",
        },
      });

      fitAddon.current = new FitAddon();
      terminal.current.loadAddon(fitAddon.current);
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();
      terminal.current.write("\x1b[?25l"); // ANSI: 隐藏光标
      
      terminal.current.write("\x1b[33mConnecting to log stream...\x1b[0m");


    const namespace = "kube-system";
    const podName = "calico-node-rcjsm";
    const container = "calico-node";
    const wsUrl = `ws://localhost:8080/api/v1/ws/log?namespace=${encodeURIComponent(
      namespace
    )}&pod=${encodeURIComponent(podName)}&container=${encodeURIComponent(
      container
    )}`;
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        terminal.current?.writeln("\x1b[32m✓ Log stream connected\x1b[0m");
      };

      socket.current.onmessage = (e) => {
        terminal.current?.writeln(e.data);
      };

      socket.current.onerror = (err) => {
        terminal.current?.writeln("\x1b[31m⚠️ WebSocket error\x1b[0m");
        console.error("WebSocket error:", err);
      };

      socket.current.onclose = () => {
        terminal.current?.writeln("\x1b[31m✗ Log stream closed\x1b[0m");
      };

      // 监听窗口大小变化并适配终端尺寸
      const handleResize = () => {
        try {
          fitAddon.current?.fit();
        } catch (err) {
          console.error("fit() failed:", err);
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        socket.current?.close();
        terminal.current?.dispose();
      };
    };

    init();
  }, []);

  return (
    <div className="flex-grow overflow-hidden pl-2">
        <div
            ref={terminalRef}
            className="w-full h-full rounded-lg overflow-hidden bg-black"
        />
    </div>
  );
}