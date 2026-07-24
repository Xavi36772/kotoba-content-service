import { Request, Response } from 'express';
import { WorkModel } from '../models/work.model';
import { storeEmbedding } from '../services/embedding.service';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationModel } from '../models/notification.model';

const allowedFields = [
  'title', 'description', 'genre', 'cover_url', 'status',
  'tags', 'language', 'author_id', 'type', 'target_audience',
  'updated_at'
];

function sanitize(body: any): any {
  const sanitized: any = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      sanitized[field] = body[field];
    }
  }
  return sanitized;
}

async function notifyFollowersOnPublish(authorId: string, workId: string, workTitle: string, isNew: boolean) {
  try {
    const followerIds = await NotificationModel.getFollowers(authorId);
    if (followerIds.length === 0) return;

    const items = followerIds
      .filter((id: string) => id !== authorId)
      .map((followerId: string) => ({
        type: 'new_story',
        title: isNew ? 'Nueva historia publicada' : 'Historia actualizada',
        body: isNew
          ? `@${authorId} publicó "${workTitle}"`
          : `@${authorId} actualizó "${workTitle}"`,
        data: { workId, authorId, isNew },
      }));

    if (items.length > 0) {
      // Insert in batches (Supabase handles bulk insert fine for <1000 rows)
      await supabaseAdmin.from('notifications').insert(
        followerIds
          .filter((id: string) => id !== authorId)
          .map((followerId: string, i: number) => ({
            user_id: followerId,
            type: items[i].type,
            title: items[i].title,
            body: items[i].body,
            data: items[i].data,
          }))
      );
    }
  } catch (err) {
    console.error('notifyFollowersOnPublish error:', err);
  }
}

export const getWorks = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: Record<string, string> = {};
    if (req.query.author_id) filters.author_id = req.query.author_id as string;
    if (req.query.genre) filters.genre = req.query.genre as string;

    const works = await WorkModel.findAll(filters);
    res.json(works);
  } catch (error) {
    console.error('Error fetching works:', error);
    res.status(500).json({ error: 'Error fetching works' });
  }
};

export const getWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const work = await WorkModel.findById(req.params.id);
    if (!work) {
      res.status(404).json({ error: 'Work not found' });
      return;
    }
    res.json(work);
  } catch (error) {
    console.error('Error fetching work:', error);
    res.status(500).json({ error: 'Error fetching work' });
  }
};

export const createWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const workData = sanitize(req.body);
    const work = await WorkModel.create(workData);

    storeEmbedding(work.id, work.title, work.description).catch(err =>
      console.error('Error storing embedding:', err)
    );

    if (work.status && work.status !== 'draft' && work.author_id) {
      notifyFollowersOnPublish(work.author_id, work.id, work.title, true).catch(() => {});
    }

    res.status(201).json(work);
  } catch (error) {
    console.error('Error creating work:', error);
    res.status(500).json({ error: 'Error creating work' });
  }
};

export const updateWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const workData = sanitize(req.body);
    workData.updated_at = new Date().toISOString();

    const work = await WorkModel.update(req.params.id, workData);

    if (work.title || work.description) {
      storeEmbedding(work.id, work.title, work.description).catch(err =>
        console.error('Error updating embedding:', err)
      );
    }

    if (workData.status && workData.status !== 'draft' && work.author_id) {
      notifyFollowersOnPublish(work.author_id, work.id, work.title, false).catch(() => {});
    }

    res.json(work);
  } catch (error) {
    console.error('Error updating work:', error);
    res.status(500).json({ error: 'Error updating work' });
  }
};

export const deleteWork = async (req: Request, res: Response): Promise<void> => {
  try {
    await WorkModel.delete(req.params.id);
    res.json({ message: 'Work deleted' });
  } catch (error) {
    console.error('Error deleting work:', error);
    res.status(500).json({ error: 'Error deleting work' });
  }
};

export const incrementView = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workId } = req.params;
    const userId = req.user.id;
    await WorkModel.incrementViewCount(workId, userId);
    res.json({ message: 'View counted' });
  } catch (error) {
    console.error('Error incrementing view:', error);
    res.status(500).json({ error: 'Error incrementing view' });
  }
};

export const reindexWorks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data: works, error } = await supabaseAdmin
      .from('works')
      .select('id, title, description');

    if (error) throw error;

    let reindexed = 0;
    for (const work of works || []) {
      try {
        await storeEmbedding(work.id, work.title, work.description);
        reindexed++;
      } catch (err) {
        console.error(`Error reindexing work ${work.id}:`, err);
      }
    }

    res.json({ reindexed, total: works?.length || 0 });
  } catch (error) {
    console.error('Error reindexing works:', error);
    res.status(500).json({ error: 'Error reindexing works' });
  }
};
