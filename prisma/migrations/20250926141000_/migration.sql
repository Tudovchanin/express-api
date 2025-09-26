/*
  Warnings:

  - You are about to drop the column `emailСonfirmed` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `emailСonfirmed`,
    ADD COLUMN `emailConfirmed` BOOLEAN NOT NULL DEFAULT false;
