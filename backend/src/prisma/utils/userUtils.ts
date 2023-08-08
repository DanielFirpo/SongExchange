import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserBySpotifyID(
  spotifyUsername: string
): Promise<User | null | undefined> {
  try {
    const user: User | null = await prisma.user.findUnique({
      where: {
        spotifyUsername: spotifyUsername,
      },
    });

    return user;
  } catch (error) {
    console.error("Error while checking user", error);
  }
  return null;
}

export async function createUser(
  spotifyUsername: string,
  spotifyRefreshToken: string
): Promise<User | undefined> {
  try {
    const newUser: User = await prisma.user.create({
      data: {
        spotifyUsername: spotifyUsername,
        spotifyRefreshToken: spotifyRefreshToken,
      },
    });
    console.log("New user created:", newUser);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    return undefined;
  }
}

export async function updateRefreshToken(
  spotifyUsername: string,
  newRefreshToken: string
): Promise<User | null> {
  try {
    const updatedUser: User | null = await prisma.user.update({
      where: {
        spotifyUsername: spotifyUsername,
      },
      data: {
        spotifyRefreshToken: newRefreshToken,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error while updating refresh token:", error);
    return null;
  }
}
