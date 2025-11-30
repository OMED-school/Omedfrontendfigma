import { supabase } from '../lib/supabaseClient';
import type { IdeaStatus, PrincipalStatus, Priority } from '../lib/types';

export function useIdeaActions() {
  async function createIdea(data: {
    title: string;
    description: string;
    category: string;
    authorId: string;
  }) {
    const { data: idea, error } = await supabase
      .from('ideas')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        author_id: data.authorId,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw error;
    return idea;
  }

  async function updateIdeaStatus(
    ideaId: string,
    status: IdeaStatus,
    notes?: string,
    reviewedBy?: string
  ) {
    const updateData: any = { status };
    
    if (notes !== undefined) {
      updateData.teacher_notes = notes;
    }
    
    if (reviewedBy !== undefined) {
      updateData.reviewed_by = reviewedBy;
    }
    
    if (status === 'forwarded') {
      updateData.forwarded_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', ideaId);

    if (error) throw error;
  }

  async function updatePrincipalStatus(
    ideaId: string,
    principalStatus: PrincipalStatus,
    notes?: string,
    budget?: number,
    priority?: Priority,
    implementationDate?: string
  ) {
    const updateData: any = { principal_status: principalStatus };
    
    if (notes !== undefined) {
      updateData.principal_notes = notes;
    }
    
    if (budget !== undefined) {
      updateData.budget = budget;
    }
    
    if (priority !== undefined) {
      updateData.priority = priority;
    }
    
    if (implementationDate !== undefined) {
      updateData.implementation_date = implementationDate;
    }

    const { error } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', ideaId);

    if (error) throw error;
  }

  return {
    createIdea,
    updateIdeaStatus,
    updatePrincipalStatus,
  };
}
