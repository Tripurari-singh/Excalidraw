import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username can't exceed 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

export const SigninSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ─── Room Schema ──────────────────────────────────────────────────────────────

export const CreateRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters")
    .max(20, "Room name can't exceed 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, underscores"),
});

// ─── WebSocket Message Schemas ────────────────────────────────────────────────

export const JoinRoomSchema    = z.object({ type: z.literal("join_room"),    roomId: z.string() });
export const LeaveRoomSchema   = z.object({ type: z.literal("leave_room"),   roomId: z.string() });
export const ChatMessageSchema = z.object({ type: z.literal("chat"),         roomId: z.string(), message: z.string().min(1).max(2000) });
export const EraseShapeSchema  = z.object({ type: z.literal("erase"),        roomId: z.string(), shapeId: z.string() });
export const ClearCanvasSchema = z.object({ type: z.literal("clear_canvas"), roomId: z.string() });

export const DrawShapeSchema = z.object({
  type: z.literal("draw"),
  roomId: z.string(),
  shape: z.object({
    id:          z.string(),
    type:        z.string(),
    x:           z.number(),
    y:           z.number(),
    width:       z.number().optional(),
    height:      z.number().optional(),
    points:      z.array(z.tuple([z.number(), z.number()])).optional(),
    color:       z.string().optional(),
    strokeWidth: z.number().optional(),
    text:        z.string().optional(),
  }),
});

export const WsMessageSchema = z.discriminatedUnion("type", [
  JoinRoomSchema,
  LeaveRoomSchema,
  ChatMessageSchema,
  DrawShapeSchema,
  EraseShapeSchema,
  ClearCanvasSchema,
]);

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type SigninType     = z.infer<typeof SigninSchema>;
export type CreateRoomType = z.infer<typeof CreateRoomSchema>;
export type WsMessage      = z.infer<typeof WsMessageSchema>;
export type DrawShape      = z.infer<typeof DrawShapeSchema>["shape"];
