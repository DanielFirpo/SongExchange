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
exports.createUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const extractSelections_1 = require("../utils/extractSelections");
const prisma = new client_1.PrismaClient();
const getUsers = ({ info }) => __awaiter(void 0, void 0, void 0, function* () {
    const extractedSelections = (0, extractSelections_1.extractSelection)(info);
    const playlistsIncluded = extractedSelections.includes("playlists");
    if (playlistsIncluded) {
        return yield prisma.user.findMany({ include: { playlists: true } });
    }
    return yield prisma.user.findMany();
});
exports.getUsers = getUsers;
// export const getUser = async ({id, info}: GetUserArgs) => {
//   const extractedSelections = extractSelection(info);
//   const postsIncluded = extractedSelections.includes("posts");
//   if (postsIncluded) {
//     return await prisma.user.findUnique({where: {id}, include: {posts: true}});
//   }
//   return await prisma.user.findUnique({where: {id}});
// };
const createUser = ({ spotifyRefreshToken = "guest", spotifyUsername = "guest", }) => __awaiter(void 0, void 0, void 0, function* () {
    const createdUser = yield prisma.user.create({
        data: {
            spotifyRefreshToken,
            spotifyUsername,
        },
    });
    return createdUser;
});
exports.createUser = createUser;
