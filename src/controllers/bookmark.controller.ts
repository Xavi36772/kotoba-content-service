import { Response } from 'express';
import { BookmarkModel } from '../models/bookmark.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const createBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workId } = req.params;
    const userId = req.user.id;

    const bookmark = await BookmarkModel.create(workId, userId);
    res.status(201).json(bookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Error creating bookmark' });
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workId } = req.params;
    const userId = req.user.id;

    await BookmarkModel.remove(workId, userId);
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Error removing bookmark' });
  }
};

export const getBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workId } = req.params;
    const userId = req.user.id;

    const bookmark = await BookmarkModel.findByUser(workId, userId);
    res.json({ bookmarked: !!bookmark, bookmark });
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    res.status(500).json({ error: 'Error fetching bookmark' });
  }
};

export const getUserBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const bookmarks = await BookmarkModel.findAllByUser(userId);
    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    res.status(500).json({ error: 'Error fetching user bookmarks' });
  }
};
