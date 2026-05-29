"use client";
import { initDraw } from "@/app/draw/initDraw";
import { useEffect, useRef } from "react";

export default function CanvasComponent({ roomId }: { roomId: string }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // initDraw now returns a cleanup function to close WS
        let cleanup: (() => void) | undefined;
        initDraw(canvas, ctx, roomId).then((fn) => {
            cleanup = fn;
        });

        return () => {
            cleanup?.();
        };
    }, [roomId]);

    return (
        <div className="w-fit h-fit bg-gradient-to-b from-[#0d1b2a] via-[#0b1623] to-[#0a1420]">
            <canvas ref={canvasRef} width={2000} height={1500} />
        </div>
    );
}
