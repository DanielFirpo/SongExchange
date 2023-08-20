import axios from "axios";
import { getUserBySpotifyID } from "./prisma/prismaUtils/userUtils";


//general utilities file

export async function getSpotifyLikedSongs(spotifyId: string, callback: Function) {

  const accessToken = await getNewSpotifyAccessToken(spotifyId);
  let nextPage = `https://api.spotify.com/v1/me/tracks?offset=0&limit=50`;
  let songs: any[] = [];

  try {
    while (nextPage) {
      const likedSongsResponse = await axios({
        url: nextPage,
        method: "get",
        headers: { Authorization: "Bearer " + accessToken },
      });
      nextPage = likedSongsResponse.data.next;
      songs = songs.concat(likedSongsResponse.data.items);
    }
  } catch (err) {
    console.error("error gettin liked songs!", err);
  }

  callback(songs);
}

// doesn't include liked songs
export async function getSpotifyPlaylists(spotifyId: string) {

  const accessToken = await getNewSpotifyAccessToken(spotifyId);

  let nextPage = `https://api.spotify.com/v1/users/${spotifyId}/playlists?limit=50`;
  let playlists: any[] = [];

  console.log("access", accessToken, "id", spotifyId)

  try {
    while (nextPage) {
      const playlistsResponse = await axios({
        url: nextPage,
        method: "get",
        headers: { Authorization: "Bearer " + accessToken },
      });
      nextPage = playlistsResponse.data.next;
      playlists = playlists.concat(playlistsResponse.data.items);
    }
  } catch (err) {
    console.error("error gettin playlists!", err);
  }

  return playlists;
}

export async function getSongsInSpotifyPlaylist(spotifyId: string, playlistId: string): Promise<any[]> {

  const accessToken = await getNewSpotifyAccessToken(spotifyId);

  let nextPage = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;
  let songs: any[] = [];

  try {
    while (nextPage) {
      const playlistSongsResponse = await axios({
        url: nextPage,
        method: "get",
        headers: { Authorization: "Bearer " + accessToken },
      });
      console.log("got page");
      nextPage = playlistSongsResponse.data.next;
      songs = songs.concat(playlistSongsResponse.data.items);
      return songs;
    }
  } catch (err) {
    console.error("error gettin playlist songs!");
  }
  return [];
}

export async function getNewSpotifyAccessToken(spotifyId: string) {

  const user = await getUserBySpotifyID(spotifyId);

  const tokenResponse = await axios({
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    data: {
      refresh_token: user?.spotifyRefreshToken,
      grant_type: "refresh_token",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
          ":" +
          process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    responseType: "json",
  });

  return tokenResponse.data.access_token;
  
}

export async function getNewSpotifyAccessTokenBySpotifyId(spotifyId: string) {
  const user = await getUserBySpotifyID(spotifyId);

  console.log("user result", user?.spotifyRefreshToken);

  if (user) return (await getNewSpotifyAccessToken(user.spotifyRefreshToken)).data.access_token
  else return "error";
}
