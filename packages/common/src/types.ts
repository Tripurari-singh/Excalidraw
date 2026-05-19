import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  avatar: z.string().optional(),
});

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(3).max(20),
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type SigninType = z.infer<typeof SigninSchema>;
export type CreateRoomType = z.infer<typeof CreateRoomSchema>;