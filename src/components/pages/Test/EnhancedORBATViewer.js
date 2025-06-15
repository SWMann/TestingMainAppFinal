// src/components/pages/ORBAT/EnhancedORBATViewer.js
import React, { useState, useEffect, useCallback, memo } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
    ReactFlowProvider,
    Panel
} from 'reactflow';
import dagre from 'dagre';
import {
    Shield, User, UserX, Crown, Star, Users, ChevronDown,
    ChevronRight, AlertCircle, Clock, Award, Briefcase,
    Activity, Target, UserCheck
} from 'lucide-react';
import 'reactflow/dist/style.css';

// Enhanced Position Node Component
const EnhancedPositionNode = memo(({ data, selected }) => {
    const [expanded, setExpanded] = useState(true);
    const {
        display_title,
        current_holder,
        unit_info,
        is_vacant,
        position_type,
        role_info,
        onSelect
    } = data;

    const getNodeStyle = () => {
        const baseStyle = {
            padding: '0',
            borderRadius: '12px',
            border: '2px solid',
            minWidth: '280px',
            backgroundColor: '#0A1929',
            boxShadow: selected ? '0 0 20px rgba(79, 203, 248, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        };

        const borderColors = {
            command: '#FF4444',
            staff: '#4FCBF8',
            nco: '#39FF14',
            specialist: '#845ef7',
            standard: '#8B92A0'
        };

        return {
            ...baseStyle,
            borderColor: borderColors[position_type] || borderColors.standard
        };
    };

    const getPositionIcon = () => {
        const icons = {
            command: <Crown size={16} />,
            staff: <Briefcase size={16} />,
            nco: <Shield size={16} />,
            specialist: <Star size={16} />,
            standard: <Users size={16} />
        };
        return icons[position_type] || icons.standard;
    };

    const getRankColor = (rank) => {
        if (!rank) return '#8B92A0';
        if (rank.includes('LT') || rank.includes('CPT') || rank.includes('MAJ') || rank.includes('COL')) {
            return '#E4D00A'; // Officer gold
        }
        if (rank.includes('SGT') || rank.includes('1SG') || rank.includes('SGM')) {
            return '#39FF14'; // NCO green
        }
        return '#4FCBF8'; // Default
    };

    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    width: 12,
                    height: 12,
                    background: '#4FCBF8',
                    border: '2px solid #0C1C2C'
                }}
            />

            <div style={getNodeStyle()} onClick={() => onSelect && onSelect(data)}>
                {/* Header */}
                <div className="node-header" style={{
                    backgroundColor: position_type === 'command' ? '#FF4444' : '#1A2332',
                    padding: '8px 12px',
                    borderRadius: '10px 10px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getPositionIcon()}
                        <span style={{
                            fontWeight: '600',
                            fontSize: '14px',
                            color: '#E0E6ED'
                        }}>
                            {display_title}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#E0E6ED',
                            cursor: 'pointer',
                            padding: '2px'
                        }}
                    >
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Content */}
                {expanded && (
                    <div style={{ padding: '12px' }}>
                        {/* Unit Info */}
                        <div style={{
                            fontSize: '12px',
                            color: '#8B92A0',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Target size={12} />
                            {unit_info?.abbreviation || 'Unknown Unit'}
                            {role_info?.category && (
                                <>
                                    <span style={{ margin: '0 4px' }}>•</span>
                                    <span style={{ textTransform: 'capitalize' }}>
                                        {role_info.category}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Assignment Status */}
                        <div style={{
                            backgroundColor: is_vacant ? 'rgba(255, 107, 53, 0.1)' : 'rgba(57, 255, 20, 0.1)',
                            border: `1px solid ${is_vacant ? '#FF6B35' : '#39FF14'}`,
                            borderRadius: '8px',
                            padding: '8px',
                            marginTop: '8px'
                        }}>
                            {is_vacant ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#FF6B35'
                                }}>
                                    <UserX size={16} />
                                    <span style={{ fontSize: '13px', fontWeight: '500' }}>
                                        Position Vacant
                                    </span>
                                </div>
                            ) : current_holder && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '4px'
                                    }}>
                                        <User size={16} color="#39FF14" />
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#E0E6ED'
                                        }}>
                                            {current_holder.rank?.abbreviation} {current_holder.username}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#8B92A0',
                                        marginLeft: '24px'
                                    }}>
                                        {current_holder.service_number}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Info */}
                        {role_info && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: '11px',
                                color: '#8B92A0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {role_info.is_command_role && (
                                    <span style={{
                                        backgroundColor: 'rgba(255, 68, 68, 0.2)',
                                        color: '#FF4444',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '500'
                                    }}>
                                        COMMAND
                                    </span>
                                )}
                                {role_info.is_staff_role && (
                                    <span style={{
                                        backgroundColor: 'rgba(79, 203, 248, 0.2)',
                                        color: '#4FCBF8',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '500'
                                    }}>
                                        STAFF
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    width: 12,
                    height: 12,
                    background: '#4FCBF8',
                    border: '2px solid #0C1C2C'
                }}
            />
        </>
    );
});

