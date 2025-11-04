import { Employee, HierarchyNode } from '../types.ts';
import { getEmployees } from './employeeService.ts';

export const buildHierarchy = (): HierarchyNode[] => {
    const employees = getEmployees();
    if (employees.length === 0) {
        return [];
    }

    const nodes: Record<number, HierarchyNode> = {};
    employees.forEach(employee => {
        nodes[employee.id] = { ...employee, children: [] };
    });

    const roots: HierarchyNode[] = [];
    Object.values(nodes).forEach(node => {
        if (node.reportsTo && nodes[node.reportsTo]) {
            nodes[node.reportsTo].children.push(node);
        } else {
            roots.push(node);
        }
    });

    // Ensure children are sorted if needed, e.g., by name
    Object.values(nodes).forEach(node => {
        node.children.sort((a, b) => a.name.localeCompare(b.name));
    });

    return roots;
};