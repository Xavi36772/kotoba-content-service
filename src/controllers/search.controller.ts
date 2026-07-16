import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { getEmbedding } from '../services/embedding.service';

export const searchWorks = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      res.json([]);
      return;
    }

    const embedding = await getEmbedding(query);

    if (embedding) {
      const { data: semanticResults, error } = await supabaseAdmin.rpc('search_works', {
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: 20,
      });

      if (!error && semanticResults && semanticResults.length > 0) {
        // Enrich results with author info
        const workIds = semanticResults.map((r: any) => r.id);
        const { data: works } = await supabaseAdmin
          .from('works')
          .select('*, users!works_author_id_fkey(username)')
          .in('id', workIds);

        const workMap = new Map((works || []).map((w: any) => [w.id, w]));
        const enriched = semanticResults.map((r: any) => ({
          ...r,
          username: workMap.get(r.id)?.users?.username || null,
        }));

        res.json(enriched);
        return;
      }
    }

    // Fallback: textual search with SQL injection protection
    const safeQuery = query.replace(/[\\%_]/g, '\\$&');
    const { data: textResults, error: textError } = await supabaseAdmin
      .from('works')
      .select('*, users!works_author_id_fkey(username)')
      .or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(20);

    if (textError) throw textError;
    res.json(textResults || []);
  } catch (error) {
    console.error('Error searching works:', error);
    res.status(500).json({ error: 'Error searching works' });
  }
};
