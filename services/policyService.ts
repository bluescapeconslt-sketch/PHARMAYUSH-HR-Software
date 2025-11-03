import { Policy } from '../types.ts';
import { supabase } from './supabaseClient.ts';

interface PolicyData {
  id: string;
  title: string;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const transformToPolicy = (data: PolicyData, index: number): Policy => {
  return {
    id: index + 1,
    title: data.title,
    category: data.category,
    content: data.content
  };
};

export const getPolicies = async (): Promise<Policy[]> => {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching policies:', error);
      return [];
    }

    return (data || []).map((policy, index) => transformToPolicy(policy, index));
  } catch (error) {
    console.error('Failed to fetch policies:', error);
    return [];
  }
};

export const addPolicy = async (newPolicyData: Omit<Policy, 'id'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('policies')
      .insert([{
        title: newPolicyData.title,
        category: newPolicyData.category,
        content: newPolicyData.content
      }]);

    if (error) {
      console.error('Error adding policy:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to add policy:', error);
    return false;
  }
};

export const updatePolicy = async (updatedPolicy: Policy): Promise<boolean> => {
  try {
    const { data: policies } = await supabase
      .from('policies')
      .select('id')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (!policies || policies.length === 0) return false;

    const targetId = policies[updatedPolicy.id - 1]?.id;
    if (!targetId) return false;

    const { error } = await supabase
      .from('policies')
      .update({
        title: updatedPolicy.title,
        category: updatedPolicy.category,
        content: updatedPolicy.content
      })
      .eq('id', targetId);

    if (error) {
      console.error('Error updating policy:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update policy:', error);
    return false;
  }
};

export const deletePolicy = async (id: number): Promise<boolean> => {
  try {
    const { data: policies } = await supabase
      .from('policies')
      .select('id')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (!policies || policies.length === 0) return false;

    const targetId = policies[id - 1]?.id;
    if (!targetId) return false;

    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', targetId);

    if (error) {
      console.error('Error deleting policy:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete policy:', error);
    return false;
  }
};
