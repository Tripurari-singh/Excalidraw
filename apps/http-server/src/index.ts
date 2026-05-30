import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
<<<<<<< HEAD
import jwt from "jsonwebtoken"
// import bodyParser from "body-parser";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config"
import { CreateUserSchema , SigninSchema , CreateRoomSchema } from "@repo/common/types";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
import dotenv from "dotenv";
dotenv.config();
import { prisma } from "@repo/db";
import { ZodError } from "zod";
=======
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { authenticate } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/db";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Helpers ──────────────────────────────────────────────────────────────────
>>>>>>> finishing

function sanitizeUser(user: { id: string; email: string; username: string; avatar: string | null }) {
  return { id: user.id, email: user.email, username: user.username, avatar: user.avatar };
}

<<<<<<< HEAD

app.post("/signup" , async (req  , res) => {
    console.log("Route Hit")
    try{
     
    const ParsedData = CreateUserSchema.parse(req.body);
    
    if(!ParsedData){
        res.status(400).json({
            message : "Invalid crediantials"
        })
        return; 
=======
function handleZodError(error: ZodError, res: express.Response) {
  const messages = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  res.status(400).json({ message: "Validation failed", errors: messages });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/signup", async (req, res) => {
  try {
    const body = CreateUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
>>>>>>> finishing
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { username: body.username, email: body.email, password: hashedPassword, avatar: body.avatar ?? null },
    });

    res.status(201).json({ message: "Account created successfully", user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof ZodError) { handleZodError(error, res); return; }
    console.error("[POST /signup]", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const body = SigninSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Signed in successfully", token, user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof ZodError) { handleZodError(error, res); return; }
    console.error("[POST /signin]", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ─── Rooms ────────────────────────────────────────────────────────────────────

app.post("/room", authenticate, async (req, res) => {
  try {
    const body = CreateRoomSchema.parse(req.body);
    const userId = req.userId!;

    const existingRoom = await prisma.room.findUnique({ where: { slug: body.name } });
    if (existingRoom) {
      res.status(409).json({ message: "A room with this name already exists" });
      return;
    }

    const room = await prisma.room.create({ data: { slug: body.name, adminId: userId } });

    res.status(201).json({ message: "Room created successfully", room: { id: room.id, slug: room.slug } });
  } catch (error) {
    if (error instanceof ZodError) { handleZodError(error, res); return; }
    console.error("[POST /room]", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.get("/room/:slug", async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, slug: true, adminId: true },
    });
    if (!room) { res.status(404).json({ message: "Room not found" }); return; }
    res.status(200).json({ room });
  } catch (error) {
    console.error("[GET /room/:slug]", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.get("/rooms", authenticate, async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      select: { id: true, slug: true, adminId: true },
      orderBy: { id: "desc" },
    });
    res.status(200).json({ rooms });
  } catch (error) {
    console.error("[GET /rooms]", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.delete("/room/:slug", authenticate, async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { slug: req.params.slug } });
    if (!room) { res.status(404).json({ message: "Room not found" }); return; }
    if (room.adminId !== req.userId) {
      res.status(403).json({ message: "Only the room admin can delete it" });
      return;
    }
    await prisma.chat.deleteMany({ where: { roomId: room.id } });
    await prisma.room.delete({ where: { id: room.id } });
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("[DELETE /room/:slug]", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── Chats / Canvas History ───────────────────────────────────────────────────

app.get("/chats/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    if (isNaN(roomId)) { res.status(400).json({ message: "Invalid room ID" }); return; }

    const messages = await prisma.chat.findMany({
      where: { roomId },
      orderBy: { id: "desc" },
      take: 50,
      select: { id: true, message: true, userId: true, roomId: true },
    });

    res.status(200).json({ messages: messages.reverse() });
  } catch (error) {
    console.error("[GET /chats/:roomId]", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── Profile ──────────────────────────────────────────────────────────────────

app.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, username: true, avatar: true },
    });
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.status(200).json({ user });
  } catch (error) {
    console.error("[GET /me]", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────

<<<<<<< HEAD

app.listen(3000 , () => {
    console.log("server is listening on port 3000 !!")
})
=======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP server running on http://localhost:${PORT}`));
>>>>>>> finishing
