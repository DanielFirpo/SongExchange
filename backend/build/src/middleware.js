"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.disallowTrace = void 0;
const jwt = require("jsonwebtoken");
function disallowTrace(req, res, next) {
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
exports.disallowTrace = disallowTrace;
function decodeToken(req, res, next) {
    const token = req.cookies.token;
    if (req.cookies && token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            console.log("Issue decoding token, client sent fake token?", err);
        }
    }
    next();
}
exports.decodeToken = decodeToken;
