import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { prisma } from "@repo/db";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({ port: 8080 });

interface UserInterface {
    ws: WebSocket;
    userId: string;
    rooms: string[];
}

const users: UserInterface[] = [];

function verifyTokenAuthentication(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string") return null;
        const userId = decoded?.userId;
        if (!userId) return null;
        return userId;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}

wss.on("connection", function connection(ws, request) {
    try {
        const url = request.url;
        if (!url) return;

        const queryParams = new URLSearchParams(url.split("?")[1]);
        const token = queryParams.get("token") ?? "";
        const userId = verifyTokenAuthentication(token);

        if (!userId) {
            ws.close();
            return;
        }

        users.push({ userId, rooms: [], ws });

        ws.on("message", async function (data) {
            const parsedData = JSON.parse(data as unknown as string);

            // Join room
            if (parsedData.type === "join_room") {
                const user = users.find((x) => x.ws === ws);
                user?.rooms.push(String(parsedData.roomId));
            }

            // Leave room — BUG FIX: was === should be !==
            if (parsedData.type === "leave_room") {
                const user = users.find((x) => x.ws === ws);
                if (!user) return;
                user.rooms = user.rooms.filter((x) => x !== String(parsedData.roomId));
            }

            // Chat/draw — BUG FIX: only broadcast to users IN this room
            if (parsedData.type === "chat") {
                const roomId = String(parsedData.roomId);
                const message = parsedData.message;

                try {
                    await prisma.chat.create({
                        data: {
                            roomId: Number(roomId),
                            message,
                            userId,
                        },
                    });
                } catch (error) {
                    console.log(error);
                    ws.send(JSON.stringify({ type: "error", message: "Database failed" }));
                    return;
                }

                // Only send to users who joined this room
                users.forEach((user) => {
                    if (user.rooms.includes(roomId)) {
                        user.ws.send(JSON.stringify({
                            type: "chat",
                            message,
                            roomId,
                        }));
                    }
                });
            }
        });

        // Clean up user on disconnect
        ws.on("close", () => {
            const index = users.findIndex((x) => x.ws === ws);
            if (index !== -1) users.splice(index, 1);
        });

    } catch (error) {
        console.log(error);
        ws.send(JSON.stringify({ type: "error", message: "WebSocket error" }));
    }
});

console.log("WS server running on port 8080");
