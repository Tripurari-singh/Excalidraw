import { HTTP_BACKEND_URL, WS_BACKEND_URL } from "@/config";
import axios from "axios";

type Shape = {
    type: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
};

export async function initDraw(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    roomId: string
) {
    // Load existing shapes from DB
    let existingShapes: Shape[] = (await getExistingShapes(roomId)) ?? [];
    clearCanvas(existingShapes, ctx, canvas);

    // Open WebSocket connection
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${WS_BACKEND_URL}?token=${token}`);

    ws.onopen = () => {
        ws.send(JSON.stringify({ type: "join_room", roomId }));
    };

    // When another user draws — receive and render it
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
            try {
                const shape: Shape = JSON.parse(data.message);
                existingShapes.push(shape);
                clearCanvas(existingShapes, ctx, canvas);
            } catch {}
        }
    };

    // Mouse drawing logic
    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener("mouseup", (e) => {
        if (!clicked) return;
        clicked = false;

        const shape: Shape = {
            type: "rectangle",
            x: startX,
            y: startY,
            width: e.clientX - startX,
            height: e.clientY - startY,
        };

        existingShapes.push(shape);
        clearCanvas(existingShapes, ctx, canvas);

        // Send to WebSocket so other users see it
        ws.send(JSON.stringify({
            type: "chat",
            roomId,
            message: JSON.stringify(shape),
        }));
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(existingShapes, ctx, canvas);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, startY, width, height);
        }
    });

    // Cleanup function — close WS when component unmounts
    return () => {
        ws.send(JSON.stringify({ type: "leave_room", roomId }));
        ws.close();
    };
}

function clearCanvas(
    existingShapes: Shape[],
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    existingShapes.forEach((shape) => {
        if (shape.type === "rectangle") {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

async function getExistingShapes(roomId: string) {
    const response = await axios.get(`${HTTP_BACKEND_URL}/chats/${roomId}`);
    const messages = response.data.messages;
    const shapes = messages
        .map((x: { message: string }) => {
            try { return JSON.parse(x.message); } catch { return null; }
        })
        .filter(Boolean)
        .reverse();
    return shapes;
}
