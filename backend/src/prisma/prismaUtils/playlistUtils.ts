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

    const existingSongs = await prisma.song.findMany({
      where: {
        spotifyId: { in: songs.map((song) => song.spotifyId).filter((song) => song) },
      },
    });

    let existingPlaylist = null;
    if (playlistId) {
      existingPlaylist = await prisma.song.findMany({
        where: {
          spotifyId: playlistId,
        },
      });
    }

    //do not add playlist if it already exists in DB
    if (existingPlaylist && existingPlaylist.length > 0) return null;

    //filter out songs already in the db
    let uniqueSongs = songs.filter((song) => {
      return !existingSongs.find((existingSong) => {
        return song.spotifyId == existingSong.spotifyId;
      });
    });

    function removeDuplicates(songs: any) {
      let jsonObject = songs.map((song: any) => JSON.stringify(song));
      let uniqueSet = new Set(jsonObject);
      return Array.from(uniqueSet).map((item: any) => JSON.parse(item));
    }

    uniqueSongs = removeDuplicates(uniqueSongs);

    uniqueSongs = uniqueSongs.filter((song) => song.spotifyId); //remove nulls

    const newPlaylist = await prisma.playlist.create({
      data: {
        userId: user?.id || "",
        spotifyId: playlistId,
        name: name,
        songs: {
          create: uniqueSongs.map((song) => ({
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

    //Connect songs already existing in the DB to this playlist aswell
    await prisma.playlist.update({
      where: { id: newPlaylist.id },
      data: {
        songs: {
          create: existingSongs.map((song) => {
            return {
              song: {
                connect: { id: song.id },
              },
            };
          }),
        },
      },
    });

    return newPlaylist;
  } catch (error: any) {
    throw new Error(`Error creating playlist: ${error.message}`);
  }
}

export async function getUserPlaylists(spotifyUsername: string | undefined) {
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
  return user.playlists;
}

interface Recommendations {
  users: RecommendationUser[];
  noMatches: boolean;
}

interface RecommendationUser {
  name: string;
  commonality: number;
  totalSongsInCommon: number;
  totalSongsNotInCommon: number;
  playlists: RecommendationPlaylist[];
}

interface RecommendationPlaylist {
  name: string;
  songsInCommon: {
    name: string;
    spotifyId: string;
    artist: string;
  }[];
  newSongs: {
    name: string;
    spotifyId: string;
    artist: string;
  }[];
}

export async function getUsersWithMostSongsInCommon(spotifyUsername: string): Promise<Recommendations | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        spotifyUsername: spotifyUsername,
      },
      select: {
        playlists: {
          select: {
            songs: {
              select: {
                song: {
                  select: {
                    spotifyId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const songSpotifyIds =
      user?.playlists.flatMap((playlist) => playlist.songs.map((songInPlaylist) => songInPlaylist.song.spotifyId)) ||
      [];

    let usersWithMatchingPlaylists = await prisma.user.findMany({
      where: {
        NOT: {
          spotifyUsername: {
            equals: spotifyUsername,
          },
        },
        playlists: {
          some: {
            songs: {
              some: {
                song: {
                  spotifyId: {
                    in: songSpotifyIds,
                  },
                },
              },
            },
          },
        },
      },
    });

    let responseForClient: Recommendations = {
      users: [],
      noMatches: usersWithMatchingPlaylists.length == 0,
    };

    if (responseForClient.noMatches) {
      usersWithMatchingPlaylists = await prisma.$queryRaw`
    SELECT *
    FROM public."User"
    ORDER BY random()
    LIMIT 30;`;
    }

    usersWithMatchingPlaylists = usersWithMatchingPlaylists.filter((user) => {
      return user.spotifyUsername != spotifyUsername;
    });

    for (const matchingUser of usersWithMatchingPlaylists) {
      const playlistsAndSongs = await prisma.user.findUnique({
        where: {
          spotifyUsername: matchingUser.spotifyUsername,
        },
        include: {
          playlists: {
            include: {
              songs: {
                include: {
                  song: true,
                },
              },
            },
          },
        },
      });

      const playlistsWithSongs = playlistsAndSongs?.playlists || [];

      let userRecommendation: RecommendationUser = {
        name: matchingUser.spotifyUsername,
        commonality: 0,
        totalSongsInCommon: 0,
        totalSongsNotInCommon: 0,
        playlists: [],
      };

      for (const playlist of playlistsWithSongs) {
        let newPlaylist: RecommendationPlaylist = {
          name: playlist.name,
          songsInCommon: [],
          newSongs: [],
        };

        for (const song of playlist.songs) {
          const formattedSong = {
            name: song.song.name,
            spotifyId: song.song.spotifyId,
            artist: song.song.artist,
          };
          if (songSpotifyIds.includes(song.song.spotifyId)) {
            newPlaylist.songsInCommon.push(formattedSong);
          } else {
            newPlaylist.newSongs.push(formattedSong);
          }
        }

        userRecommendation.playlists.push(newPlaylist);
      }

      const commonCount = userRecommendation.playlists.reduce(
        (count, playlist) => count + playlist.songsInCommon.length,
        0
      );
      const uncommonCount = userRecommendation.playlists.reduce(
        (count, playlist) => count + playlist.newSongs.length,
        0
      );

      userRecommendation.commonality =
        commonCount + uncommonCount != 0 ? (commonCount / (commonCount + uncommonCount)) * 100 : 0;
      userRecommendation.commonality = Math.round(userRecommendation.commonality);
      userRecommendation.totalSongsInCommon = commonCount;
      userRecommendation.totalSongsNotInCommon = uncommonCount;

      responseForClient.users.push(userRecommendation);
    }

    //sort results by commonality
    responseForClient.users = responseForClient.users.sort((a, b) => {
      return b.commonality - a.commonality;
    });

    //max 30 users
    responseForClient.users = responseForClient.users.slice(0, 30);

    console.log("sending response", responseForClient);

    return responseForClient;
  } catch (error: any) {
    throw new Error(`Error creating playlist: ${error.message}`);
  }
}
