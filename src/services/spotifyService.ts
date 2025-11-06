import axios from "axios";
import qs from "qs";
import { env } from "../config/env";
import { spotifyApi } from "../config/spotifyApi";
const tokenUrl = "https://accounts.spotify.com/api/token";

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export async function getTokenFromCode(
  code: string
): Promise<SpotifyTokenResponse> {
  const basicAuth = Buffer.from(`${env.clientId}:${env.clientSecret}`).toString(
    "base64"
  );

  const { data } = await axios.post<SpotifyTokenResponse>(
    tokenUrl,
    qs.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.redirectUri,
    }),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<SpotifyTokenResponse> {
  const basicAuth = Buffer.from(`${env.clientId}:${env.clientSecret}`).toString(
    "base64"
  );

  const { data } = await axios.post<SpotifyTokenResponse>(
    tokenUrl,
    qs.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return data;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  country: string;
  product: string;
  images: { url: string }[];
}

export async function getUserProfile(
  accessToken: string
): Promise<SpotifyUserProfile> {
  const { data } = await spotifyApi(accessToken).get<SpotifyUserProfile>("/me");
  return data;
}
export async function getUserPlaylist(accessToken: string) {
  const { data } = await spotifyApi(accessToken).get("/me/playlists");
  return data;
}
export async function getUserPlayer(accessToken:string){
  const { data } = await spotifyApi(accessToken).get("/me/player");
  return data;
}

