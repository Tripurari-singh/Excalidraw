import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config"

const wss = new WebSocketServer({port : 8080});

interface UserInterface {
    ws : WebSocket,
    userId : string,
    rooms : string[],
}

const users : UserInterface[] = [];


function VerifyTokenAuthentication( token : string): string | null {

    const decoded = jwt.verify(token , JWT_SECRET)

    if (typeof decoded == "string"){
        return null;
    }
    if(!decoded || !decoded.userId){
        return null;
    }
    return decoded.userId;
}

wss.on('connection' , function connection(ws , request){
    const url = request.url;

    if(!url){
        return null;
    }

    const queryParms = new URLSearchParams(url.split('?')[1]);
    const token = queryParms.get("token") ?? "";
    const userId = VerifyTokenAuthentication(token);

    if (!userId){
        ws.close();
        return null;
    }

    
    //....If The user is authenticated then only control will reach Here....

    // State Management in Backend...
    users.push({
        userId,
        rooms : [],
        ws
    })

    ws.on('message' , function(data){
        const ParsedData = JSON.parse(data as unknown as string);

        if(ParsedData.type === "join_room"){
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(ParsedData.roomId);
        }

        if(ParsedData.type === "leave_room"){
            const user = users.find(x => x.ws === ws);

            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x === ParsedData.room);
        }
    }) 

   
    ws.on('message' , function message(data){
        ws.send('pong');
    });
});