import { Request, Response } from 'express';
import { create } from 'superstruct';
import { UpdateCommentBodyStruct } from '../structs/commentsStruct';
import { IdParamsStruct } from '../structs/commonStructs';
import * as commentsService from '../services/commentsService';
import UnauthorizedError from '../lib/errors/UnauthorizedError';

export async function updateComment(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('로그인이 필요합니다.');
  }

  const { id } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, UpdateCommentBodyStruct);

  const updatedComment = await commentsService.updateComment(id, req.user.id, content as string);
  res.send(updatedComment);
}

export async function deleteComment(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('로그인이 필요합니다.');
  }

  const { id } = create(req.params, IdParamsStruct);
  await commentsService.deleteComment(id, req.user.id);
  res.status(204).send();
}
