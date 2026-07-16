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
    // Use the RPC function
    const { error } = await supabaseAdmin.rpc('increment_view_count', { row_id: workId });

    if (error) {
      // If the RPC doesn't exist, use the manual approach
      // Insert into work_views to track unique views
      const { error: insertError } = await supabaseAdmin
        .from('work_views')
        .upsert({ work_id: workId, user_id: userId }, { onConflict: 'user_id,work_id' });

      if (insertError && !insertError.message?.includes('violates unique constraint')) {
        // Count unique views
        const { data } = await supabaseAdmin
          .from('work_views')
          .select('*', { count: 'exact', head: true })
          .eq('work_id', workId);

        // Update the view_count on the works table
        const count = data?.length ?? 0;
        await supabaseAdmin
          .from('works')
          .update({ view_count: count + 1 })
          .eq('id', workId);
      }
    }
  }
}
