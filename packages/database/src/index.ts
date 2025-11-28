export { prisma } from "./client.js";
import dotenv from "dotenv";
dotenv.config();

// export * from "./generated/prisma/client.js";
console.log("PRISMA INTERNAL DATABASE_URL:", process.env.DATABASE_URL);
