import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import fs from "fs";
import csv from "csv-parser";
import path from 'path';
import Fakerator from "fakerator";
import { createPlaylist } from "../prismaUtils/playlistUtils";
var fakerator = Fakerator();

async function main() {
  //clear all previous data

  // async function deleteAllData() {
  //   await prisma.songsInPlaylists.deleteMany();
  //   await prisma.playlist.deleteMany();
  //   await prisma.song.deleteMany();
  //   await prisma.user.deleteMany();
  // }

  // deleteAllData()
  //   .catch((e) => {
  //     throw e;
  //   })
  //   .finally(async () => {
  //     await prisma.$disconnect();
  //   });

  interface Song {
    name: string;
    artist: string;
    spotifyId: string;
  }
  type SongArray = Array<Song>;

  //like 20k songs here
  const songData: SongArray = (await readCSVFile(path.join('.', 'src', 'prisma', 'seed', 'seeddata.csv'))) as SongArray;

  const randomUsernames = fakerator.times(fakerator.internet.userName, 500);
  //add 1000 random users
  for (let username of randomUsernames) {
    //add user
    await prisma.user.create({
      data: {
        spotifyUsername: username,
        spotifyAccessToken: "none",
        spotifyRefreshToken: "none",
        spotifyAccessTokenExpiration: 1700000000000,
      },
    });

    //add songs to user:

    const getRandomSongs = (maxAmount: number): SongArray =>
      songData.sort(() => 0.5 - Math.random()).slice(0, Math.random() * maxAmount);

    //add liked songs playlist to user
    await createPlaylist(
      username,
      undefined,
      "Liked Songs",
      getRandomSongs(4000).map((song) => {
        return {
          name: song.artist,
          artist: song.name,
          spotifyId: song.spotifyId,
        };
      })
    );

    //add 0-5 playlists to user:

    for (let i = 0; i < Math.floor(Math.random() * 6); i++) {
      await createPlaylist(
        username,
        undefined,
        fakerator.lorem.word() + fakerator.lorem.word(),
        getRandomSongs(2000).map((song) => {
          return {
            name: song.artist,
            artist: song.name,
            spotifyId: song.spotifyId,
          };
        })
      );
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error while seeding data:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function readCSVFile(file: string) {
  return new Promise((resolve, reject) => {
    const result: Array<any> = [];

    fs.createReadStream(file)
      .pipe(csv())
      .on("data", (row) => {
        result.push(row);
      })
      .on("end", () => {
        resolve(result);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
