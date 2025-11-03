import React, { useState } from 'react';
import { HierarchyNode, Position } from '../../types.ts';

interface EmployeeNodeProps {
    node: HierarchyNode;
}

const getPositionBadgeColor = (position: Position) => {
    switch (position) {
        case 'CEO': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'Manager': return 'bg-green-100 text-green-800 border-green-300';
        case 'Dept. Head': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'Employee': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Intern': return 'bg-gray-100 text-gray-800 border-gray-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

const EmployeeNode: React.FC<EmployeeNodeProps> = ({ node }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasChildren = node.children && node.children.length > 0;

    return (
        <li>
            <div className="inline-flex items-center">
                <div className="node-card bg-white rounded-lg border shadow-sm p-2 flex items-center gap-3 min-w-[280px]">
                    <img src={node.avatar} alt={node.name} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-800">{node.name}</p>
                        <p className="text-sm text-gray-500">{node.jobTitle}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${getPositionBadgeColor(node.position)}`}>
                            {node.position}
                        </span>
                    </div>
                </div>
                {hasChildren && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="ml-2 w-5 h-5 flex-shrink-0 flex items-center justify-center bg-white border border-gray-400 rounded-full text-gray-600 hover:bg-gray-100 z-10"
                    >
                        {isExpanded ? '-' : '+'}
                    </button>
                )}
            </div>

            {hasChildren && isExpanded && (
                <ul>
                    {node.children.map(child => (
                        <EmployeeNode key={child.id} node={child} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default EmployeeNode;