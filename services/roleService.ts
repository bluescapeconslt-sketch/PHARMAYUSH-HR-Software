import { Permission, Role } from '../types.ts';
import { supabase } from './supabaseClient.ts';

export interface RoleData {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  created_at: string;
}

export interface RoleWithUUID extends Role {
  uuid: string;
}

const transformToRole = (data: RoleData, index: number): RoleWithUUID => {
  return {
    id: index + 1,
    uuid: data.id,
    name: data.name,
    permissions: data.permissions
  };
};

const roleCache = new Map<number, string>();

export const getRoles = async (): Promise<RoleWithUUID[]> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    roleCache.clear();
    const roles = (data || []).map((role, index) => {
      const transformed = transformToRole(role, index);
      roleCache.set(transformed.id, transformed.uuid);
      return transformed;
    });

    return roles;
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

export const updateRole = async (updatedRole: any): Promise<RoleData | null> => {
  try {
    const roleId = typeof updatedRole.id === 'number'
      ? roleCache.get(updatedRole.id) || updatedRole.uuid
      : updatedRole.id;

    if (!roleId) {
      console.error('Role ID not found');
      return null;
    }

    const { id, uuid, ...updateData } = updatedRole;

    const { data, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', roleId)
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

export const deleteRole = async (id: number | string): Promise<boolean> => {
  try {
    const roleId = typeof id === 'number' ? roleCache.get(id) : id;

    if (!roleId) {
      console.error('Role ID not found');
      return false;
    }

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

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
