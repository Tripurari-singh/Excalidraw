"use client"
import initDraw from "@/app/draw/page";
import { start } from "node:repl";
import { useEffect, useRef } from "react"


export default function canvas(){

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if(canvasRef.current){
            initDraw(canvasRef.current);
        }
    } , [canvasRef])

    return <div>
        <canvas ref={canvasRef} width={2000} height={2000}></canvas>
    </div>
}