-- CreateTable
CREATE TABLE `streets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NULL,
    `district` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `streets_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `realName` VARCHAR(50) NULL,
    `phone` VARCHAR(20) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'INSPECTOR', 'SCREENER', 'OPERATOR', 'CONSUMER') NOT NULL DEFAULT 'CONSUMER',
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `avatar` VARCHAR(500) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `streetId` VARCHAR(30) NULL,
    `entityId` VARCHAR(30) NULL,

    UNIQUE INDEX `sys_users_username_key`(`username`),
    UNIQUE INDEX `sys_users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_entities` (
    `id` VARCHAR(191) NOT NULL,
    `creditCode` VARCHAR(18) NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` ENUM('RESTAURANT', 'CANTEEN', 'WORKSHOP', 'SUPERMARKET', 'CONVENIENCE', 'WHOLESALE', 'OTHER') NOT NULL,
    `legalPerson` VARCHAR(50) NULL,
    `address` VARCHAR(500) NULL,
    `streetId` VARCHAR(30) NULL,
    `businessScope` VARCHAR(500) NULL,
    `establishedAt` DATETIME(3) NULL,
    `riskLevel` ENUM('UNRATED', 'LOW', 'LOWER', 'MEDIUM', 'HIGHER', 'HIGH') NOT NULL DEFAULT 'UNRATED',
    `riskScore` INTEGER NOT NULL DEFAULT 0,
    `riskRatedAt` DATETIME(3) NULL,
    `guaranteeLevel` VARCHAR(20) NULL,
    `safetyDirector` VARCHAR(50) NULL,
    `safetyOfficer` VARCHAR(50) NULL,
    `guaranteeCadre` VARCHAR(50) NULL,
    `guaranteeCadreTitle` VARCHAR(50) NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
    `qrCode` VARCHAR(50) NULL,
    `createdBy` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `biz_entities_creditCode_key`(`creditCode`),
    UNIQUE INDEX `biz_entities_qrCode_key`(`qrCode`),
    INDEX `biz_entities_streetId_idx`(`streetId`),
    INDEX `biz_entities_type_idx`(`type`),
    INDEX `biz_entities_riskLevel_idx`(`riskLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_licenses` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `licenseType` ENUM('FOOD_BUSINESS', 'FOOD_PRODUCTION', 'FOOD_CIRCULATION', 'CATERING', 'RECORD') NOT NULL,
    `licenseNo` VARCHAR(50) NULL,
    `licenseContent` VARCHAR(500) NULL,
    `validFrom` DATETIME(3) NULL,
    `validTo` DATETIME(3) NULL,
    `licensePhoto` VARCHAR(500) NULL,
    `businessLicensePhoto` VARCHAR(500) NULL,
    `status` ENUM('VALID', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'VALID',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `biz_licenses_entityId_idx`(`entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_entity_photos` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `category` ENUM('STORE_SCENE', 'BUSINESS_NORM', 'INSPECTION_SCENE', 'ACTIVITY') NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `description` VARCHAR(200) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `biz_entity_photos_entityId_idx`(`entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_qrcodes` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `scanCount` INTEGER NOT NULL DEFAULT 0,
    `imageUrl` VARCHAR(500) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `biz_qrcodes_entityId_key`(`entityId`),
    UNIQUE INDEX `biz_qrcodes_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_inspection_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` ENUM('ROUTINE', 'SPECIAL', 'LICENSE') NOT NULL,
    `description` VARCHAR(500) NULL,
    `applicableTypes` TEXT NULL,
    `legalBasis` VARCHAR(500) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `createdBy` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_inspection_template_items` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(30) NOT NULL,
    `category` VARCHAR(100) NULL,
    `name` VARCHAR(200) NOT NULL,
    `content` VARCHAR(500) NULL,
    `lawReference` VARCHAR(500) NULL,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `biz_inspection_template_items_templateId_idx`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_inspection_plans` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` ENUM('ROUTINE', 'SPECIAL', 'LICENSE') NOT NULL,
    `templateId` VARCHAR(30) NULL,
    `legalBasis` VARCHAR(500) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `description` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `riskFilter` TEXT NULL,
    `createdBy` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_inspection_tasks` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(30) NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `inspectorId` VARCHAR(30) NOT NULL,
    `status` ENUM('ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'ASSIGNED',
    `scheduledDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `notes` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `biz_inspection_tasks_planId_idx`(`planId`),
    INDEX `biz_inspection_tasks_inspectorId_idx`(`inspectorId`),
    INDEX `biz_inspection_tasks_entityId_idx`(`entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_inspection_records` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(30) NOT NULL,
    `planId` VARCHAR(30) NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `inspectorId` VARCHAR(30) NOT NULL,
    `result` ENUM('PASS', 'ISSUE', 'FAIL') NOT NULL,
    `totalScore` INTEGER NOT NULL DEFAULT 100,
    `issueCount` INTEGER NOT NULL DEFAULT 0,
    `summary` VARCHAR(500) NULL,
    `location` VARCHAR(200) NULL,
    `photos` TEXT NULL,
    `inspectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `biz_inspection_records_taskId_key`(`taskId`),
    INDEX `biz_inspection_records_entityId_idx`(`entityId`),
    INDEX `biz_inspection_records_planId_idx`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_inspection_item_results` (
    `id` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(30) NOT NULL,
    `templateItemId` VARCHAR(30) NULL,
    `result` ENUM('PASS', 'FAIL', 'NA') NOT NULL,
    `remark` VARCHAR(500) NULL,
    `photos` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `biz_inspection_item_results_recordId_idx`(`recordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_rectifications` (
    `id` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(30) NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `deadline` DATETIME(3) NULL,
    `level` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
    `status` ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    `submitDescription` VARCHAR(500) NULL,
    `submitPhotos` TEXT NULL,
    `submittedAt` DATETIME(3) NULL,
    `reviewerId` VARCHAR(30) NULL,
    `reviewResult` VARCHAR(20) NULL,
    `reviewRemark` VARCHAR(500) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `biz_rectifications_entityId_idx`(`entityId`),
    INDEX `biz_rectifications_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_screening_plans` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` VARCHAR(30) NOT NULL DEFAULT 'STREET_SWEEP',
    `content` VARCHAR(500) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `assignMode` VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    `screenerIds` TEXT NULL,
    `entityIds` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdBy` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_screening_records` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(30) NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `screenerId` VARCHAR(30) NOT NULL,
    `infoVerified` BOOLEAN NOT NULL DEFAULT false,
    `riskLevel` ENUM('UNRATED', 'LOW', 'LOWER', 'MEDIUM', 'HIGHER', 'HIGH') NULL,
    `issues` TEXT NULL,
    `photos` TEXT NULL,
    `notes` VARCHAR(500) NULL,
    `screenedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `biz_screening_records_planId_idx`(`planId`),
    INDEX `biz_screening_records_screenerId_idx`(`screenerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_complaints` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(30) NULL,
    `category` ENUM('FOOD_SAFETY', 'SERVICE', 'HYGIENE', 'OTHER') NOT NULL,
    `content` VARCHAR(2000) NOT NULL,
    `evidence` TEXT NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    `reporterName` VARCHAR(50) NULL,
    `reporterPhone` VARCHAR(20) NULL,
    `status` ENUM('PENDING', 'FIRST_HANDLING', 'FIRST_FEEDBACK', 'SECOND_HANDLING', 'SECOND_FEEDBACK', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `biz_complaints_entityId_idx`(`entityId`),
    INDEX `biz_complaints_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_complaint_handles` (
    `id` VARCHAR(191) NOT NULL,
    `complaintId` VARCHAR(30) NOT NULL,
    `handlerId` VARCHAR(30) NOT NULL,
    `handleType` VARCHAR(20) NOT NULL,
    `result` VARCHAR(1000) NOT NULL,
    `photos` TEXT NULL,
    `handledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `biz_complaint_handles_complaintId_idx`(`complaintId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_complaint_feedbacks` (
    `id` VARCHAR(191) NOT NULL,
    `complaintId` VARCHAR(30) NOT NULL,
    `handleId` VARCHAR(30) NULL,
    `feedbackType` VARCHAR(20) NOT NULL,
    `satisfaction` ENUM('SATISFIED', 'BASICALLY_SATISFIED', 'DISSATISFIED') NOT NULL,
    `remark` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `biz_complaint_feedbacks_complaintId_idx`(`complaintId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_activities` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` ENUM('VOTE', 'SUGGESTION', 'PROMOTION', 'SURVEY') NOT NULL,
    `description` VARCHAR(1000) NULL,
    `config` TEXT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ACTIVE', 'ENDED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `targetAudience` VARCHAR(20) NOT NULL DEFAULT 'ALL',
    `createdBy` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_activity_participants` (
    `id` VARCHAR(191) NOT NULL,
    `activityId` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NULL,
    `participantName` VARCHAR(50) NULL,
    `participantPhone` VARCHAR(20) NULL,
    `content` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `biz_activity_participants_activityId_idx`(`activityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_info_corrections` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `submittedBy` VARCHAR(30) NOT NULL,
    `field` VARCHAR(100) NOT NULL,
    `oldValue` VARCHAR(500) NULL,
    `newValue` VARCHAR(500) NOT NULL,
    `evidence` TEXT NULL,
    `reason` VARCHAR(500) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `reviewerId` VARCHAR(30) NULL,
    `reviewRemark` VARCHAR(500) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `biz_info_corrections_entityId_idx`(`entityId`),
    INDEX `biz_info_corrections_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_self_inspections` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `operatorId` VARCHAR(30) NOT NULL,
    `type` ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    `items` TEXT NULL,
    `issues` TEXT NULL,
    `result` VARCHAR(20) NOT NULL DEFAULT 'PASS',
    `photos` TEXT NULL,
    `inspectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `biz_self_inspections_entityId_idx`(`entityId`),
    INDEX `biz_self_inspections_operatorId_idx`(`operatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biz_feedback` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(30) NULL,
    `category` ENUM('SUGGESTION', 'BUG', 'FEATURE', 'OTHER') NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `contact` VARCHAR(100) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `reply` VARCHAR(500) NULL,
    `repliedBy` VARCHAR(30) NULL,
    `repliedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` VARCHAR(1000) NULL,
    `type` ENUM('INSPECTION', 'RECTIFICATION', 'COMPLAINT', 'ACTIVITY', 'SYSTEM') NOT NULL,
    `relatedId` VARCHAR(30) NULL,
    `relatedType` VARCHAR(50) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sys_notifications_userId_idx`(`userId`),
    INDEX `sys_notifications_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_users` ADD CONSTRAINT `sys_users_streetId_fkey` FOREIGN KEY (`streetId`) REFERENCES `streets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_users` ADD CONSTRAINT `sys_users_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_entities` ADD CONSTRAINT `biz_entities_streetId_fkey` FOREIGN KEY (`streetId`) REFERENCES `streets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_entities` ADD CONSTRAINT `biz_entities_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `sys_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_licenses` ADD CONSTRAINT `biz_licenses_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_entity_photos` ADD CONSTRAINT `biz_entity_photos_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_qrcodes` ADD CONSTRAINT `biz_qrcodes_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_templates` ADD CONSTRAINT `biz_inspection_templates_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `sys_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_template_items` ADD CONSTRAINT `biz_inspection_template_items_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `biz_inspection_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_plans` ADD CONSTRAINT `biz_inspection_plans_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `biz_inspection_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_plans` ADD CONSTRAINT `biz_inspection_plans_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `sys_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_tasks` ADD CONSTRAINT `biz_inspection_tasks_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `biz_inspection_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_tasks` ADD CONSTRAINT `biz_inspection_tasks_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_tasks` ADD CONSTRAINT `biz_inspection_tasks_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `sys_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_records` ADD CONSTRAINT `biz_inspection_records_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `biz_inspection_tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_records` ADD CONSTRAINT `biz_inspection_records_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_records` ADD CONSTRAINT `biz_inspection_records_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `sys_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_inspection_item_results` ADD CONSTRAINT `biz_inspection_item_results_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `biz_inspection_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_rectifications` ADD CONSTRAINT `biz_rectifications_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `biz_inspection_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_rectifications` ADD CONSTRAINT `biz_rectifications_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_screening_plans` ADD CONSTRAINT `biz_screening_plans_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `sys_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_screening_records` ADD CONSTRAINT `biz_screening_records_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `biz_screening_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_screening_records` ADD CONSTRAINT `biz_screening_records_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_screening_records` ADD CONSTRAINT `biz_screening_records_screenerId_fkey` FOREIGN KEY (`screenerId`) REFERENCES `sys_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_complaints` ADD CONSTRAINT `biz_complaints_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_complaint_handles` ADD CONSTRAINT `biz_complaint_handles_complaintId_fkey` FOREIGN KEY (`complaintId`) REFERENCES `biz_complaints`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_complaint_handles` ADD CONSTRAINT `biz_complaint_handles_handlerId_fkey` FOREIGN KEY (`handlerId`) REFERENCES `sys_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_complaint_feedbacks` ADD CONSTRAINT `biz_complaint_feedbacks_complaintId_fkey` FOREIGN KEY (`complaintId`) REFERENCES `biz_complaints`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_activities` ADD CONSTRAINT `biz_activities_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `sys_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_activity_participants` ADD CONSTRAINT `biz_activity_participants_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `biz_activities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_info_corrections` ADD CONSTRAINT `biz_info_corrections_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_info_corrections` ADD CONSTRAINT `biz_info_corrections_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `sys_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_self_inspections` ADD CONSTRAINT `biz_self_inspections_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `biz_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_self_inspections` ADD CONSTRAINT `biz_self_inspections_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `sys_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biz_feedback` ADD CONSTRAINT `biz_feedback_repliedBy_fkey` FOREIGN KEY (`repliedBy`) REFERENCES `sys_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_notifications` ADD CONSTRAINT `sys_notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
