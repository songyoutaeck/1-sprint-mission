// services/commentService.ts
import { prismaClient } from '../lib/prismaClient';
import NotFoundError from '../lib/errors/NotFoundError';
import ForbiddenError from '../lib/errors/ForbiddenError';

export async function updateComment(commentId: number, userId: number, content: string) {
  const comment = await prismaClient.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError('comment', commentId);
  if (comment.userId !== userId) throw new ForbiddenError('Should be the owner of the comment');

  return await prismaClient.comment.update({
    where: { id: commentId },
    data: { content },
  });
}

export async function deleteComment(commentId: number, userId: number) {
  const comment = await prismaClient.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError('comment', commentId);
  if (comment.userId !== userId) throw new ForbiddenError('Should be the owner of the comment');

  return await prismaClient.comment.delete({ where: { id: commentId } });
}
