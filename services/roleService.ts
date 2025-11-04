import { Role } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

export const getRoles = async (): Promise<Role[]> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    }));
  } catch (error) {
    console.error('Failed to fetch roles from database', error);
    return [];
  }
};

export const addRole = async (newRoleData: Omit<Role, 'id'>): Promise<Role[]> => {
  try {
    const { error } = await supabase
      .from('roles')
      .insert({
        name: newRoleData.name,
        description: newRoleData.description,
        permissions: newRoleData.permissions || [],
      });

    if (error) throw error;

    return await getRoles();
  } catch (error) {
    console.error('Failed to add role', error);
    return await getRoles();
  }
};

export const updateRole = async (updatedRole: Role): Promise<Role[]> => {
  try {
    const { error } = await supabase
      .from('roles')
      .update({
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: updatedRole.permissions,
      })
      .eq('id', updatedRole.id);

    if (error) throw error;

    return await getRoles();
  } catch (error) {
    console.error('Failed to update role', error);
    return await getRoles();
  }
};

export const deleteRole = async (id: string | number): Promise<Role[]> => {
  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await getRoles();
  } catch (error) {
    console.error('Failed to delete role', error);
    return await getRoles();
  }
};
