import { supabase, supabaseAdmin } from '../config/supabase';

export const WORK_SELECT = `
  *,
  users!works_author_id_fkey(username),
  chapters:chapters(count)
`;

export class WorkModel {
  static async findAll(filters?: Record<string, string>) {
    let query = supabaseAdmin
      .from('works')
      .select(WORK_SELECT);

    if (filters?.author_id) {
      query = query.eq('author_id', filters.author_id);
    } else {
      query = query.neq('status', 'draft');
    }

    if (filters?.genre) query = query.eq('genre', filters.genre);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('works')
      .select(WORK_SELECT)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(workData: any) {
    const { data, error } = await supabaseAdmin
      .from('works')
      .insert([workData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, workData: any) {
    const { data, error } = await supabaseAdmin
      .from('works')
      .update(workData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('works')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  static async incrementViewCount(workId: string, userId: string) {
    const { data: existing } = await supabaseAdmin
      .from('work_views')
      .select('*')
      .eq('user_id', userId)
      .eq('work_id', workId)
      .maybeSingle();

    if (existing) return;

    const { error: insertError } = await supabaseAdmin
      .from('work_views')
      .insert({ user_id: userId, work_id: workId });

    if (insertError) {
      // If unique constraint violation, it means the view was already counted
      if (insertError.message?.includes('duplicate key') || insertError.message?.includes('violates unique constraint')) return;
      throw insertError;
    }

    const { error: rpcError } = await supabaseAdmin
      .rpc('increment_view_count', { row_id: workId });

    if (rpcError) {
      // Fallback: manual count
      const { count, error: countError } = await supabaseAdmin
        .from('work_views')
        .select('*', { count: 'exact', head: true })
        .eq('work_id', workId);
      if (countError) throw countError;
      await supabaseAdmin
        .from('works')
        .update({ view_count: count || 0 })
        .eq('id', workId);
    }
  }
}
