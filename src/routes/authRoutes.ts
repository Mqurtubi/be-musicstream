import { Router } from "express";
import {
  getTokenFromCode,
  getUserPlayer,
  getUserPlaylist,
  getUserProfile,
  getUserTopArtist,
  getUserTopTracks,
  refreshAccessToken,
} from "../services/spotifyService";
import { generateRandomString } from "../utils/randomString";
import qs from "querystring";
import axios from "axios";
import { error } from "console";
const router = Router();

router.get("/login", (req, res) => {
  const scope = [
    "user-read-private user-read-email playlist-read-private",
    "user-read-playback-state",
    "user-top-read",
  ].join();
  const state = generateRandomString(16);
  res.cookie("spotify_auth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      qs.stringify({
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.FRONTEND_URI,
        state: state,
      })
  );
});

router.get("/logout", (req, res) => {
  const cookies = Object.keys(req.cookies || {});
  cookies.forEach((cookie) => {
    res.clearCookie(cookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  });
  res.redirect("http://127.0.0.1:5173/");
});

router.get("/callback", async (req, res) => {
  const code = (req.query.code as string) || null;
  const state = (req.query.state as string) || null;
  const storedState = req.cookies.spotify_auth_state;

  if (!state || state !== storedState) {
    return res.redirect(
      process.env.FRONTEND_URI +
        "/?" +
        qs.stringify({ error: "state_mismatch" })
    );
  }

  try {
    const basicAuth =
      "Basic " +
      Buffer.from(
        process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
      ).toString("base64");

    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    res.cookie("spotify_refresh", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.clearCookie("spotify_auth_state");

    res.redirect(
      process.env.FRONTEND_URI + "/?" + qs.stringify({ login: "success" })
    );
  } catch (error) {
    console.log(error);
    res.redirect(
      process.env.FRONTEND_URI + "/?" + qs.stringify({ error: "invalid_token" })
    );
  }
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
  try {
    const tokenData = await refreshAccessToken(refreshToken);
    const accessToken = tokenData.access_token;

    const profile = await getUserProfile(accessToken);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me/playlists", async (req, res) => {
  const refreshToken = req.cookies.spotify_refresh;
  if (!refreshToken) return res.status(400).json({ error: "No access token" });
  try {
    const tokenData = await refreshAccessToken(refreshToken);
    const accessToken = tokenData.access_token;
    const playlist = await getUserPlaylist(accessToken);

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me/top/artists", async (req, res) => {
  const refreshToken = req.cookies.spotify_refresh;
  if (!refreshAccessToken)
    return res.status(400).json({ error: "No access token" });
  try {
    const tokenData = await refreshAccessToken(refreshToken);
    const accessToken = tokenData.access_token;
    const topArtists = await getUserTopArtist(accessToken);

    res.json(topArtists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me/top/tracks", async (req, res) => {
  const refreshToken = req.cookies.spotify_refresh;
  if (!refreshToken) return res.status(400).json({ error: "No access token" });
  try {
    const tokenData = await refreshAccessToken(refreshToken);
    const accessToken = tokenData.access_token;
    const topTracks = await getUserTopTracks(accessToken);

    res.json(topTracks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me/player", async (req, res) => {
  const refreshToken = req.cookies.spotify_refresh;
  if (!refreshToken) return res.status(400).json({ error: "No access token" });
  try {
    const tokenData = await refreshAccessToken(refreshToken);
    const accessToken = tokenData.access_token;
    const player = await getUserPlayer(accessToken);

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
