// src/components/UnitHierarchy/EdgeTypes/SupportEdge.jsx
import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

const SupportEdge = ({
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
                         selected,
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
            {/* Shadow effect for selected edge */}
            {selected && (
                <path
                    d={edgePath}
                    style={{
                        ...style,
                        stroke: '#60a5fa',
                        strokeWidth: 4,
                        opacity: 0.3,
                        filter: 'blur(4px)',
                    }}
                    className="react-flow__edge-path-selector"
                    fillRule="evenodd"
                />
            )}

            {/* Main edge path with dashed line */}
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: selected ? '#60a5fa' : '#3b82f6',
                    strokeWidth: selected ? 3 : 2,
                    strokeDasharray: '8 4',
                    transition: 'all 0.2s ease',
                }}
            />

            {/* Edge Label */}
            {data?.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            fontWeight: 600,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan support-edge-label"
                    >
                        <div
                            style={{
                                background: '#0d0d0d',
                                border: `2px solid ${selected ? '#60a5fa' : '#3b82f6'}`,
                                borderRadius: 4,
                                padding: '4px 8px',
                                color: selected ? '#60a5fa' : '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            {/* Support icon */}
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <span>{data.label || 'Supports'}</span>
                        </div>

                        {/* Support type if specified */}
                        {data.supportType && (
                            <div
                                style={{
                                    fontSize: 10,
                                    color: '#999',
                                    marginTop: 2,
                                    textAlign: 'center',
                                    textTransform: 'capitalize',
                                }}
                            >
                                ({data.supportType})
                            </div>
                        )}
                    </div>
                </EdgeLabelRenderer>
            )}

            {/* Interaction area for better edge selection */}
            <path
                d={edgePath}
                style={{
                    stroke: 'transparent',
                    strokeWidth: 20,
                    fill: 'none',
                    cursor: 'pointer',
                }}
                className="react-flow__edge-interaction"
            />
        </>
    );
};

export default SupportEdge;