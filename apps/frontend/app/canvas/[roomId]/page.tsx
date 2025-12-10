"use client"

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
            ctx.strokeRect(25 , 25 , 100 , 100);
        }
    } , [canvasRef]);

    return <div>
        <canvas ref={canvasRef} width={2000} height={2000}></canvas>
    </div>
}