import { supabaseAdmin } from '../config/supabase';

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'https://search-service-production-dac3.up.railway.app';

export async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${SEARCH_SERVICE_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) return null;
    const data: any = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error getting embedding from search-service:', error);
    return null;
  }
}

export async function storeEmbedding(workId: string, title: string, description?: string): Promise<void> {
  try {
    const text = `${title} ${description || ''}`.trim();
    if (!text) return;

    const embedding = await getEmbedding(text);
    if (!embedding) return;

    await supabaseAdmin
      .from('work_embeddings')
      .upsert({ work_id: workId, embedding }, { onConflict: 'work_id' });
  } catch (error) {
    console.error(`Error storing embedding for work ${workId}:`, error);
  }
}
