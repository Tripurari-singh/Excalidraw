import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config";

const wss = new WebSocketServer({port : 8080});

wss.on('connection' , function connection(ws , request){
   
    const url = request.url;

    if(!url){
        return;
    }

    const queryParms = new URLSearchParams(url.split('?')[1]);
    const token = queryParms.get("token") ?? "";

    const decoded = jwt.verify(token , JWT_SECRET)
    //@ts-ignore
    if(!decoded || !decoded.userId){
        ws.close();
        return;
    }
    //....If The user is authenticated then only control will reach Here....

    ws.on('message' , function message(data){
        ws.send('pong');
    });
});