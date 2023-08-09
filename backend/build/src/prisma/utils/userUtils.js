"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRefreshToken = exports.createUser = exports.getUserBySpotifyID = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getUserBySpotifyID(spotifyUsername) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.findUnique({
                where: {
                    spotifyUsername: spotifyUsername,
                },
            });
            return user;
        }
        catch (error) {
            console.error("Error while checking user", error);
        }
        return null;
    });
}
exports.getUserBySpotifyID = getUserBySpotifyID;
function createUser(spotifyUsername, spotifyRefreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newUser = yield prisma.user.create({
                data: {
                    spotifyUsername: spotifyUsername,
                    spotifyRefreshToken: spotifyRefreshToken,
                },
            });
            console.log("New user created:", newUser);
            return newUser;
        }
        catch (error) {
            console.error("Error creating user:", error);
        }
        finally {
            return undefined;
        }
    });
}
exports.createUser = createUser;
function updateRefreshToken(spotifyUsername, newRefreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedUser = yield prisma.user.update({
                where: {
                    spotifyUsername: spotifyUsername,
                },
                data: {
                    spotifyRefreshToken: newRefreshToken,
                },
            });
            return updatedUser;
        }
        catch (error) {
            console.error("Error while updating refresh token:", error);
            return null;
        }
    });
}
exports.updateRefreshToken = updateRefreshToken;
