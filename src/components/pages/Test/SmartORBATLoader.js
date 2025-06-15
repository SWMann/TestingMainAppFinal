import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
    ReactFlowProvider
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

// Simple Position Node Component
const PositionNode = ({ data }) => {
    const { display_title, current_holder, unit_info, is_vacant, position_type } = data;

    const getNodeStyle = () => {
        const baseStyle = {
            padding: '10px',
            borderRadius: '5px',
            border: '2px solid',
            minWidth: '200px',
            backgroundColor: 'white'
        };

        const borderColors = {
            command: '#ff6b6b',
            staff: '#4dabf7',
            nco: '#51cf66',
            specialist: '#845ef7',
            standard: '#868e96'
        };

        return {
            ...baseStyle,
            borderColor: borderColors[position_type] || borderColors.standard
        };
    };

    return (
        <>
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            <div style={getNodeStyle()}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {display_title}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    {unit_info?.abbreviation || 'Unknown Unit'}
                </div>
                {is_vacant ? (
                    <div style={{ color: '#ff6b6b', fontSize: '12px' }}>
                        Position Vacant
                    </div>
                ) : current_holder && (
                    <div style={{ fontSize: '12px' }}>
                        <strong>{current_holder.rank?.abbreviation} {current_holder.username}</strong>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            {current_holder.service_number}
                        </div>
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </>
    );
};

const nodeTypes = {
    position: PositionNode
};

// Layout function
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 50,
        ranksep: 100
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 200, height: 100 });
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
                x: nodeWithPosition.x - 100,
                y: nodeWithPosition.y - 50,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// Main ORBAT Component
const SimpleORBAT = ({ unitId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unitInfo, setUnitInfo] = useState(null);

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
                `/anotherbackendagain-backend2/api/units/orbat/unit_orbat/?unit_id=${unitId}&include_subunits=true`,
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

            // Set unit info
            setUnitInfo(data.unit);

            // Convert to React Flow format
            const flowNodes = data.nodes.map(node => ({
                id: node.id,
                type: 'position',
                data: node,
                position: { x: 0, y: 0 }
            }));

            const flowEdges = data.edges.map(edge => ({
                ...edge,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                }
            }));

            // Apply layout
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
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
    }, [unitId]);

    useEffect(() => {
        fetchORBATData();
    }, [fetchORBATData]);

    if (loading) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div>Loading ORBAT data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <div style={{ color: '#ff6b6b' }}>Error: {error}</div>
                <button onClick={fetchORBATData}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            {unitInfo && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6'
                }}>
                    <h3 style={{ margin: 0 }}>
                        {unitInfo.name} ({unitInfo.abbreviation}) - ORBAT
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        Total Positions: {nodes.length} |
                        Filled: {nodes.filter(n => !n.data.is_vacant).length} |
                        Vacant: {nodes.filter(n => n.data.is_vacant).length}
                    </div>
                </div>
            )}

            <div style={{ height: 'calc(100% - 60px)' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};

// Wrapper with Provider
const SimpleORBATWrapper = (props) => {
    return (
        <ReactFlowProvider>
            <SimpleORBAT {...props} />
        </ReactFlowProvider>
    );
};

export default SimpleORBATWrapper;