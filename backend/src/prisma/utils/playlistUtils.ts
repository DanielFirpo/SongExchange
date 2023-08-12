import { Playlist, Song } from "@prisma/client";
import prisma from "../prismaConnection";

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
