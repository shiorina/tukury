import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=========== User ===========');
  const password = await bcrypt.hash('password', 10);

  const user1 = await prisma.user.create({
    data: {
      username: 'アリス',
      email: 'test@test.com',
      password: password,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'ボブ',
      email: 'bob@example.com',
      password: password,
    },
  });

  console.log('=========== Store ===========');

  // ストアの作成
  await prisma.store.createMany({
    data: [
      { name: 'Store A', url: 'http://store-a.com' },
      { name: 'Store B', url: 'http://store-b.com' },
    ],
  });

  console.log('=========== ProductCategory ===========');

  const productCategories = [
    { itemName: '米', brand: '新潟県産こしひかり(無洗米)', unit: '5kg' },
    { itemName: '食パン', brand: '天然酵母', unit: '1.5斤' },
    { itemName: '食パン', brand: 'パスコ 超熟 6枚', unit: '1斤' },
    { itemName: '卵', brand: '白卵', unit: '10個入り' },
    { itemName: 'にんじん', brand: 'なし', unit: '2〜3本入1袋' },
    { itemName: 'にんじん', brand: '有機にんじん', unit: '2〜3本入1袋' },
    { itemName: 'きゅうり', brand: 'なし', unit: '1本' },
    { itemName: 'きゅうり', brand: 'なし', unit: '3〜4本入1袋' },
    { itemName: 'キャベツ', brand: 'なし', unit: '1玉' },
    { itemName: 'キャベツ', brand: 'なし', unit: '1/2' },
    { itemName: 'じゃがいも', brand: 'なし', unit: '3〜5玉入1袋' },
    { itemName: 'じゃがいも', brand: '男爵', unit: '' },
    { itemName: 'じゃがいも', brand: 'キタアカリ', unit: '' },
    { itemName: 'じゃがいも', brand: 'メークイン', unit: '' },
    { itemName: 'にんにく', brand: '青森県産', unit: '1個' },
    { itemName: 'にんにく', brand: '中国産', unit: '3個1袋' },
    { itemName: '長ネギ', brand: 'なし', unit: 'バラ1本' },
    { itemName: '長ネギ', brand: 'なし', unit: '2〜3本入1束' },
    { itemName: '玉ねぎ', brand: 'なし', unit: 'バラL1個' },
    { itemName: '玉ねぎ', brand: 'なし', unit: '3〜4玉入1袋' },
    { itemName: '玉ねぎ', brand: '有機新玉ねぎ', unit: '2〜6玉入1袋' },
    { itemName: '玉ねぎ', brand: '新玉ねぎ', unit: '2〜3玉入1袋' },
    { itemName: '豚肉こま', brand: '米国産', unit: '100g当たり' },
    { itemName: '豚肉こま', brand: '国内産', unit: '100g当たり' },
    { itemName: '若どりもも肉', brand: '国内産', unit: '100g当たり' },
    { itemName: '若どりもも肉', brand: '国内産', unit: '2枚 540グラム' },
    { itemName: '若どりもも肉', brand: 'ブラジル産', unit: '2kg' },
  ];

  for (const category of productCategories) {
    let item = await prisma.item.findUnique({
      where: { name: category.itemName },
    });

    if (!item) {
      item = await prisma.item.create({
        data: {
          name: category.itemName,
          label: category.itemName,
          description: '',
        },
      });
    }

    await prisma.productCategory.create({
      data: {
        item_id: item.id,
        brand: category.brand,
        unit: category.unit,
      },
    });
  }

  console.log('=========== StoreProduct ===========');

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
