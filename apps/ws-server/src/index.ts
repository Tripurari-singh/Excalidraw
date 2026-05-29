import "dotenv/config";
import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { WsMessageSchema } from "@repo/common/types";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConnectedUser {
  ws: WebSocket;
  userId: string;
  rooms: Set<string>;
}

// ─── In-memory State ──────────────────────────────────────────────────────────

const connectedUsers: ConnectedUser[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded?.userId ?? null;
  } catch {
    return null;
  }
}

function send(ws: WebSocket, payload: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcastToRoom(roomId: string, payload: object, excludeWs?: WebSocket) {
  for (const user of connectedUsers) {
    if (user.rooms.has(roomId) && user.ws !== excludeWs) {
      send(user.ws, payload);
    }
  }
}

function removeUser(ws: WebSocket) {
  const index = connectedUsers.findIndex((u) => u.ws === ws);
  if (index !== -1) connectedUsers.splice(index, 1);
}

// ─── Connection Handler ───────────────────────────────────────────────────────

wss.on("connection", (ws, request) => {
  const url = request.url ?? "";
  const params = new URLSearchParams(url.split("?")[1] ?? "");
  const token = params.get("token") ?? "";
  const userId = verifyToken(token);

  if (!userId) {
    send(ws, { type: "error", message: "Authentication failed. Invalid or missing token." });
    ws.close(1008, "Unauthorized");
    return;
  }

  const currentUser: ConnectedUser = { ws, userId, rooms: new Set() };
  connectedUsers.push(currentUser);

  console.log(`[WS] User ${userId} connected. Total: ${connectedUsers.length}`);
  send(ws, { type: "connected", message: "Connected to DrawSpace" });

  // ── Messages ────────────────────────────────────────────────────────────────

  ws.on("message", async (raw) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: "error", message: "Invalid JSON" });
      return;
    }

    const result = WsMessageSchema.safeParse(parsed);
    if (!result.success) {
      send(ws, { type: "error", message: "Unknown or malformed message type" });
      return;
    }

    const message = result.data;

    switch (message.type) {

      case "join_room": {
        const { roomId } = message;

        const room = await prisma.room.findUnique({
          where: { id: Number(roomId) },
          select: { id: true, slug: true },
        });

        if (!room) {
          send(ws, { type: "error", message: `Room ${roomId} does not exist` });
          return;
        }

        currentUser.rooms.add(roomId);
        send(ws, { type: "room_joined", roomId, slug: room.slug });
        broadcastToRoom(roomId, { type: "user_joined", roomId, userId }, ws);
        console.log(`[WS] User ${userId} joined room ${roomId}`);
        break;
      }

      case "leave_room": {
        const { roomId } = message;
        currentUser.rooms.delete(roomId);
        send(ws, { type: "room_left", roomId });
        broadcastToRoom(roomId, { type: "user_left", roomId, userId }, ws);
        console.log(`[WS] User ${userId} left room ${roomId}`);
        break;
      }

      case "chat": {
        const { roomId, message: text } = message;

        if (!currentUser.rooms.has(roomId)) {
          send(ws, { type: "error", message: "You haven't joined this room" });
          return;
        }

        try {
          const saved = await prisma.chat.create({
            data: { roomId: Number(roomId), message: text, userId },
          });

          const outgoing = {
            type: "chat",
            id: saved.id,
            roomId,
            message: text,
            userId,
            timestamp: new Date().toISOString(),
          };

          send(ws, outgoing);
          broadcastToRoom(roomId, outgoing, ws);
        } catch (error) {
          console.error("[WS] chat DB error:", error);
          send(ws, { type: "error", message: "Failed to save message" });
        }
        break;
      }

      case "draw": {
        const { roomId, shape } = message;

        if (!currentUser.rooms.has(roomId)) {
          send(ws, { type: "error", message: "You haven't joined this room" });
          return;
        }

        try {
          await prisma.chat.create({
            data: {
              roomId: Number(roomId),
              message: JSON.stringify({ shapeData: shape }),
              userId,
            },
          });
        } catch (error) {
          console.error("[WS] draw DB error:", error);
          send(ws, { type: "error", message: "Failed to save shape" });
          return;
        }

        broadcastToRoom(roomId, { type: "draw", roomId, shape, userId }, ws);
        break;
      }

      case "erase": {
        const { roomId, shapeId } = message;

        if (!currentUser.rooms.has(roomId)) {
          send(ws, { type: "error", message: "You haven't joined this room" });
          return;
        }

        try {
          await prisma.chat.create({
            data: {
              roomId: Number(roomId),
              message: JSON.stringify({ eraseShapeId: shapeId }),
              userId,
            },
          });
        } catch (error) {
          console.error("[WS] erase DB error:", error);
          send(ws, { type: "error", message: "Failed to save erase event" });
          return;
        }

        broadcastToRoom(roomId, { type: "erase", roomId, shapeId, userId }, ws);
        break;
      }

      case "clear_canvas": {
        const { roomId } = message;

        if (!currentUser.rooms.has(roomId)) {
          send(ws, { type: "error", message: "You haven't joined this room" });
          return;
        }

        try {
          await prisma.chat.deleteMany({ where: { roomId: Number(roomId) } });
        } catch (error) {
          console.error("[WS] clear_canvas DB error:", error);
          send(ws, { type: "error", message: "Failed to clear canvas" });
          return;
        }

        const outgoing = { type: "clear_canvas", roomId, clearedBy: userId };
        send(ws, outgoing);
        broadcastToRoom(roomId, outgoing, ws);
        break;
      }
    }
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────

  ws.on("close", () => {
    for (const roomId of currentUser.rooms) {
      broadcastToRoom(roomId, { type: "user_left", roomId, userId });
    }
    removeUser(ws);
    console.log(`[WS] User ${userId} disconnected. Total: ${connectedUsers.length}`);
  });

  ws.on("error", (error) => {
    console.error(`[WS] Error for user ${userId}:`, error.message);
    removeUser(ws);
  });
});

console.log("WebSocket server running on ws://localhost:8080");
