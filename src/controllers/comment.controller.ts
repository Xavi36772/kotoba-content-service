import { Request, Response } from 'express';
import { CommentModel } from '../models/comment.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await CommentModel.findByWorkId(req.params.workId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Error fetching comments' });
  }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }
    const comment = await CommentModel.create({
      work_id: req.params.workId,
      user_id: req.user.id,
      content: content.trim(),
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Error creating comment' });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    await CommentModel.delete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Error deleting comment' });
  }
};
