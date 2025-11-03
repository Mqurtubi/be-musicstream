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
    encodeURIComponent(process.env.FRONTEND_URI);

  res.redirect(authUrl);
});

router.get("/token", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ error: "Missing code" });
  try {
    const token = await getTokenFromCode(code);
    res.cookie("spotify_refresh", token.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({
      access_token: token.access_token,
      expires_in: token.expires_in,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/refresh", async (req, res) => {
  const refreshToken = req.query.refresh_token as string;
  if (!refreshToken)
    return res.status(400).json({ errror: "No refresh token" });
  try {
    const tokenData = await refreshAccessToken(refreshToken);
    if (tokenData.refresh_token) {
      res.cookie("spotify_refresh", tokenData.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }
    res.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", async (req, res) => {
  const refreshToken = req.cookies.spotify_refresh;
  if (!refreshToken) return res.status(400).json({ error: "No access token" });
  const tokenData = await refreshAccessToken(refreshToken);
  const accessToken = tokenData.access_token;

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
