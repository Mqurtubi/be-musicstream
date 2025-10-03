import axios from "axios";
export const spotifyApi = (accessToken: string) =>
  axios.create({
    baseUrl: "https://api.spotify.com/v1",
    Authorization: `Bearer ${accessToken}`,
  });
