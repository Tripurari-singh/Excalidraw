
import CanvasComponent from "@/app/components/canvas";

export default async function canvas({params} : {
    params : {
        roomId : string
    }
}){
    const roomId = (await params).roomId;
    console.log(roomId);

    // Creates the canvas , with roomId passed on....
    return <CanvasComponent roomId={roomId}/>
 
} 



