"use client"

import { initDraw } from "@/draw/page";
import { useEffect, useRef } from "react"

export default function canvas(){

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if(canvasRef.current){
            const canvas = canvasRef.current;
            if(!canvas){
                return;
            }

            const ctx = canvas.getContext("2d");
            if(!ctx){
                return;
            }

            initDraw(canvas , ctx);
        }
    } , [canvasRef]);

    return <div className="w-full h-screen bg-gradient-to-b from-[#0d1b2a] via-[#0b1623] to-[#0a1420]">
        <canvas ref={canvasRef} width={1000} height={1000}></canvas>
    </div>

}