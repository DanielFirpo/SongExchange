import {GraphQLResolveInfo} from "graphql";
import {createUser, getUsers} from "../services/user.service";

export const usersResolver = {
  Query: {
    async users(_: any, args: Record<string, any>, context: any, info: GraphQLResolveInfo) {
      return await getUsers({info});
    },
    // async user(_: any, args: Record<string, any>, context: any, info: GraphQLResolveInfo) {
    //   return await getUser({id: args.id, info});
    // },
  },
  Mutation: {
    async createUser(_: any, {input}: Record<string, any>) {
      return await createUser({spotifyRefreshToken: input.spotifyRefreshToken, spotifyUsername: input.spotifyUsername});
    },
    async updateUser() {},
    async deleteUser() {},
  },
};