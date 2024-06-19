/*
  Warnings:

  - You are about to drop the column `item_id` on the `product_categories` table. All the data in the column will be lost.
  - You are about to drop the column `item_id` on the `recipe_items` table. All the data in the column will be lost.
  - You are about to drop the column `recipe_id` on the `recipe_items` table. All the data in the column will be lost.
  - You are about to drop the column `recording_date` on the `store_product_prices` table. All the data in the column will be lost.
  - You are about to drop the column `store_product_id` on the `store_product_prices` table. All the data in the column will be lost.
  - You are about to drop the column `item_id` on the `store_products` table. All the data in the column will be lost.
  - You are about to drop the column `item_quantity` on the `store_products` table. All the data in the column will be lost.
  - You are about to drop the column `product_category_id` on the `store_products` table. All the data in the column will be lost.
  - You are about to drop the column `store_id` on the `store_products` table. All the data in the column will be lost.
  - Added the required column `itemId` to the `product_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `recipe_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipeId` to the `recipe_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordingDate` to the `store_product_prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeProductId` to the `store_product_prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `store_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemQuantity` to the `store_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productCategoryId` to the `store_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `store_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_item_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_items" DROP CONSTRAINT "recipe_items_item_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_items" DROP CONSTRAINT "recipe_items_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "store_product_prices" DROP CONSTRAINT "store_product_prices_store_product_id_fkey";

-- DropForeignKey
ALTER TABLE "store_products" DROP CONSTRAINT "store_products_item_id_fkey";

-- DropForeignKey
ALTER TABLE "store_products" DROP CONSTRAINT "store_products_product_category_id_fkey";

-- DropForeignKey
ALTER TABLE "store_products" DROP CONSTRAINT "store_products_store_id_fkey";

-- AlterTable
ALTER TABLE "product_categories" DROP COLUMN "item_id",
ADD COLUMN     "itemId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "recipe_items" DROP COLUMN "item_id",
DROP COLUMN "recipe_id",
ADD COLUMN     "itemId" INTEGER NOT NULL,
ADD COLUMN     "recipeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "store_product_prices" DROP COLUMN "recording_date",
DROP COLUMN "store_product_id",
ADD COLUMN     "recordingDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "storeProductId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "store_products" DROP COLUMN "item_id",
DROP COLUMN "item_quantity",
DROP COLUMN "product_category_id",
DROP COLUMN "store_id",
ADD COLUMN     "itemId" INTEGER NOT NULL,
ADD COLUMN     "itemQuantity" INTEGER NOT NULL,
ADD COLUMN     "productCategoryId" INTEGER NOT NULL,
ADD COLUMN     "storeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_product_prices" ADD CONSTRAINT "store_product_prices_storeProductId_fkey" FOREIGN KEY ("storeProductId") REFERENCES "store_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
