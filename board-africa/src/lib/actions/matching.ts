'use server';

import { createClient } from '@/lib/supabase/server';
import { AIService } from '@/lib/ai/openai';

export async function matchProfessionalsForPosition(positionId: string) {
    const supabase = await createClient();

    // 1. Get position details
    const { data: position } = await supabase
        .from('board_positions')
        .select('*')
        .eq('id', positionId)
        .single();

    if (!position) throw new Error('Position not found');

    // 2. Generate embedding for position if missing
    let embedding = position.embedding;
    if (!embedding) {
        const textToEmbed = `${position.title} ${position.description} ${position.requirements || ''}`;
        embedding = await AIService.generateEmbedding(textToEmbed);

        if (embedding) {
            await supabase
                .from('board_positions')
                .update({ embedding })
                .eq('id', positionId);
        }
    }

    if (!embedding) throw new Error('Could not generate embedding');

    // 3. Use the RPC function to find matches
    const { data: matches, error } = await supabase.rpc('match_professionals', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5
    });

    if (error) throw error;

    return matches;
}
