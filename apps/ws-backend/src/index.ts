import { WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";

import jwt from "jsonwebtoken";

const wss = new WebSocketServer({ port : 8080 })

wss.on("connection" , (socket , request) => {
    const url = request.url;
    if(!url){
        return
    }    

    const queryParameter = new URLSearchParams(url.split('?')[1]);
    const token = queryParameter.get('token') || "";
    const decoded = jwt.verify(token , JWT_SECRET);

    if(typeof decoded === "string"){
        socket.close();
        return;
    }
    if( !decoded || !decoded.userId){
        socket.close();
        return;
    }
    socket.on("message" , (data) => {
        socket.send("pong")
    })
})