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

    useEffect(() => {
        if(socket && !loading){
            socket.onmessage = (event) => {
                const ParsedData = JSON.parse(event.data);
                if(ParsedData === "chat"){
                    setChats(c => [...c , {message : ParsedData.message}])
                }
            }
        }
    } , [loading , socket])
}