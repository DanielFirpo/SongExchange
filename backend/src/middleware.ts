import { Request, Response } from "express";
import { getUserBySpotifyID } from "./prisma/prismaUtils/userUtils";
import { generateJWT } from "./utils";
const jwt = require("jsonwebtoken");

export function disallowTrace(req: Request, res: Response, next: Function) {
  // NOTE: Exclude TRACE and TRACK methods to avoid XST attacks.
  const allowedMethods = ["OPTIONS", "HEAD", "CONNECT", "GET", "POST", "PUT", "DELETE", "PATCH"];

  if (!allowedMethods.includes(req.method)) {
    res.status(405).send(`${req.method} not allowed.`);
  }

  next();
}

export async function decodeToken(req: Request, res: Response, next: Function) {
  const token = req.cookies?.token;
  if (token) {
    try {
      res.locals.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        console.log("jwt", err)
        let spotifyId = jwt.decode(token).spotifyId;
        const existingUser = await getUserBySpotifyID(spotifyId);
        console.log(existingUser, spotifyId)
        if (existingUser?.isLoggedIn && !existingUser?.isSuspended) {
          console.log("granting new token")
          const expiration = new Date();
          expiration.setDate(expiration.getDate() + 15); //expires in 15 days

          res.cookie("token", generateJWT(spotifyId), {
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            expires: expiration,
          });
        }
      } else {
        console.log("Issue decoding token, client sent fake token?", err);
        res.locals.user = undefined;
        res.clearCookie("token");
      }
    }
  }
  else {
    res.locals.user = undefined;
  }
  next();
}

export function loggedInOnly(req: Request, res: Response, next: Function) {
  const user = res.locals.user;
  if (user) {
    next();
  } else {
    res.status(401).json({ error: "Not authorized" });
  }
}
