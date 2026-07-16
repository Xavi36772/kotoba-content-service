import { Request, Response } from 'express';
import { ChapterModel } from '../models/chapter.model';

const allowedFields = [
  'work_id', 'title', 'content', 'order_number', 'status',
  'word_count', 'updated_at'
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

export const getChapters = async (req: Request, res: Response): Promise<void> => {
  try {
    const chapters = await ChapterModel.findByWorkId(req.params.workId);
    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Error fetching chapters' });
  }
};

export const getChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const chapter = await ChapterModel.findById(req.params.id);
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    res.json(chapter);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Error fetching chapter' });
  }
};

export const createChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const chapterData = sanitize(req.body);
    const chapter = await ChapterModel.create(chapterData);
    res.status(201).json(chapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Error creating chapter' });
  }
};

export const updateChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const chapterData = sanitize(req.body);
    chapterData.updated_at = new Date().toISOString();
    const chapter = await ChapterModel.update(req.params.id, chapterData);
    res.json(chapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: 'Error updating chapter' });
  }
};

export const deleteChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    await ChapterModel.delete(req.params.id);
    res.json({ message: 'Chapter deleted' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ error: 'Error deleting chapter' });
  }
};
