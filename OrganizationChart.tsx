import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { buildHierarchy } from '../services/hierarchyService.ts';
import { HierarchyNode } from '../types.ts';
import EmployeeNode from './common/EmployeeNode.tsx';

const OrganizationChart: React.FC = () => {
    const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateChart = async () => {
            setIsLoading(true);
            try {
                const tree = await buildHierarchy();
                setHierarchy(tree);
            } catch (error) {
                console.error("Failed to build organization chart", error);
            } finally {
                setIsLoading(false);
            }
        };
        generateChart();
    }, []);

    const renderChart = () => {
        if (isLoading) {
            return <p className="text-center text-gray-500">Loading chart...</p>;
        }
        if (hierarchy.length > 0) {
            return (
                <ul>
                    {hierarchy.map(rootNode => (
                        <EmployeeNode key={rootNode.id} node={rootNode} />
                    ))}
                </ul>
            );
        }
        return <p className="text-center text-gray-500">No employees found to build the chart.</p>;
    }

    return (
        <Card title="Organization Chart">
            <div className="org-chart">
                {renderChart()}
            </div>
        </Card>
    );
};

export default OrganizationChart;
