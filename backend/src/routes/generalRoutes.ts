import { Request, Response } from "express";
import querystring from "querystring";
import axios from "axios";
import {
  getUserBySpotifyID,
  createUser,
  updateRefreshToken,
} from "../prisma/utils/userUtils";

const express = require("express");
const router = express.Router();

router.get("/logout", function (req: Request, res: Response, next: Function) {
  res.clearCookie("token");
  res.status(200).send("Logout success");
});

export default router;
