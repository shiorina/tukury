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

  const recipe1 = await prisma.recipe.create({
    data: {
      title: 'トマトパスタ',
      description: 'シンプルでおいしいトマトパスタの作り方。',
      steps: 'パスタを茹でる。トマトを煮る。混ぜ合わせる。',
      user: {
        connect: { id: user1.id },
      },
      ingredients: {
        create: [
          {
            ingredient: {
              create: { name: 'トマト', description: '新鮮な赤トマト' },
            },
            quantity: '2カップ'
          },
          {
            ingredient: {
              create: { name: 'パスタ', description: '任意の形状の乾燥パスタ' },
            },
            quantity: '200g'
          },
        ],
      },
    },
  })

  // 他のレシピや材料も同様に追加...
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
