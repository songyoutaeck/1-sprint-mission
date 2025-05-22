import express from 'express';
import { withAsync } from '../lib/withAsync';
import { getNotifications } from '../controllers/notificationsController';
import authenticate from '../middlewares/authenticate';

const router = express.Router();

router.get('/', authenticate(), withAsync(getNotifications));

export default router;