const nodeTypes = {
    position: EnhancedPositionNode
};

// Enhanced Layout Function
const getEnhancedLayout = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 80,
        ranksep: 120,
        edgesep: 20,
        marginx: 50,
        marginy: 50
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 280, height: 140 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 140,
                y: nodeWithPosition.y - 70,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// Main Enhanced ORBAT Viewer Component
const EnhancedORBATViewer = ({
                                 unitId,
                                 viewMode,
                                 searchQuery,
                                 filters,
                                 onPositionSelect,
                                 onDataLoad,
                                 filteredData
                             }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchORBATData = useCallback(async () => {
        if (!unitId) {
            setError('No unit ID provided');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/units/orbat/unit_orbat/?unit_id=${unitId}&include_subunits=true`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Pass data up to parent
            if (onDataLoad) {
                onDataLoad(data);
            }

            // Convert to React Flow format
            const flowNodes = data.nodes.map(node => ({
                id: node.id,
                type: 'position',
                data: {
                    ...node,
                    onSelect: onPositionSelect
                },
                position: { x: 0, y: 0 }
            }));

            const flowEdges = data.edges.map(edge => ({
                ...edge,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#4FCBF8'
                },
                style: {
                    stroke: '#4FCBF8',
                    strokeWidth: 2
                },
                animated: false
            }));

            // Apply layout
            const { nodes: layoutedNodes, edges: layoutedEdges } = getEnhancedLayout(
                flowNodes,
                flowEdges,
                'TB'
            );

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        } catch (err) {
            console.error('Error fetching ORBAT data:', err);
            setError(err.message || 'Failed to load ORBAT data');
        } finally {
            setLoading(false);
        }
    }, [unitId, onPositionSelect, onDataLoad]);

    useEffect(() => {
        fetchORBATData();
    }, [fetchORBATData]);

    // Update nodes when filtered data changes
    useEffect(() => {
        if (filteredData && filteredData.nodes) {
            const filteredNodeIds = new Set(filteredData.nodes.map(n => n.id));

            setNodes(nodes => nodes.map(node => ({
                ...node,
                hidden: !filteredNodeIds.has(node.id)
            })));
        }
    }, [filteredData, setNodes]);

    if (loading) {
        return (
            <div className="orbat-loading">
                <div className="loading-spinner" />
                <p>Loading organizational structure...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orbat-error">
                <AlertCircle size={48} />
                <h3>Error Loading ORBAT</h3>
                <p>{error}</p>
                <button onClick={fetchORBATData} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="orbat-list-view">
                {/* List view implementation */}
                <div className="list-header">
                    <h3>Position List View</h3>
                </div>
                <div className="position-list">
                    {nodes.filter(n => !n.hidden).map(node => (
                        <div
                            key={node.id}
                            className="position-list-item"
                            onClick={() => onPositionSelect(node.data)}
                        >
                            <div className="position-info">
                                <h4>{node.data.display_title}</h4>
                                <p>{node.data.unit_info?.abbreviation}</p>
                            </div>
                            <div className="holder-info">
                                {node.data.is_vacant ? (
                                    <span className="vacant">Vacant</span>
                                ) : (
                                    <span className="filled">
                                        {node.data.current_holder?.rank?.abbreviation} {node.data.current_holder?.username}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{
                    padding: 0.2
                }}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
                <Background
                    color="#1A2332"
                    gap={20}
                    size={1}
                />
                <MiniMap
                    nodeStrokeColor="#4FCBF8"
                    nodeColor="#0A1929"
                    nodeBorderRadius={8}
                    maskColor="rgba(12, 28, 44, 0.8)"
                    position="bottom-right"
                />
                <Controls
                    position="bottom-left"
                    style={{
                        background: 'rgba(10, 25, 41, 0.9)',
                        border: '1px solid #382C54',
                        borderRadius: '8px'
                    }}
                />

                <Panel position="top-left">
                    <div className="orbat-info-panel">
                        <div className="panel-stat">
                            <Activity size={16} />
                            <span>{nodes.filter(n => !n.hidden).length} Positions</span>
                        </div>
                        <div className="panel-stat">
                            <UserCheck size={16} />
                            <span>{nodes.filter(n => !n.hidden && !n.data.is_vacant).length} Filled</span>
                        </div>
                        <div className="panel-stat">
                            <UserX size={16} />
                            <span>{nodes.filter(n => !n.hidden && n.data.is_vacant).length} Vacant</span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};

// Wrapper with Provider
const EnhancedORBATWrapper = (props) => {
    return (
        <ReactFlowProvider>
            <EnhancedORBATViewer {...props} />
        </ReactFlowProvider>
    );
};

export default EnhancedORBATWrapper;