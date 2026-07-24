import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationModel } from '../models/notification.model';

// GET /notifications — list notifications for current user
export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await NotificationModel.getForUser(userId, limit, offset);
    const unreadCount = await NotificationModel.getUnreadCount(userId);

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    console.error('getNotifications error:', err.message);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
}

// GET /notifications/unread-count
export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const count = await NotificationModel.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (err: any) {
    console.error('getUnreadCount error:', err.message);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
}

// PUT /notifications/:id/read
export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await NotificationModel.markAsRead(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error('markAsRead error:', err.message);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
}

// PUT /notifications/read-all
export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await NotificationModel.markAllAsRead(req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error('markAllAsRead error:', err.message);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
}

// DELETE /notifications/:id
export async function deleteNotification(req: AuthRequest, res: Response): Promise<void> {
  try {
    await NotificationModel.delete(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error('deleteNotification error:', err.message);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
}
