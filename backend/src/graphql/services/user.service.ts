import { PrismaClient } from "@prisma/client";
import { extractSelection } from "../utils/extractSelections";
import { GraphQLResolveInfo } from "graphql";

interface GetUsersArgs {
  info: GraphQLResolveInfo;
}

// interface GetUserArgs extends GetUsersArgs {
//   id: string;
// }
interface UserInput {
  spotifyRefreshToken: string;
  spotifyUsername?: string;
}

const prisma = new PrismaClient();

export const getUsers = async ({ info }: GetUsersArgs) => {
  const extractedSelections = extractSelection(info);
  const playlistsIncluded = extractedSelections.includes("playlists");

  if (playlistsIncluded) {
    return await prisma.user.findMany({ include: { playlists: true } });
  }

  return await prisma.user.findMany();
};

// export const getUser = async ({id, info}: GetUserArgs) => {
//   const extractedSelections = extractSelection(info);
//   const postsIncluded = extractedSelections.includes("posts");

//   if (postsIncluded) {
//     return await prisma.user.findUnique({where: {id}, include: {posts: true}});
//   }

//   return await prisma.user.findUnique({where: {id}});
// };

export const createUser = async ({
  spotifyRefreshToken = "guest",
  spotifyUsername = "guest",
}: UserInput) => {
  const createdUser = await prisma.user.create({
    data: {
      spotifyRefreshToken,
      spotifyUsername,
    },
  });

  return createdUser;
};
