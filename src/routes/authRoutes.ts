import { Router } from "express";
import {
  getTokenFromCode,
  getUserPlaylist,
  getUserProfile,
  refreshAccessToken,
} from "../services/spotifyService";

const router = Router();

router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private";
  const authUrl =
    "https://accounts.spotify.com/authorize" +
    "?response_type=code" +
    "&client_id=" +
    process.env.CLIENT_ID +
    "&scope=" +
    encodeURIComponent(scope) +
    "&redirect_uri=" +
    encodeURIComponent(process.env.REDIRECT_URI);

  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    const tokenData = await getTokenFromCode(code);
    res.json(tokenData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/refresh", async (req, res) => {
  const refreshToken = req.query.refresh_token as string;
  if (!refreshToken) return res.status(400).json({ errro: "No refresh token" });
  try {
    const tokenData = await refreshAccessToken(refreshToken);
    res.json(tokenData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", async (req, res) => {
  const accessToken = req.query.access_token as string;
  if (!accessToken) return res.status(400).json({ error: "No access token" });
  const profile = await getUserProfile(accessToken);
  res.json(profile);
});

router.get("/me/playlists", async (req, res) => {
  const accessToken = req.query.access_token as string;
  if (!accessToken) return res.status(400).json({ error: "No access token" });
  const playlist = await getUserPlaylist(accessToken);
  res.json(playlist);
});

export default router;
