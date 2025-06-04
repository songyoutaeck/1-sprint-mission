import { PrismaClient } from '@prisma/client';

export async function clearDatabase(prismaClient: PrismaClient) {
  await prismaClient.notification.deleteMany();
  await prismaClient.favorite.deleteMany();
  await prismaClient.like.deleteMany();
  await prismaClient.comment.deleteMany();
  await prismaClient.article.deleteMany();
  await prismaClient.product.deleteMany();
  await prismaClient.user.deleteMany();
}
