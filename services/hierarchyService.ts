import { Employee, HierarchyNode, Position } from '../types.ts';
import { getEmployees } from './employeeService.ts';

const positionRank: Record<Position, number> = {
    'CEO': 5,
    'Manager': 4,
    'Dept. Head': 3,
    'Employee': 2,
    'Intern': 1,
};

// Helper to find a potential parent for a given employee node
const findParent = (child: HierarchyNode, nodes: HierarchyNode[]): HierarchyNode | null => {
    const childRank = positionRank[child.position];
    let bestParent: HierarchyNode | null = null;
    let bestParentRank = Infinity;

    // Find the closest superior in the hierarchy
    for (const potentialParent of nodes) {
        if (child.id === potentialParent.id) continue;

        const parentRank = positionRank[potentialParent.position];

        if (parentRank > childRank && parentRank < bestParentRank) {
            // A CEO can be a parent to anyone
            if (potentialParent.position === 'CEO') {
                bestParent = potentialParent;
                bestParentRank = parentRank;
            } 
            // Managers can parent Dept. Heads in their department
            else if (potentialParent.position === 'Manager' && child.position === 'Dept. Head' && potentialParent.department === child.department) {
                bestParent = potentialParent;
                bestParentRank = parentRank;
            }
            // Dept. Heads can parent Employees and Interns in their department
            else if (potentialParent.position === 'Dept. Head' && (child.position === 'Employee' || child.position === 'Intern') && potentialParent.department === child.department) {
                 bestParent = potentialParent;
                 bestParentRank = parentRank;
            }
        }
    }
    return bestParent;
};


export const buildHierarchy = async (): Promise<HierarchyNode[]> => {
    const employees = await getEmployees();

    // 1. Create a map of nodes by ID for easy lookup and add a 'children' array
    const nodes: Record<number, HierarchyNode> = {};
    employees.forEach(employee => {
        nodes[employee.id] = { ...employee, children: [] };
    });

    const employeeNodes = Object.values(nodes);
    const roots: HierarchyNode[] = [];

    // 2. Link nodes to their parents
    employeeNodes.forEach(childNode => {
        // Find the best parent for the current child
        const parent = findParent(childNode, employeeNodes);

        if (parent) {
            // Find the parent in our nodes map and add the child
            nodes[parent.id].children.push(childNode);
        } else if (childNode.position === 'CEO') {
             // If a node has no parent and is a CEO, it's a root node
            roots.push(childNode);
        } else {
            // FIX: Refactored logic to avoid redundant and erroneous type comparison.
            // Fallback: If a non-CEO has no direct parent, attach them to the CEO.
            const ceo = employeeNodes.find(e => e.position === 'CEO');
            if (ceo) {
                // A CEO exists to attach to (we know ceo.id !== childNode.id because child is not a CEO)
                nodes[ceo.id].children.push(childNode);
            } else {
                // If there's no CEO and no parent, they become a root (e.g., in a flat structure)
                roots.push(childNode);
            }
        }
    });

    // Ensure all nodes are accounted for, even if the logic fails to place them.
    // This handles cases where a department might be missing a manager or head.
    const allLinkedIds = new Set<number>();
    const gatherIds = (node: HierarchyNode) => {
        allLinkedIds.add(node.id);
        node.children.forEach(gatherIds);
    };
    roots.forEach(gatherIds);

    employeeNodes.forEach(node => {
        if (!allLinkedIds.has(node.id)) {
            const ceo = roots.find(r => r.position === 'CEO');
            if (ceo) {
                ceo.children.push(node); // Attach unlinked nodes to the CEO
            } else {
                roots.push(node); // Or add as a new root if no CEO
            }
        }
    });

    return roots;
};