import { Request, Response } from 'express';
import { WorkVoteModel } from '../models/work_vote.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const upsertVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workId } = req.params;
    const vote = req.body.vote;
    const userId = req.user.id;

    const result = await WorkVoteModel.upsert(workId, userId, vote);
    const stats = await WorkVoteModel.getWorkStats(workId);

    res.json({ vote: result, stats });
  } catch (error) {
    console.error('Error upserting vote:', error);
    res.status(500).json({ error: 'Error processing vote' });
  }
};

export const removeVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workId } = req.params;
    const userId = req.user.id;

    await WorkVoteModel.remove(workId, userId);
    const stats = await WorkVoteModel.getWorkStats(workId);

    res.json({ stats });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({ error: 'Error removing vote' });
  }
};

export const getVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workId } = req.params;
    const userId = req.user.id;

    const vote = await WorkVoteModel.findByUser(workId, userId);
    const stats = await WorkVoteModel.getWorkStats(workId);

    res.json({ vote: vote?.vote ?? 0, stats });
  } catch (error) {
    console.error('Error fetching vote:', error);
    res.status(500).json({ error: 'Error fetching vote' });
  }
};

export const getVoteStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workId } = req.params;
    const stats = await WorkVoteModel.getWorkStats(workId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching vote stats:', error);
    res.status(500).json({ error: 'Error fetching vote stats' });
  }
};
