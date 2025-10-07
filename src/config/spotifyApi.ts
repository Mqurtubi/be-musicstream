import axios from "axios";
export const spotifyApi = (accessToken: string) =>
  axios.create({
    baseURL: "https://api.spotify.com/v1",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
