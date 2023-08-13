import { Playlist, Song } from "@prisma/client";
import prisma from "../prismaConnection";

//util file for interactions with the database involving playlists

//TODO: Test if this explodes when a playlist is added
//that contains a song that is already in the DB
export async function createPlaylist(
  userId: string,
  playlistId: string | undefined,
  name: string,
  songs: Omit<Song, "id">[]
): Promise<Playlist | null | undefined> {
  try {
    const newPlaylist = await prisma.playlist.create({
      data: {
        userId: userId,
        spotifyId: playlistId,
        name: name,
        songs: {
          create: songs.map((song) => ({
            song: {
              create: {
                ...song,
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
  