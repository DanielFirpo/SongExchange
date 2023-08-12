/*
  Warnings:

  - A unique constraint covering the columns `[spotifyId]` on the table `Song` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spotifyUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "spotifyId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Song_spotifyId_key" ON "Song"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyUsername_key" ON "User"("spotifyUsername");
