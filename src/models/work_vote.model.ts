import { supabaseAdmin } from '../config/supabase';

export class WorkVoteModel {
  static async upsert(workId: string, userId: string, vote: number) {
    const { data, error } = await supabaseAdmin
      .from('work_votes')
      .upsert({ work_id: workId, user_id: userId, vote }, { onConflict: 'user_id,work_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async remove(workId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('work_votes')
      .delete()
      .eq('work_id', workId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  static async findByUser(workId: string, userId: string) {
    const { data, error } = await supabaseAdmin
      .from('work_votes')
      .select('vote')
      .eq('work_id', workId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getWorkStats(workId: string) {
    const { data, error } = await supabaseAdmin
      .from('work_votes')
      .select('vote')
      .eq('work_id', workId);

    if (error) throw error;

    const ratings = (data || []).filter((r: any) => r.vote !== 0);
    const totalVotes = ratings.length;
    const sumRatings = ratings.reduce((acc: number, r: any) => acc + r.vote, 0);
    const avgRating = totalVotes > 0 ? sumRatings / totalVotes : 0;

    return { avgRating, totalVotes };
  }
}
