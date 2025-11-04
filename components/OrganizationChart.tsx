import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { buildHierarchy } from '../services/hierarchyService.ts';
import { HierarchyNode } from '../types.ts';
import EmployeeNode from './common/EmployeeNode.tsx';

const OrganizationChart: React.FC = () => {
    const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);

    useEffect(() => {
        const tree = buildHierarchy();
        setHierarchy(tree);
    }, []);

    return (
        <Card title="Organization Chart">
            <div className="org-chart">
                {hierarchy.length > 0 ? (
                    <ul>
                        {hierarchy.map(rootNode => (
                            <EmployeeNode key={rootNode.id} node={rootNode} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500">No employees found to build the chart.</p>
                )}
            </div>
        </Card>
    );
};

export default OrganizationChart;