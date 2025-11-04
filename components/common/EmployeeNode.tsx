import React from 'react';
import { HierarchyNode, Position } from '../../types.ts';

interface EmployeeNodeProps {
    node: HierarchyNode;
}

const getNodeStyles = (position: Position) => {
    switch (position) {
        case 'CEO': return { ring: 'border-pink-500', bg: 'bg-pink-500' };
        case 'Manager': return { ring: 'border-orange-500', bg: 'bg-orange-500' };
        case 'TL': return { ring: 'border-green-500', bg: 'bg-green-500' };
        case 'Worker': return { ring: 'border-blue-500', bg: 'bg-blue-500' };
        default: return { ring: 'border-gray-400', bg: 'bg-gray-400' };
    }
};

const EmployeeNode: React.FC<EmployeeNodeProps> = ({ node }) => {
    const hasChildren = node.children && node.children.length > 0;
    const styles = getNodeStyles(node.position);

    return (
        <li>
            <div className="node-wrapper flex flex-col items-center">
                <div className="node-container">
                     <div className={`avatar-wrapper ${styles.ring}`}>
                        <img src={node.avatar} alt={node.name} />
                    </div>
                    <div className={`label-wrapper ${styles.bg}`}>
                       {node.position === 'Worker' ? node.jobTitle : node.position}
                    </div>
                </div>

                {hasChildren && (
                    <ul>
                        {node.children.map(child => (
                            <EmployeeNode key={child.id} node={child} />
                        ))}
                    </ul>
                )}
            </div>
        </li>
    );
};

export default EmployeeNode;