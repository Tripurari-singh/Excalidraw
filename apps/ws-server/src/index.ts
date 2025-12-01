import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config"
import { prisma } from "@repo/db"

const wss = new WebSocketServer({port : 8080});

interface UserInterface {
    ws : WebSocket,
    userId : string,
    rooms : string[],
}

const users : UserInterface[] = [];


function verifyTokenAuthentication(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // If decoded is a string, token is valid but doesn't contain user info
    if (typeof decoded === "string") return null;

    // Validate decoded object
    const userId = decoded?.userId;
    if (!userId) return null;

    return userId;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}


wss.on('connection' , function connection(ws , request){
    const url = request.url;

    if(!url){
        return null;
    }

    const queryParms = new URLSearchParams(url.split('?')[1]);
    const token = queryParms.get("token") ?? "";
    const userId = verifyTokenAuthentication(token);

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

    ws.on('message' , async function(data){
        const ParsedData = JSON.parse(data as unknown as string);
        
        // If user wants to Join the Room
        if(ParsedData.type === "join_room"){
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(ParsedData.roomId);
        }
        
        // If user wants to Leave the room..
        if(ParsedData.type === "leave_room"){
            const user = users.find(x => x.ws === ws);

            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x === ParsedData.room);
        }
        
        // Adding Chat to the specific room..
        if (ParsedData.type === "chat"){
            const roomId = ParsedData.roomId;
            const message = ParsedData.message;

            await prisma.chat.create({
                data : {
                    roomId,
                    message,
                    userId
                }
            })

            users.forEach(user => {
                user.ws.send(JSON.stringify({
                    type : "chat",
                    message : message,
                    roomId
                }))
            })
        }
    }) 

   
    ws.on('message' , function message(data){
        ws.send('pong');
    });
});