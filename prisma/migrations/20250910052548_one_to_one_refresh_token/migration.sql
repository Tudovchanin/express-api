/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `RefreshToken` DROP FOREIGN KEY `RefreshToken_userId_fkey`;

-- DropIndex
DROP INDEX `RefreshToken_userId_fkey` ON `RefreshToken`;

-- CreateIndex
CREATE UNIQUE INDEX `RefreshToken_userId_key` ON `RefreshToken`(`userId`);

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
