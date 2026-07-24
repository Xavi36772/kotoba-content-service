import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  getWorks, getWork, createWork, updateWork, deleteWork,
  incrementView, reindexWorks
} from '../controllers/work.controller';
import {
  getChapters, getChapter, createChapter, updateChapter, deleteChapter
} from '../controllers/chapter.controller';
import {
  getComments, createComment, deleteComment
} from '../controllers/comment.controller';
import {
  upsertVote, removeVote, getVote, getVoteStats
} from '../controllers/vote.controller';
import {
  createBookmark, removeBookmark, getBookmark, getUserBookmarks
} from '../controllers/bookmark.controller';
import { searchWorks } from '../controllers/search.controller';
import {
  getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification
} from '../controllers/notification.controller';

const router = Router();

// Search
router.get('/search', searchWorks);

// Works
router.get('/works', getWorks);
router.post('/works/reindex', reindexWorks);
router.get('/works/:id', getWork);
router.post('/works', createWork);
router.put('/works/:id', updateWork);
router.delete('/works/:id', deleteWork);
router.post('/works/:workId/view', verifyToken, incrementView);

// Chapters
router.get('/works/:workId/chapters', getChapters);
router.get('/chapters/:id', getChapter);
router.post('/chapters', verifyToken, createChapter);
router.put('/chapters/:id', verifyToken, updateChapter);
router.delete('/chapters/:id', verifyToken, deleteChapter);

// Comments
router.get('/works/:workId/comments', getComments);
router.post('/works/:workId/comments', verifyToken, createComment);
router.delete('/comments/:id', deleteComment);

// Votes
router.post('/works/:workId/vote', verifyToken, upsertVote);
router.delete('/works/:workId/vote', verifyToken, removeVote);
router.get('/works/:workId/vote', verifyToken, getVote);
router.get('/works/:workId/vote/stats', getVoteStats);

// Bookmarks
router.post('/bookmarks/:workId', verifyToken, createBookmark);
router.delete('/bookmarks/:workId', verifyToken, removeBookmark);
router.get('/bookmarks/:workId', verifyToken, getBookmark);
router.get('/bookmarks/mine', verifyToken, getUserBookmarks);

// Notifications
router.get('/notifications', verifyToken, getNotifications);
router.get('/notifications/unread-count', verifyToken, getUnreadCount);
router.put('/notifications/read-all', verifyToken, markAllAsRead);
router.put('/notifications/:id/read', verifyToken, markAsRead);
router.delete('/notifications/:id', verifyToken, deleteNotification);

export default router;
