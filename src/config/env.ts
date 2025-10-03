import dotenv from "dotenv";
dotenv.config();

export const env = {
  clientId: process.env.CLIENT_ID || "",
  clientSecret: process.env.CLIENT_SECRET || "",
  redirectUri:
    process.env.REDIRECT_URI || "http://localhost:3001/auth/callback",
  port: process.env.PORT || 3001,
};
