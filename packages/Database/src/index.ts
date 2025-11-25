import { PrismaClient } from "@prisma/client/extension";

// export const prisma = new PrismaClient();

// packages/Database/src/index.ts
// Use the explicit path to the generated JS entrypoint
// import { PrismaClient } from "../generated/prisma/index.js";

export const prisma = new PrismaClient();

