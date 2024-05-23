/*
  Warnings:

  - You are about to drop the column `user_id` on the `recipes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_user_id_fkey";

-- AlterTable
ALTER TABLE "recipes" DROP COLUMN "user_id";
