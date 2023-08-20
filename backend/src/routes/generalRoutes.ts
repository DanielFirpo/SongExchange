import { Request, Response } from "express";
import {
  getSongsInSpotifyPlaylist,
  getSpotifyPlaylists,
} from "../utils";
import {
  createPlaylist,
  getUserPlaylists,
} from "../prisma/prismaUtils/playlistUtils";
import { Song } from "@prisma/client";

const express = require("express");
const router = express.Router();

//get a user's playlists ON SPOTIFY
router.get(
  "/spotifyplaylists",
  async function (req: Request, res: Response, next: Function) {
    console.log("get /spotifyplaylists")
    const user = res.locals.user;
    if (user) {
      res.status(200).json(await getSpotifyPlaylists(user.spotifyId));
    } else {
      res.status(401).json({ error: "Not logged in." });
    }
  }
);

//gets the playlists in db for a user
router.get(
  "/playlists",
  async function (req: Request, res: Response, next: Function) {
    console.log("get /playlists")
    const user = res.locals.user;
    if (user) {
      res.status(200).json(await getUserPlaylists(user.spotifyId));
    } else {
      res.status(401).json({ error: "Not logged in." });
    }
  }
);

//set playlist
router.post(
  "/playlists",
  async function (req: Request, res: Response, next: Function) {
    const user = res.locals.user;
    console.log("request", req.body)
    if (user) {
      req.body.forEach(async (playlist: any) => {
        const songs = await getSongsInSpotifyPlaylist(
          user.spotifyId,
          playlist.id
        );
        const formattedSongs = songs.map((song) : Omit<Song, "id"> => {
          return {
            spotifyId: song.track.id,
            name: song.track.name,
            artist: song.track.artists[0].name
          }
        });
        console.log(formattedSongs);

        createPlaylist(user.spotifyId, playlist.id, playlist.name, formattedSongs);
      });
      
      res.status(200).json({ data: "Success!" });
    } else {
      res.status(401).json({ error: "Not logged in." });
    }
  }
);

export default router;
