if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set. Using insecure default.");
}

export const JWT_SECRET = process.env.JWT_SECRET || "super-secret-change-in-production";
