"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { initDraw } from "./initDraw";

function DrawCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") ?? "";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !roomId) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    let cleanup: (() => void) | undefined;
    initDraw(canvas, ctx, roomId).then((fn) => { cleanup = fn; });

    const handleResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cleanup?.();
      window.removeEventListener("resize", handleResize);
    };
  }, [roomId]);

  return (
    <canvas
      ref={canvasRef}
      className="block bg-gray-950"
      style={{ cursor: "crosshair" }}
    />
  );
}

// useSearchParams() requires a Suspense boundary above it during SSR/static generation
export default function DrawPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-gray-950" />}>
      <DrawCanvas />
    </Suspense>
  );
}
