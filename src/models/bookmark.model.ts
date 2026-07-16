import { supabaseAdmin } from '../config/supabase';

export class BookmarkModel {
  static async create(workId: string, userId: string) {
    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .insert({ work_id: workId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async remove(workId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('bookmarks')
      .delete()
      .eq('work_id', workId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  static async findByUser(workId: string, userId: string) {
    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .eq('work_id', workId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findAllByUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .select('work_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }
}
