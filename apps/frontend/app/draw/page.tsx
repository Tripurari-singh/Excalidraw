"use client"
import { useEffect, useRef } from "react"

type Shape = {
    type : "rectangle",
    x : number,
    y : number,
    width : number,
    height : number,
} | {
    type : "circle",
    centerX : number,
    centerY : number,
    radius : number
}

() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    if(canvasRef.current){
        
    }
}