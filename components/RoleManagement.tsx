import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import Modal from './common/Modal.tsx';
import { getRoles, addRole, updateRole, deleteRole } from '../services/roleService.ts';
import { Role, Permission } from '../types.ts';
import { PERMISSIONS } from '../constants.tsx';

const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const fetchRoles = async () => {
        const rolesData = await getRoles();
        setRoles(rolesData);
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenModal = (role: Role | null) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchRoles();
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (id <= 3) { // Prevent deleting default roles
            alert("Default roles (Admin, Employee, HR Manager) cannot be deleted.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this role?')) {
            await deleteRole(id);
            await fetchRoles();
        }
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Role & Permission Management</h2>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Add New Role
                    </button>
                </div>
                <div className="space-y-4">
                    {roles.map(role => (
                        <div key={role.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">{role.name}</h3>
                                <p className="text-sm text-gray-500">{role.permissions.length} permissions</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleOpenModal(role)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900 text-sm font-medium" disabled={role.id <= 3}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {isModalOpen && (
                <RoleModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    role={selectedRole}
                />
            )}
        </>
    );
};

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    role: Role | null;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, role }) => {
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
    const [error, setError] = useState('');

    useEffect(() => {
        if (role) {
            setName(role.name);
            setPermissions(new Set(role.permissions));
        } else {
            setName('');
            setPermissions(new Set());
        }
        setError('');
    }, [role, isOpen]);

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        const newPermissions = new Set(permissions);
        if (checked) {
            newPermissions.add(permission);
        } else {
            newPermissions.delete(permission);
        }
        setPermissions(newPermissions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            setError('Role name is required.');
            return;
        }

        // FIX: Explicitly type `roleData` to match the `addRole` function's expected parameter type, resolving a TypeScript inference issue.
        const roleData: Omit<Role, 'id'> = { name, permissions: Array.from(permissions) };

        if (role) {
            await updateRole({ ...role, ...roleData });
        } else {
            await addRole(roleData);
        }
        onSave();
    };

    const permissionGroups = PERMISSIONS.reduce((acc, p) => {
        const group = p.split(':')[0];
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={role ? 'Edit Role' : 'Add New Role'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">Role Name</label>
                    <input
                        type="text"
                        id="roleName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        disabled={!!role && role.id <= 3}
                    />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                    <div className="space-y-4">
                        {Object.entries(permissionGroups).map(([group, perms]) => (
                             <div key={group}>
                                 <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2 capitalize">{group.replace('-', ' ')}</h5>
                                 <div className="grid grid-cols-2 gap-2">
                                    {perms.map(p => (
                                        <label key={p} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={permissions.has(p)}
                                                onChange={(e) => handlePermissionChange(p, e.target.checked)}
                                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="text-sm text-gray-600">{p.split(':')[1].replace(/-/g, ' ')}</span>
                                        </label>
                                    ))}
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">Save Role</button>
                </div>
            </form>
        </Modal>
    );
};

export default RoleManagement;