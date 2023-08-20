import { Playlist, Song } from "@prisma/client";
import prisma from "../prismaConnection";
import { getUserBySpotifyID } from "./userUtils";

//util file for interactions with the database involving playlists

export async function createPlaylist(
  userId: string,
  playlistId: string | undefined,
  name: string,
  songs: Omit<Song, "id">[]
): Promise<Playlist | null> {
  try {

    const user = await getUserBySpotifyID(userId);

    console.log("user", user)

    const existingSongs = await prisma.song.findMany({
      where: {
        spotifyId: { in: songs.map((song) => song.spotifyId) },
      },
    })

    console.log("songs before unique check", songs)
    const existingPlaylist = await prisma.song.findMany({
      where: {
        spotifyId: playlistId,
      },
    })

    if (existingPlaylist.length > 0) return null;

    //filter out songs already in the db
    songs = songs.filter((song) => {
      return !existingSongs.find((existingSong) => {
        return song.spotifyId == existingSong.spotifyId;
      })
    })

    console.log("songs after unique check", songs)

    const newPlaylist = await prisma.playlist.create({
      data: {
        userId: user?.id || "",
        spotifyId: playlistId,
        name: name,
        songs: {
          create: songs.map((song) => ({
            song: {
                create: {
                  ...song
                },
              },
          })),
        },
      },
      include: {
        songs: true,
      },
    });

    return newPlaylist;
  } catch (error: any) {
    throw new Error(`Error creating playlist: ${error.message}`);
  }
}

export async function getUserPlaylists(spotifyUsername: string | undefined) {
    console.log("getting playlists for ", spotifyUsername);
    const user = await prisma.user.findUnique({
      where: {
        spotifyUsername: spotifyUsername,
      },
      include: {
        playlists: true,
      },
    });
  
    if (!user) {
      throw new Error(`User with username ${spotifyUsername} not found`);
    }
    console.log("GOT USER PLAYLIIIIIIST", user.playlists);
    return user.playlists;
  }
  