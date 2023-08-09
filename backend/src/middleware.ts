import { Request, Response } from "express";
const jwt = require("jsonwebtoken");

export function disallowTrace(req: Request, res: Response, next: Function) {
  // NOTE: Exclude TRACE and TRACK methods to avoid XST attacks.
  const allowedMethods = [
    "OPTIONS",
    "HEAD",
    "CONNECT",
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ];

  if (!allowedMethods.includes(req.method)) {
    res.status(405).send(`${req.method} not allowed.`);
  }

  next();
}

export function decodeToken(req: Request, res: Response, next: Function) {
  const token = req.cookies?.token;
  if (token) {
    try {
        res.locals.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("Issue decoding token, client sent fake token?", err);
    }
  }
  next();
}
