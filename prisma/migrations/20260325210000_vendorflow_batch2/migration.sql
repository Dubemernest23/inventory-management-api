-- AlterTable
ALTER TABLE `products` ADD COLUMN `reorderPoint` INTEGER NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `tags` JSON NULL;

-- AlterTable
ALTER TABLE `stock_movements` ADD COLUMN `cogs` DECIMAL(10, 2) NULL,
    ADD COLUMN `reason` VARCHAR(191) NULL,
    ADD COLUMN `unitCost` DECIMAL(10, 2) NULL,
    ADD COLUMN `variantId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `attributes` JSON NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') NOT NULL DEFAULT 'ACTIVE',
    `price` DECIMAL(10, 2) NULL,
    `costPrice` DECIMAL(10, 2) NULL,
    `minStock` INTEGER NOT NULL DEFAULT 0,
    `reorderPoint` INTEGER NULL,
    `stockQty` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `product_variants_businessId_productId_idx`(`businessId`, `productId`),
    UNIQUE INDEX `product_variants_businessId_sku_key`(`businessId`, `sku`),
    UNIQUE INDEX `product_variants_businessId_barcode_key`(`businessId`, `barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_images_productId_sortOrder_idx`(`productId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_layers` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `qtyRemaining` INTEGER NOT NULL,
    `costPrice` DECIMAL(10, 2) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sourceType` VARCHAR(191) NULL,
    `sourceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `inventory_layers_businessId_productId_warehouseId_receivedAt_idx`(`businessId`, `productId`, `warehouseId`, `receivedAt`),
    INDEX `inventory_layers_businessId_variantId_warehouseId_receivedAt_idx`(`businessId`, `variantId`, `warehouseId`, `receivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `stock_movements_businessId_variantId_idx` ON `stock_movements`(`businessId`, `variantId`);

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_layers` ADD CONSTRAINT `inventory_layers_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_layers` ADD CONSTRAINT `inventory_layers_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_layers` ADD CONSTRAINT `inventory_layers_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_layers` ADD CONSTRAINT `inventory_layers_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

