// src/components/UnitHierarchy/EdgeTypes/CoordinationEdge.jsx
import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

const CoordinationEdge = ({
                              id,
                              sourceX,
                              sourceY,
                              targetX,
                              targetY,
                              sourcePosition,
                              targetPosition,
                              style = {},
                              markerEnd,
                              data,
                          }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: '#f59e0b',
                    strokeWidth: 2,
                    strokeDasharray: '10 5',
                }}
            />
            {data?.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                            background: '#0d0d0d',
                            border: '1px solid #f59e0b',
                            borderRadius: 4,
                            padding: '2px 6px',
                            color: '#f59e0b',
                        }}
                        className="nodrag nopan edge-label coordination"
                    >
                        {data.label || 'Coordinates'}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default CoordinationEdge;