// services/commentService.ts
import { prismaClient } from '../lib/prismaClient';
import NotFoundError from '../lib/errors/NotFoundError';
import ForbiddenError from '../lib/errors/ForbiddenError';
import { Server } from 'socket.io';

export async function updateComment(commentId: number, userId: number, content: string) {
  console.log("실행중");
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

export async function createComment(articleId : number, userId :number,content : string,io : Server){
  console.log('🟢 댓글 생성 진입:', { articleId, userId, content });
  const comment = await prismaClient.comment.create({
    data : {
      content,
      articleId,
      userId,
    },
  });
  
  const article = await prismaClient.article.findUnique({
    where : {id : articleId},
    select : {userId : true},
  });

  if(!article) throw new NotFoundError('article',articleId);
  
  const targetUserId = article.userId;
  console.log('🎯 댓글 단 사람:', userId, '| 게시글 작성자:', targetUserId);

  if(targetUserId !== userId){
    await prismaClient.notification.create({
      data : {
        userId : targetUserId,
        type: 'comment',
        content : "당신의 게시글에 댓글이 달렸습ㄴ디ㅏ!",
        link: `/articles/${articleId}`
      },
     });
    io.to(targetUserId.toString()).emit('notification', {
          type: 'comment',
          content: '당신의 게시글에 댓글이 달렸습니다!',
          link: `/articles/${articleId}`,
        });
      } else {
        console.log('❌ 자기 자신의 게시글에 댓글을 달아서 알림 없음');
      }

      return comment;
}