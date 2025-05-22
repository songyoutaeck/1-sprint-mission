import express from 'express';
import { withAsync } from '../lib/withAsync';
import { getNotifications } from '../controllers/notificationsController';
import authenticate from '../middlewares/authenticate';
import { getUnreadNotificationCount } from '../controllers/notificationsController';
import { readNotification } from '../controllers/notificationsController';


const router = express.Router();

router.get('/', authenticate(), withAsync(getNotifications));
router.get('/unread-count', authenticate(), withAsync(getUnreadNotificationCount));
router.patch('/:id/read', authenticate(), withAsync(readNotification));


export default router;