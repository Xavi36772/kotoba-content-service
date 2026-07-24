import { supabaseAdmin } from '../config/supabase';

export class NotificationModel {
  static async create(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    const { data: notif, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data || null,
      })
      .select()
      .single();

    if (error) throw error;
    return notif;
  }

  static async createBulk(userId: string, items: Array<{
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }>) {
    if (items.length === 0) return [];
    const rows = items.map((item) => ({
      user_id: userId,
      type: item.type,
      title: item.title,
      body: item.body,
      data: item.data || null,
    }));

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(rows)
      .select();

    if (error) throw error;
    return data;
  }

  static async getForUser(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  static async getUnreadCount(userId: string) {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }

  static async markAsRead(notificationId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  static async markAllAsRead(userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return true;
  }

  static async delete(notificationId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  static async getFollowers(authorId: string) {
    const { data, error } = await supabaseAdmin
      .from('followers')
      .select('follower_id')
      .eq('following_id', authorId);

    if (error) throw error;
    return (data || []).map((r: any) => r.follower_id);
  }
}
