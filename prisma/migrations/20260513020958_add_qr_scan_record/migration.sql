-- AlterTable
ALTER TABLE `biz_complaint_feedbacks` MODIFY `satisfaction` ENUM('SATISFIED', 'BASICALLY_SATISFIED', 'DISSATISFIED', 'NEED_INTERVENTION') NOT NULL;

-- CreateTable
CREATE TABLE `biz_qr_scan_records` (
    `id` VARCHAR(191) NOT NULL,
    `qrcodeId` VARCHAR(30) NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `scannerType` VARCHAR(20) NOT NULL DEFAULT 'CONSUMER',
    `scannerName` VARCHAR(100) NULL,
    `scannerId` VARCHAR(30) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `location` VARCHAR(200) NULL,
    `action` VARCHAR(20) NOT NULL DEFAULT 'VIEW',
    `remark` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `biz_qr_scan_records_qrcodeId_idx`(`qrcodeId`),
    INDEX `biz_qr_scan_records_entityId_idx`(`entityId`),
    INDEX `biz_qr_scan_records_scannerType_idx`(`scannerType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `biz_qr_scan_records` ADD CONSTRAINT `biz_qr_scan_records_qrcodeId_fkey` FOREIGN KEY (`qrcodeId`) REFERENCES `biz_qrcodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_qr_scan_records` ADD CONSTRAINT `biz_qr_scan_records_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_feedback` ADD CONSTRAINT `biz_feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
