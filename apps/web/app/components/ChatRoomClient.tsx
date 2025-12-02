"use client";
import { useEffect, useState } from "react";
import { useSocket } from "../../hooks/useSocket";

export function ChatRoomClient({
    messages,
    id
} : {
    messages : {message : string}[],
    id : string
}){
    const [chats , setChats] = useState(messages);
    const {loading  , socket } = useSocket();
    const [currentMessages , setCurrentMessages] = useState("");

    useEffect(() => {
        if(socket && !loading){

            socket.send(JSON.stringify({
                type : "join_room",
                roomId : id
            }))

            socket.onmessage = (event) => {
                const ParsedData = JSON.parse(event.data);
                if(ParsedData === "chat"){
                    setChats(c => [...c , {message : ParsedData.message}])
                }
            }
        }
    } , [loading , socket , id])

    return (
        <div>
            { chats.map(m => <div>{m.message}</div>) }
            <input type="text" value={currentMessages} onChange={(e) => {
                setCurrentMessages(e.target.value)
            }}></input>
        </div>
    )
}