import { Permission, Role } from '../types.ts';
import { supabase } from './supabaseClient.ts';

export interface RoleData {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  created_at: string;
}

const transformToRole = (data: RoleData, index: number): Role => {
  return {
    id: index + 1,
    name: data.name,
    permissions: data.permissions
  };
};

export const getRoles = async (): Promise<Role[]> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return (data || []).map((role, index) => transformToRole(role, index));
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return [];
  }
};

export const addRole = async (newRoleData: Omit<RoleData, 'id' | 'created_at'>): Promise<RoleData | null> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .insert([newRoleData])
      .select()
      .single();

    if (error) {
      console.error('Error adding role:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to add role:', error);
    return null;
  }
};

export const updateRole = async (updatedRole: Partial<RoleData> & { id: string }): Promise<RoleData | null> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .update(updatedRole)
      .eq('id', updatedRole.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating role:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to update role:', error);
    return null;
  }
};

export const deleteRole = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete role:', error);
    return false;
  }
};
