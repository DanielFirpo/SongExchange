import { GraphQLResolveInfo } from "graphql";
import {
  createPlaylist,
  getUserPlaylists,
} from "../../prisma/prismaUtils/playlistUtils";
import { Playlist, Song } from "@prisma/client";

export const usersResolver = {
  Query: {
    // async users(_: any, args: Record<string, any>, context: any, info: GraphQLResolveInfo) {
    //   return await getUsers({info});
    // },
    // async user(_: any, args: Record<string, any>, context: any, info: GraphQLResolveInfo) {
    //   return await getUser({id: args.id, info});
    // },
    async userPlaylists(
      _: any,
      args: Record<string, any>,
      context: any,
      info: GraphQLResolveInfo
    ) {
      console.log("getting user playlists");
      if (!context.user) {
        console.log("unauthorized!", context);
        return {
          error: "You are not authorized to view this data.",
        };
      }
      const playlists = await getUserPlaylists(context.user);
      return playlists;
    },
  },
  Mutation: {
    // async createUser(_: any, {input}: Record<string, any>) {
    //   return await createUser({spotifyRefreshToken: input.spotifyRefreshToken, spotifyUsername: input.spotifyUsername});
    // },
    async addPlaylist(
      parent: any,
      args: {
        userId: string;
        playlistId: string;
        name: string;
        songs: Omit<Song, "id">[];
      },
      context: any
    ): Promise<Playlist | null> {
      return createPlaylist(
        args.userId,
        args.playlistId,
        args.name,
        args.songs
      );
    },
    async updateUser() {},
    async deleteUser() {},
  },
};
