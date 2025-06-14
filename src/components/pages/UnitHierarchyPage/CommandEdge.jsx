// src/components/UnitHierarchy/EdgeTypes/CommandEdge.jsx
import React from 'react';
import {
    getBezierPath,
    EdgeLabelRenderer,
    BaseEdge,
    getSmoothStepPath,
    getMarkerEnd
} from 'reactflow';

const CommandEdge = ({
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
    // Use smooth step path for cleaner military-style hierarchy lines
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 8,
    });

    // Custom marker end for command relationships
    const customMarkerEnd = getMarkerEnd({
        ...markerEnd,
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: selected ? '#ffd700' : '#4a5d23',
    });

    return (
        <>
            {/* Shadow/glow effect for selected edge */}
            {selected && (
                <path
                    d={edgePath}
                    style={{
                        ...style,
                        stroke: '#ffd700',
                        strokeWidth: 4,
                        opacity: 0.3,
                        filter: 'blur(4px)',
                    }}
                    className="react-flow__edge-path-selector"
                    fillRule="evenodd"
                />
            )}

            {/* Main edge path */}
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={customMarkerEnd}
                style={{
                    ...style,
                    stroke: selected ? '#ffd700' : '#4a5d23',
                    strokeWidth: selected ? 3 : 2,
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
                        className="nodrag nopan command-edge-label"
                    >
                        <div
                            style={{
                                background: '#0d0d0d',
                                border: `2px solid ${selected ? '#ffd700' : '#4a5d23'}`,
                                borderRadius: 4,
                                padding: '4px 8px',
                                color: selected ? '#ffd700' : '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            {/* Command icon */}
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span>{data.label || 'Commands'}</span>
                        </div>

                        {/* Additional metadata */}
                        {data.metadata && (
                            <div
                                style={{
                                    fontSize: 10,
                                    color: '#999',
                                    marginTop: 2,
                                    textAlign: 'center',
                                }}
                            >
                                {data.metadata}
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

export default CommandEdge;