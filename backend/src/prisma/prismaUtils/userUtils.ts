import { User } from "@prisma/client";
import prisma from "../prismaConnection";

//util file for interactions with the database involving users

export async function getUserBySpotifyID(spotifyUsername: string): Promise<User | null | undefined> {
  console.log("WORK MOOMOOMO");
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
  spotifyRefreshToken: string,
  spotifyAccessToken: string,
  expiresAt: number
): Promise<User | undefined> {
  try {
    const newUser: User = await prisma.user.create({
      data: {
        spotifyUsername: spotifyUsername,
        spotifyRefreshToken: spotifyRefreshToken,
        spotifyAccessToken: spotifyAccessToken,
        spotifyAccessTokenExpiration: expiresAt,
      },
    });
    console.log("New user created:", newUser);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
  }
  return undefined;
}

export async function setLoggedIn(
  spotifyUsername: string,
  newRefreshToken: string | undefined,
  newAccessToken: string | undefined,
  expiresAt: number | undefined
): Promise<User | null> {
  try {
    let updatedUser: User | null;
    if (newRefreshToken && newAccessToken && expiresAt) {
      updatedUser = await prisma.user.update({
        where: {
          spotifyUsername: spotifyUsername,
        },
        data: {
          spotifyRefreshToken: newRefreshToken,
          spotifyAccessToken: newAccessToken,
          spotifyAccessTokenExpiration: expiresAt,
          isLoggedIn: true,
        },
      });
    } else {
      //if undefined values are passed in that means we want to log out user
      updatedUser = await prisma.user.update({
        where: {
          spotifyUsername: spotifyUsername,
        },
        data: {
          isLoggedIn: false,
        },
      });
    }

    return updatedUser;
  } catch (error) {
    console.error("Error while updating refresh token:", error);
    return null;
  }
}

export async function updateAccessToken(
  spotifyUsername: string,
  newAccessToken: string,
  expiresAt: number
): Promise<User | null> {
  try {
    const updatedUser: User | null = await prisma.user.update({
      where: {
        spotifyUsername: spotifyUsername,
      },
      data: {
        spotifyAccessToken: newAccessToken,
        spotifyAccessTokenExpiration: expiresAt,  
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error while updating refresh token:", error);
    return null;
  }
}
