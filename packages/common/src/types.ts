import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),

  password: z
    .string()
    .min(3, "Password must be at least 3 characters")
    .max(20, "Password must be at most 20 characters"),

  email: z
    .string()
    .email("Invalid email format"),
});

export const SigninSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),

  password: z
    .string()
    .min(3, "Password must be at least 3 characters")
    .max(20, "Password must be at most 20 characters"),
});

export const CreateRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters")
    .max(20, "Room name must be at most 20 characters"),
});
