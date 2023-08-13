import { Request, Response } from "express";
import { getSpotifyPlaylists, getNewSpotifyAccessTokenBySpotifyId } from "../utils";


const express = require("express");
const router = express.Router();

//get a user's public playists
router.get("/spotifyplaylists", async function (req: Request, res: Response, next: Function) {
  const user = res.locals.user;
    if (user) {
        res.status(200).json(await getSpotifyPlaylists(await getNewSpotifyAccessTokenBySpotifyId(user.spotifyId), user.spotifyId));
      } else {
        res.status(401).json({ error: "Not logged in." });
      }
});

export default router;
