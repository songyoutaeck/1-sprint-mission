// controllers/commentController.ts
import { Request, Response } from 'express';
import { create } from 'superstruct';
import { CreateCommentBodyStruct, UpdateCommentBodyStruct } from '../structs/commentsStruct';
import { IdParamsStruct } from '../structs/commonStructs';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import * as commentService from '../service/commentService';
import { io } from '../main';

export async function updateComment(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  console.log('이게실행중');
  const { id } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, UpdateCommentBodyStruct) as { content: string };

  const updatedComment = await commentService.updateComment(id, req.user.id, content);
  res.send(updatedComment);
}

export async function deleteComment(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const { id } = create(req.params, IdParamsStruct);

  await commentService.deleteComment(id, req.user.id);
  res.status(204).send();
}

export async function createComment(req: Request, res: Response){
  if(!req.user) throw new UnauthorizedError('Unauthorized');

  const { id } = create(req.params,IdParamsStruct);
  const articleId = id;
  const {content} = create(req.body, CreateCommentBodyStruct);

  const comment = await commentService.createComment(
    Number(articleId),
    Number(req.user.id),
    content,
    io
  );
    res.status(201).json(comment);
}