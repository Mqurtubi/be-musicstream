import dotenv from "dotenv";
dotenv.config();

export const env = {
  clientId: process.env.CLIENT_ID || "",
  clientSecret: process.env.CLIENT_SECRET || "",
  redirectUri: process.env.FRONTEND_URI,
  port: process.env.PORT || 3001,
};
