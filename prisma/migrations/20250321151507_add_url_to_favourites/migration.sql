/*
  Warnings:

  - Added the required column `url` to the `favourites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "favourites" ADD COLUMN     "url" TEXT NOT NULL;
