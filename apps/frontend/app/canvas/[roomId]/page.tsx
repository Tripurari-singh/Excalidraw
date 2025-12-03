"use client"
import { start } from "node:repl";
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

export default function Canvas(){

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        if(canvasRef.current){
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            let existingShapes : Shape[] = [];

            if(!ctx){
                return;
            }

            ctx.fillStyle = "rgba(0,0,0)"; 
            ctx.fillRect(0 , 0 , canvas.width , canvas.height);

            // ctx.strokeRect(25 , 25 , 100 , 100);


            let clicked = false;
            let startX = 0;
            let startY = 0;

            canvas.addEventListener("mousedown" , (e) => {
                clicked = true;
                 startX = e.clientX;
                 startY = e.clientY;
            })

            canvas.addEventListener("mouseup" , (e) => {
                clicked = false;
                const width = e.clientX - startX;
                const height = e.clientY - startY;

                existingShapes.push({
                    type : "rectangle",
                    x : startX,
                    y : startY,
                    height,
                    width
                })
            })

            canvas.addEventListener("mousemove" , (e) => {
                if(clicked){
                    const width = e.clientX - startX;
                    const height = e.clientY - startY;
                    clearCanvas(existingShapes ,ctx , canvas );
                    ctx.strokeStyle = ("rgba(255 , 255 , 255)")
                    ctx.strokeRect(startX , startY , width , height);
                }
            })

        }


        function clearCanvas(existingShapes : Shape[] , ctx : CanvasRenderingContext2D , canvas : HTMLCanvasElement){
                    ctx.clearRect(0 ,0 ,canvas.width , canvas.height);
                    ctx.fillStyle = "rgba(0 , 0 , 0)";
                    ctx.fillRect(0 ,0 ,canvas.width , canvas.height);

                    existingShapes.map((shape) => {
                        if(shape.type === "rectangle"){
                            ctx.strokeStyle = "rgba(255 , 255 , 255)";
                            ctx.strokeRect(shape.x , shape.y , shape.width , shape.height);
                        }
                    })
                    console.log(existingShapes);
        }



    } , [canvasRef])

    return <div>
        <canvas ref={canvasRef} width={2000} height={2000}></canvas>
    </div>
}