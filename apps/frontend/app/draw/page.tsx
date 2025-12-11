"use client"
import { HTTP_BACKEND_URL } from "@/config";
import axios from "axios";

type Shape = {
    type : "rectangle",
    x : number,
    y : number ,
    width : number,
    height : number
} | {
    type : "circle",
    centerX : number,
    centerY : number,
    radius : number
};



export  async function initDraw(canvas : HTMLCanvasElement , ctx : CanvasRenderingContext2D , roomId : string){


    let existingShapes : Shape[] = (await getExistingShapes(roomId)) ?? [] ;
        
            clearCanvas(existingShapes , ctx , canvas);

            let clicked = false;
            let startX = 0;
            let startY = 0;

            canvas.addEventListener("mousedown" , (e) => {
                clicked = true;
                startX = e.clientX;
                startY = e.clientY;
                console.log(startX , startY)
            })
            

            canvas.addEventListener("mouseup" , (e) => {
                clicked = false
                const width = e.clientX - startX;
                const height = e.clientY - startY;
                // Pushing to The Main Array
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
                   clearCanvas(existingShapes , ctx , canvas); 
                   ctx.strokeStyle = "white";
                   ctx.lineWidth = 2;
                   ctx.strokeRect(startX , startY , width , height);
                   console.log(existingShapes);
                }
            })

}




function renderAll(shapes: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
        if (shape.type === "rectangle") {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    });
}


function clearCanvas(existingShapes : Shape[] , ctx : CanvasRenderingContext2D , canvas : HTMLCanvasElement){
    ctx.clearRect(0,0,canvas.width ,canvas.height);
    // ctx.fillRect(0,0,canvas.width ,canvas.height);
    
    existingShapes.map((shape) => {
        if(shape.type === "rectangle"){
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(shape.x ,shape.y ,shape.width ,shape.height);
        }
    })
}

async function  getExistingShapes(roomId : string){
    const response = await axios.get(`${HTTP_BACKEND_URL}/chats/${roomId}`);
    const messages = response.data.messages;

    const shapes = messages.map((x : {message : string}) => {
        const messageData = JSON.parse(x.message);
        return messageData
    })
    return shapes;
}