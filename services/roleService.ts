import { Role } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

let rolesCache: Role[] | null = null;

export const getRoles = (): Role[] => {
  if (rolesCache) {
    return rolesCache;
  }
  return [];
};

export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*');

    if (error) throw error;

    const roles: Role[] = (data || []).map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    }));

    rolesCache = roles;
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};

export const addRole = async (newRoleData: Omit<Role, 'id'>): Promise<Role[]> => {
  try {
    const { error } = await supabase
      .from('roles')
      .insert([{
        name: newRoleData.name,
        description: newRoleData.description,
        permissions: newRoleData.permissions,
      }]);

    if (error) throw error;

    return await fetchRoles();
  } catch (error) {
    console.error('Error adding role:', error);
    return getRoles();
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

    return await fetchRoles();
  } catch (error) {
    console.error('Error updating role:', error);
    return getRoles();
  }
};

export const deleteRole = async (id: number | string): Promise<Role[]> => {
  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await fetchRoles();
  } catch (error) {
    console.error('Error deleting role:', error);
    return getRoles();
  }
};
