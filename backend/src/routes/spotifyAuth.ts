import { Request, Response } from "express";
import querystring from "querystring";
import axios from "axios";
import { getUserBySpotifyID, createUser, setLoggedIn } from "../prisma/prismaUtils/userUtils";
import { createPlaylist } from "../prisma/prismaUtils/playlistUtils";
import { generateJWT, getSpotifyLikedSongs } from "../utils";
import { loggedInOnly } from "../middleware";

const express = require("express");
const router = express.Router();

//base URL, frontend hits this to begin the login/signup process
router.get("/", function (req: Request, res: Response, next: Function) {
  const state =
    Math.floor(Math.random() * Date.now()).toString(36) + Math.floor(Math.random() * Date.now()).toString(36); //random string 16 chars long
  const scope = "user-read-private user-read-email user-library-read playlist-modify-public playlist-modify-private";

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
router.get("/return", async function (req: Request, res: Response, next: Function) {
  console.log(req.query);

  if (req.query.error || !req.query.state) {
    console.log("ERROR!");
    return res.redirect(process.env.FRONTEND_URL + "/spotifyerror");
  }

  const code = req.query.code;

  try {
    const tokenResponse = await axios({
      url: "https://accounts.spotify.com/api/token",
      method: "post",
      data: {
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      responseType: "json",
    });

    const accessToken = tokenResponse.data.access_token;
    const accessExpiration = new Date().getTime() + (tokenResponse.data.expires_in * 1000);
    const spotifyRefreshToken = tokenResponse.data.refresh_token;

    const userInfoResponse = await axios({
      url: "https://api.spotify.com/v1/me",
      method: "get",
      headers: { Authorization: "Bearer " + accessToken },
    });

    const spotifyId = userInfoResponse.data.id;

    console.log("USER INFO", userInfoResponse.data);

    const existingUser = await getUserBySpotifyID(spotifyId);

    if (existingUser?.isSuspended) {
      return res.status(405).json("Account Suspended");
    }

    //if new user OR it's an existing user that isn't suspended, grant token
    if (!existingUser || !existingUser.isSuspended) {
      const tokenForClient = generateJWT(spotifyId);

      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 15); //expires in 15 days

      res.cookie("token", tokenForClient, {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        expires: expiration,
      });
    }

    if (existingUser) {
      //update refresh token in DB in case their previous refresh token is no longer valid (maybe they removed the app from spotify)
      await setLoggedIn(spotifyId, spotifyRefreshToken, accessToken, accessExpiration);
      res.redirect(process.env.FRONTEND_URL + "/discover"); //redirect to home screen since they're logged in now
    } else {
      //new user sign up! add them to the db
      const newUser = await createUser(spotifyId, spotifyRefreshToken, accessToken, accessExpiration);

      if (newUser) {
        console.log("new user", newUser);
        //get their liked songs and add them to the db
        await getSpotifyLikedSongs(spotifyId, async (result: any[]) => {
          await createPlaylist(
            spotifyId,
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
});

//lets the user know who they are, if their session is valid, and when their session will expire
router.get("/me", loggedInOnly, function (req: Request, res: Response, next: Function) {
  res.status(200).json(res.locals.user);
});

router.get("/logout", loggedInOnly, async function (req: Request, res: Response, next: Function) {
  res.clearCookie("token");
  await setLoggedIn(res.locals.user.spotifyId, undefined, undefined, undefined);
  res.status(200).send("Logout success");
});

export default router;
