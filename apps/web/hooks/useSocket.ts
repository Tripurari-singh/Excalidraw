import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket(){
    const [loading , setLoading] = useState(true);
    const [socket , setSocket] = useState<WebSocket>();

    useEffect(() => {
        // Need to Add The token as well , otherwise , will Not connect to Websocket
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    } , [])

    return {
        loading , 
        socket
    }
}