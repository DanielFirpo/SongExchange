import { Request, Response } from "express";
import querystring from "querystring";
import axios from "axios";
import {
  getUserBySpotifyID,
  createUser,
  updateRefreshToken,
} from "../prisma/prismaUtils/userUtils";
import { createPlaylist } from "../prisma/prismaUtils/playlistUtils";
const jwt = require("jsonwebtoken");
import { getSpotifyLikedSongs, getNewSpotifyAccessToken } from "../utils";

const express = require("express");
const router = express.Router();

//base URL, frontend hits this to begin the login/signup process
router.get("/", function (req: Request, res: Response, next: Function) {
  const state =
    Math.floor(Math.random() * Date.now()).toString(36) +
    Math.floor(Math.random() * Date.now()).toString(36); //random string 16 chars long
  const scope = "user-read-private user-read-email user-library-read";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT,
        state: state,
      })
  );
});

//after user grants access on spotify, spotify returns them to this route, where we add their account/log them in
router.get(
  "/return",
  async function (req: Request, res: Response, next: Function) {
    console.log(req.query);

    if (req.query.error || !req.query.state) {
      console.log("ERROR!");
      return res.redirect(process.env.FRONTEND_URL + "/spotifyerror");
    }

    const code = req.query.code;

    try {
      
      const tokenResponse = await getNewSpotifyAccessToken(code);

      const accessToken = tokenResponse.data.access_token;
      const spotifyRefreshToken = tokenResponse.data.refresh_token;

      const userInfoResponse = await axios({
        url: "https://api.spotify.com/v1/me",
        method: "get",
        headers: { Authorization: "Bearer " + accessToken },
      });

      const spotifyId = userInfoResponse.data.id;

      console.log("USER INFO", userInfoResponse.data);

      const existingUser = await getUserBySpotifyID(spotifyId);

      const tokenForClient = generateJWT(spotifyId);

      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 15); //expires in 15 days

      res.cookie("token", tokenForClient, {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        expires: expiration,
      });

      if (existingUser) {
        //update refresh token in DB in case their previous refresh token is no longer valid (maybe they removed the app from spotify)
        await updateRefreshToken(spotifyId, spotifyRefreshToken);
        res.redirect(process.env.FRONTEND_URL + "/discover"); //redirect to home screen since they're logged in now
      } else {
        //new user sign up! add them to the db
        const newUser = await createUser(spotifyId, spotifyRefreshToken);

        if (newUser) {
          //get their liked songs and add them to the db
          getSpotifyLikedSongs(accessToken, (result: any[]) => {
            createPlaylist(
              newUser.id,
              undefined,
              "Liked Songs",
              result.map((song) => {
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
          });
        }

        res.redirect(process.env.FRONTEND_URL + "/welcome"); //redirect to welcome screen cause it's their first time on site

      }
    } catch (error) {
      console.error(error);
      return res.redirect(process.env.FRONTEND_URL + "/spotifyerror");
    }
  }
);

//lets the user know who they are, if their session is valid, and when their session will expire
router.get("/me", function (req: Request, res: Response, next: Function) {
  if (res.locals.user) {
    res.status(200).json(res.locals.user);
  } else {
    res.status(401).json({ error: "Not logged in." });
  }
});

//lets the user know who they are, if their session is valid, and when their session will expire
router.get("/logout", function (req: Request, res: Response, next: Function) {
  res.clearCookie("token");
  res.status(200).send("Logout success");
  //TODO: figure out JWT revokation?
});

function generateJWT(spotifyId: string): string {
  return jwt.sign({ spotifyId: spotifyId }, process.env.JWT_SECRET, {
    expiresIn: "1800s",
  });
}

export default router;
