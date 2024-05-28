import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 10);

  const user1 = await prisma.user.create({
    data: {
      username: 'アリス',
      email: 'test@test.com',
      password: password,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      username: 'ボブ',
      email: 'bob@example.com',
      password: password,
    },
  })

  // ストアの作成
  await prisma.store.createMany({
    data: [
      { name: 'Store A', url: 'http://store-a.com' },
      { name: 'Store B', url: 'http://store-b.com' },
    ],
  });

  // 食材の作成
  await prisma.item.createMany({
    data: [
      { name: 'Item A', label: 'Label A', description: 'Description A' },
      { name: 'Item B', label: 'Label B', description: 'Description B' },
    ],
  });

  // 商品区分の作成
  await prisma.productCategory.createMany({
    data: [
      { item_id: 1, brand: 'Brand A', unit: 'kg' },
      { item_id: 2, brand: 'Brand B', unit: 'liters' },
    ],
  });

  // 商品の作成
  await prisma.storeProduct.createMany({
    data: [
      { store_id: 1, product_category_id: 1, item_id: 1, item_quantity: 10, name: 'Product A', url: 'http://product-a.com', image: 'http://image-a.com' },
      { store_id: 2, product_category_id: 2, item_id: 2, item_quantity: 5, name: 'Product B', url: 'http://product-b.com', image: 'http://image-b.com' },
    ],
  });

  // 商品の価格作成
  await prisma.storeProductPrice.createMany({
    data: [
      { store_product_id: 1, price: 100.0, recording_date: new Date() },
      { store_product_id: 2, price: 200.0, recording_date: new Date() },
    ],
  });

  // レシピの作成
  await prisma.recipe.createMany({
    data: [
      { title: 'Recipe A', description: 'Description A', steps: 'Step A' },
      { title: 'Recipe B', description: 'Description B', steps: 'Step B' },
    ],
  });

  // レシピの食材作成
  await prisma.recipeItem.createMany({
    data: [
      { item_id: 1, quantity: 2, recipe_id: 1 },
      { item_id: 2, quantity: 200, recipe_id: 2 },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });