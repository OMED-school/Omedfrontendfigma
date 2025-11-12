import { supabase } from '../lib/supabaseClient';

export function useVote() {
  async function vote(ideaId: string, userId: string, voteType: 'up' | 'down') {
    if (!userId) {
      throw new Error('User must be authenticated to vote');
    }

    try {
      // Check if user already voted
      const { data: existingVote, error: fetchError } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId)
        .eq('idea_id', ideaId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote (user clicked same vote button)
          const { error: deleteError } = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);

          if (deleteError) throw deleteError;
        } else {
          // Change vote
          const { error: updateError } = await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);

          if (updateError) throw updateError;
        }
      } else {
        // Add new vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert({ user_id: userId, idea_id: ideaId, vote_type: voteType });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  }

  return { vote };
}
