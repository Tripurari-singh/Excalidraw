"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { initDraw, type ToolType, type DrawState } from "@/app/draw/initDraw";
import {
  Square, Circle, Minus, Pencil, Eraser, Trash2,
  Sparkles, ArrowLeft, Users
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Tool Config ──────────────────────────────────────────────────────────────

const TOOLS: { id: ToolType; icon: React.ReactNode; label: string }[] = [
  { id: "pencil",    icon: <Pencil    className="w-4 h-4" />, label: "Pencil"    },
  { id: "line",      icon: <Minus     className="w-4 h-4" />, label: "Line"      },
  { id: "rectangle", icon: <Square    className="w-4 h-4" />, label: "Rectangle" },
  { id: "circle",    icon: <Circle    className="w-4 h-4" />, label: "Circle"    },
  { id: "eraser",    icon: <Eraser    className="w-4 h-4" />, label: "Eraser"    },
];

const COLORS = [
  "#ffffff", "#f87171", "#fb923c", "#fbbf24",
  "#4ade80", "#60a5fa", "#c084fc", "#f472b6",
];

const STROKES = [2, 4, 8];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CanvasComponent({ roomId }: { roomId: string }) {
  const router     = useRouter();
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const stateRef   = useRef<DrawState>({ tool: "pencil", color: "#ffffff", strokeWidth: 2, fill: "transparent" });
  const clearRef   = useRef<(() => void) | null>(null);

  const [tool,        setTool]        = useState<ToolType>("pencil");
  const [color,       setColor]       = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fill,        setFill]        = useState("transparent");
  const [connected,   setConnected]   = useState(false);

  // Keep the ref in sync with React state so initDraw always reads latest values
  useEffect(() => { stateRef.current = { tool, color, strokeWidth, fill }; }, [tool, color, strokeWidth, fill]);

  const getState  = useCallback(() => stateRef.current, []);
  const onClear   = useCallback((fn: () => void) => { clearRef.current = fn; }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    let cleanup: (() => void) | undefined;

    initDraw(canvas, ctx, roomId, getState, onClear).then((fn) => {
      cleanup = fn;
      setConnected(true);
    });

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cleanup?.();
      window.removeEventListener("resize", onResize);
    };
  }, [roomId, getState, onClear]);

  const cursor =
    tool === "eraser" ? "cell"
    : tool === "text"  ? "text"
    : "crosshair";

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f1117]">

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor }}
      />

      {/* Top bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-md border border-gray-700/60 rounded-2xl px-4 py-2 shadow-2xl">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span className="text-white font-semibold text-sm">DrawSpace</span>
          <span className="text-gray-600 text-xs mx-1">·</span>
          <span className="text-gray-400 text-xs font-mono">Room #{roomId}</span>
          {connected && (
            <span className="flex items-center gap-1 ml-2 text-emerald-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-gray-900/90 backdrop-blur-md border border-gray-700/60 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-sm transition-all hover:border-gray-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </button>

      {/* Main Toolbar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/60 rounded-2xl p-2 shadow-2xl flex flex-col gap-1">

          {/* Tools */}
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center transition-all
                ${tool === t.id
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/60"}
              `}
            >
              {t.icon}
            </button>
          ))}

          <div className="h-px bg-gray-700/60 my-1" />

          {/* Clear */}
          <button
            onClick={() => clearRef.current?.()}
            title="Clear canvas"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color + Stroke Panel */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/60 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-4">

          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={c}
                className={`
                  w-6 h-6 rounded-full transition-all
                  ${color === c ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110" : "hover:scale-110"}
                `}
                style={{ backgroundColor: c }}
              />
            ))}
            {/* Custom color */}
            <label className="w-6 h-6 rounded-full border-2 border-dashed border-gray-600 hover:border-gray-400 cursor-pointer flex items-center justify-center transition-all" title="Custom color">
              <input type="color" className="sr-only" value={color} onChange={e => setColor(e.target.value)} />
              <span className="text-gray-400 text-xs">+</span>
            </label>
          </div>

          <div className="w-px h-6 bg-gray-700" />

          {/* Stroke width */}
          <div className="flex items-center gap-2">
            {STROKES.map((s) => (
              <button
                key={s}
                onClick={() => setStrokeWidth(s)}
                className={`
                  rounded-full bg-current transition-all
                  ${strokeWidth === s ? "opacity-100 ring-2 ring-white/30" : "opacity-40 hover:opacity-70"}
                `}
                style={{ width: s * 3 + 8, height: s * 3 + 8, backgroundColor: color }}
                title={`${s}px`}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-700" />

          {/* Fill toggle */}
          {(tool === "rectangle" || tool === "circle") && (
            <button
              onClick={() => setFill(fill === "transparent" ? color + "33" : "transparent")}
              className={`
                text-xs px-3 py-1 rounded-lg border transition-all font-medium
                ${fill !== "transparent"
                  ? "bg-red-500/20 border-red-500/50 text-red-300"
                  : "border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300"}
              `}
            >
              Fill
            </button>
          )}
        </div>
      </div>

      {/* Tool label */}
      <div className="absolute bottom-6 right-4 z-10">
        <div className="bg-gray-900/80 border border-gray-700/60 rounded-xl px-3 py-1.5 text-xs text-gray-400 font-medium capitalize backdrop-blur-md">
          {tool}
        </div>
      </div>
    </div>
  );
}
