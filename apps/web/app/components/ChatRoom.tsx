import { BACKEND_URL } from "../config";
import axios from "axios";
import { ChatRoomClient } from "./ChatRoomClient";

async function getMessages(roomId : string){
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    return response.data.messages;
}

export default async function({id} : {
    id : string
}){
    const messages = await getMessages(id);
    return <ChatRoomClient id={id} messages={messages}></ChatRoomClient>
}