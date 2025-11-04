import { Role } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

export const getRoles = async (): Promise<Role[]> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return (data || []).map((role: any) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions || [],
    }));
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return [];
  }
};

export const addRole = async (newRoleData: Omit<Role, 'id'>): Promise<Role[]> => {
  try {
    const { error } = await supabase
      .from('roles')
      .insert({
        name: newRoleData.name,
        description: (newRoleData as any).description || '',
        permissions: newRoleData.permissions,
      });

    if (error) {
      console.error('Error adding role:', error);
    }

    return await getRoles();
  } catch (error) {
    console.error('Failed to add role:', error);
    return await getRoles();
  }
};

export const updateRole = async (updatedRole: Role): Promise<Role[]> => {
  try {
    const { error } = await supabase
      .from('roles')
      .update({
        name: updatedRole.name,
        description: (updatedRole as any).description || '',
        permissions: updatedRole.permissions,
      })
      .eq('id', updatedRole.id);

    if (error) {
      console.error('Error updating role:', error);
    }

    return await getRoles();
  } catch (error) {
    console.error('Failed to update role:', error);
    return await getRoles();
  }
};

export const deleteRole = async (id: number): Promise<Role[]> => {
  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting role:', error);
    }

    return await getRoles();
  } catch (error) {
    console.error('Failed to delete role:', error);
    return await getRoles();
  }
};
