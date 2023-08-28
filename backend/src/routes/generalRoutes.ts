import { Request, Response } from "express";
import { createSpotifyPlaylist, getSongsInSpotifyPlaylist, getSpotifyPlaylists } from "../utils";
import { createPlaylist, getUserPlaylists, getUsersWithMostSongsInCommon } from "../prisma/prismaUtils/playlistUtils";
import { Song } from "@prisma/client";
import { loggedInOnly } from "../middleware";
import { IsArray, IsString, validate } from "class-validator";
import { createUser } from "../prisma/prismaUtils/userUtils";

const express = require("express");
const router = express.Router();

//get a user's playlists ON SPOTIFY
router.get("/spotifyplaylists", loggedInOnly, async function (req: Request, res: Response, next: Function) {
  console.log("get /spotifyplaylists");
  const user = res.locals.user;
  res.status(200).json(await getSpotifyPlaylists(user.spotifyId));
});

//gets the playlists in db for a user
router.get("/playlists", loggedInOnly, async function (req: Request, res: Response, next: Function) {
  console.log("get /playlists");
  const user = res.locals.user;
  res.status(200).json(await getUserPlaylists(user.spotifyId));
});

//set playlist
router.post("/playlists", loggedInOnly, async function (req: Request, res: Response, next: Function) {
  const user = res.locals.user;
  for (let playlist of req.body) {
    const songs = await getSongsInSpotifyPlaylist(user.spotifyId, playlist.id);
    const formattedSongs = songs.map((song): Omit<Song, "id"> => {
      return {
        spotifyId: song.track.id,
        name: song.track.name,
        artist: song.track.artists[0].name,
      };
    });

    createPlaylist(user.spotifyId, playlist.id, playlist.name, formattedSongs);
  }

  res.status(200).json({ data: "Success!" });
});

router.get("/recommendations", loggedInOnly, async function (req: Request, res: Response, next: Function) {
  console.log("get /recommendations");
  const user = res.locals.user;
  res.status(200).json(await getUsersWithMostSongsInCommon(user.spotifyId));
});

class ExportInput {
  @IsArray()
  @IsString({
    each: true,
  })
  songs: string[];
  @IsString()
  playlistName: string;
  @IsString()
  playlistDescription: string;
}

router.post("/export", loggedInOnly, async function (req: Request, res: Response, next: Function) {
  console.log("post /exports");
  const user = res.locals.user;

  const input: ExportInput = new ExportInput();

  input.songs = req.body.songs;
  input.playlistName = req.body.playlistName;
  input.playlistDescription = req.body.playlistDescription;

  const errors = await validate(input);

  if (errors.length) {
    return res.status(400).json({
      error: errors,
    });
  }

  const result = await createSpotifyPlaylist(
    input.songs,
    user.spotifyId,
    input.playlistName,
    input.playlistDescription
  );

  if (result?.status == 201) {
    return res.status(200).json(result?.data);
  } else {
    return res.status(500).json("Error creating playlist with Spotify API");
  }
});

router.post("/adminadduser", loggedInOnly, async function (req: Request, res: Response, next: Function) {
  const user = res.locals.user;
  const spotifyId = user.spotifyId;

  if (spotifyId !== "trtld2") {
    return res.status(401).json({ error: "Not authorized" });
  }

  const playlistId = req.body.id;
  const playlistOwner = req.body.owner;
  let songs = await getSongsInSpotifyPlaylist(spotifyId, playlistId);

  await createUser(playlistOwner, "", "", 0);

  await createPlaylist(
    playlistOwner,
    undefined,
    "Liked Songs",
    songs.map((song) => {
      const songArtist: string = song.track.artists[0].name;
      const songName: string = song.track.name;
      const songId: string = song.track.id;
      return {
        name: songName,
        artist: songArtist,
        spotifyId: songId,
      };
    })
  );

  return res.status(200).json({ data: "Success!" });
});

export default router;
