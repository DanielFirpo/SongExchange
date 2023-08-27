import axios from "axios";
import { getUserBySpotifyID } from "./prisma/prismaUtils/userUtils";
const jwt = require("jsonwebtoken");
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

  console.log("access", accessToken, "id", spotifyId);

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

  if (user?.spotifyAccessTokenExpiration) {
    if (new Date().getTime() < user?.spotifyAccessTokenExpiration) {
      return user.spotifyAccessToken;
    }
  }

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
        Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    responseType: "json",
  });

  return tokenResponse.data.access_token;
}

// export async function getNewSpotifyAccessTokenBySpotifyId(spotifyId: string) {
//   const user = await getUserBySpotifyID(spotifyId);

//   console.log("user result", user?.spotifyRefreshToken);

//   if (user)
//     return (await getNewSpotifyAccessToken(user.spotifyRefreshToken)).data
//       .access_token;
//   else return "error";
// }

export async function createSpotifyPlaylist(
  songs: string[],
  spotifyId: string,
  name: string = "Song Exchange Export",
  description?: string
) {
  const accessToken = await getNewSpotifyAccessToken(spotifyId);

  try {
    const playlistsResponse = await axios({
      url: `https://api.spotify.com/v1/users/${spotifyId}/playlists`,
      method: "post",
      headers: { Authorization: "Bearer " + accessToken },
      data: {
        name: name,
        description: description,
        public: true,
      },
    });

    //format as URIs
    songs = songs.map((songId) => {
      return "spotify:track:" + songId;
    });

    //can only send 100 songs at a time
    for (let i = 0; i < songs.length; i += 100) {
      await axios({
        url: `https://api.spotify.com/v1/playlists/${playlistsResponse.data.id}/tracks`,
        method: "post",
        headers: { Authorization: "Bearer " + accessToken },
        data: {
          position: 0,
          uris: songs.slice(i, i + 100),
        },
      });
    }

    return playlistsResponse;
  } catch (err) {
    console.error("error setting playlist!", err);
    return undefined;
  }
}

export function generateJWT(spotifyId: string): string {
  return jwt.sign({ spotifyId: spotifyId }, process.env.JWT_SECRET, {
    expiresIn: "3600s",
  });
}
