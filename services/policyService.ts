import { Policy } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

export const getPolicies = async (): Promise<Policy[]> => {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((policy: any) => ({
      id: policy.id,
      title: policy.title,
      category: policy.category,
      content: policy.content,
    }));
  } catch (error) {
    console.error('Failed to fetch policies from database', error);
    return [];
  }
};

export const addPolicy = async (newPolicyData: Omit<Policy, 'id'>): Promise<Policy[]> => {
  try {
    const { error } = await supabase
      .from('policies')
      .insert({
        title: newPolicyData.title,
        category: newPolicyData.category,
        content: newPolicyData.content,
      });

    if (error) throw error;

    return await getPolicies();
  } catch (error) {
    console.error('Failed to add policy', error);
    return await getPolicies();
  }
};

export const updatePolicy = async (updatedPolicy: Policy): Promise<Policy[]> => {
  try {
    const { error } = await supabase
      .from('policies')
      .update({
        title: updatedPolicy.title,
        category: updatedPolicy.category,
        content: updatedPolicy.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedPolicy.id);

    if (error) throw error;

    return await getPolicies();
  } catch (error) {
    console.error('Failed to update policy', error);
    return await getPolicies();
  }
};

export const deletePolicy = async (id: string | number): Promise<Policy[]> => {
  try {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await getPolicies();
  } catch (error) {
    console.error('Failed to delete policy', error);
    return await getPolicies();
  }
};
