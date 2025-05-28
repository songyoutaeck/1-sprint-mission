import express from 'express';
import { withAsync } from '../lib/withAsync';
import { updateComment, deleteComment, createComment } from '../controllers/commentsController';
import authenticate from '../middlewares/authenticate';

const commentsRouter = express.Router();

commentsRouter.post('/articles/:id/comments', authenticate(), withAsync(createComment));
commentsRouter.patch('/:id', authenticate(), withAsync(updateComment));
commentsRouter.delete('/:id', authenticate(), withAsync(deleteComment));

export default commentsRouter;
