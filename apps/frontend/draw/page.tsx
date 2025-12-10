"use client"
export  function initDraw(canvas : HTMLCanvasElement , ctx : CanvasRenderingContext2D){
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
                
            })
            canvas.addEventListener("mousemove" , (e) => {
                if(clicked){
                   const width = e.clientX - startX;
                   const height = e.clientY - startY;
                   ctx.clearRect(0 ,0 ,canvas.width , canvas.height);
                   ctx.strokeStyle = "white";
                   ctx.lineWidth = 2;
                   ctx.strokeRect(startX , startY , width , height);
                   ctx.fillRect(0,0,2,2);
                }
            })

}