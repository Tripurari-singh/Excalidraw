import { BACKEND_URL } from "../config";
import axios from "axios";

async function getMessages(roomId : string){
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    return response.data.messages;
}

export default async function({id} : {
    id : string
}){
    const messages = await getMessages(id);
}