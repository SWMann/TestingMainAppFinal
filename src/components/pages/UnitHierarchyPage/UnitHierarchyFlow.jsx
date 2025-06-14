// src/components/UnitHierarchy/UnitHierarchyFlow.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    useReactFlow,
    Panel,
    MarkerType,
} from 'reactflow';
import { toast } from 'react-toastify';

// Import custom components
import UnitNode from './UnitNode';
import CommandEdge from './CommandEdge';
import SupportEdge from './SupportEdge';
import CoordinationEdge from './CoordinationEdge';
import EdgeMarkers from './EdgeMarkers';
import EdgeContextMenu, { EdgeEditModal } from './EdgeContextMenu';

// Import utilities
import { hierarchyService } from './hierarchyService';
import { transformNodesToReactFlow, transformEdgesToReactFlow } from './hierarchyTransformers';
import {
    getEdgeMarker,
    getEdgeStyle,
    createEdgeConfig,
    validateEdgeConnection,
    getEdgeLabel
} from './edgeUtils';

const UnitHierarchyFlow = ({ viewId, filterConfig, isAdmin }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedView, setSelectedView] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [connectionType, setConnectionType] = useState('command');
    const [contextMenu, setContextMenu] = useState(null);
    const [editingEdge, setEditingEdge] = useState(null);
    const reactFlowInstance = useReactFlow();
    const saveTimeoutRef = useRef(null);

    // Custom node types
    const nodeTypes = {
        unitNode: UnitNode,
    };

    // Custom edge types
    const edgeTypes = {
        command: CommandEdge,
        support: SupportEdge,
        coordination: CoordinationEdge,
    };

    // Load hierarchy data
    useEffect(() => {
        loadHierarchyData(viewId);
    }, [viewId]);

    // Apply filters
    useEffect(() => {
        if (selectedView && filterConfig) {
            applyFilters();
        }
    }, [filterConfig, selectedView]);

    const loadHierarchyData = async (id) => {
        try {
            setLoading(true);
            const response = await hierarchyService.getViewData(id);
            const { nodes: nodeData, edges: edgeData, node_positions, view } = response.data;

            // Transform nodes for React Flow
            const flowNodes = transformNodesToReactFlow(nodeData, node_positions);

            // Transform edges with custom markers and styles
            const flowEdges = edgeData.map(edge => ({
                ...edge,
                id: edge.id || `edge-${edge.source}-${edge.target}`,
                source: edge.source.toString(),
                target: edge.target.toString(),
                type: edge.type || 'command',
                markerEnd: getEdgeMarker(edge.type || 'command', false),
                style: getEdgeStyle(edge.type || 'command', false),
                data: {
                    label: edge.data?.label || getEdgeLabel(edge.type || 'command'),
                    ...edge.data
                }
            }));

            setNodes(flowNodes);
            setEdges(flowEdges);
            setSelectedView(view);
        } catch (error) {
            console.error('Failed to load hierarchy data:', error);
            toast.error('Failed to load hierarchy data');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        setNodes(nodes => nodes.map(node => ({
            ...node,
            hidden: !shouldShowNode(node),
            data: {
                ...node.data,
                showVacant: filterConfig.showVacant,
                showPersonnelCount: filterConfig.showPersonnelCount
            }
        })));
    };

    const shouldShowNode = (node) => {
        const { unitTypes, branches } = filterConfig;

        if (unitTypes.length > 0 && !unitTypes.includes(node.data.unit_type)) {
            return false;
        }

        if (branches.length > 0 && !branches.includes(node.data.branch_name)) {
            return false;
        }

        return true;
    };

    // Handle node position changes
    const handleNodesChange = useCallback((changes) => {
        if (isAdmin) {
            onNodesChange(changes);

            // Auto-save positions after 2 seconds of inactivity
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                savePositions();
            }, 2000);
        }
    }, [isAdmin, onNodesChange]);

    const savePositions = async () => {
        if (!isAdmin || isSaving) return;

        setIsSaving(true);
        const currentNodes = reactFlowInstance.getNodes();

        const positions = currentNodes.reduce((acc, node) => {
            acc[node.id] = {
                x: node.position.x,
                y: node.position.y
            };
            return acc;
        }, {});

        try {
            await hierarchyService.savePositions(viewId, positions);
            toast.success('Positions saved', { autoClose: 2000 });
        } catch (error) {
            toast.error('Failed to save positions');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle edge selection
    const onEdgeClick = useCallback((event, edge) => {
        setEdges((eds) =>
            eds.map((e) => ({
                ...e,
                selected: e.id === edge.id,
                markerEnd: getEdgeMarker(e.type || 'command', e.id === edge.id),
                style: getEdgeStyle(e.type || 'command', e.id === edge.id),
            }))
        );
    }, [setEdges]);

    // Handle edge right-click
    const onEdgeContextMenu = useCallback((event, edge) => {
        event.preventDefault();
        event.stopPropagation();

        setContextMenu({
            edge,
            position: { x: event.clientX, y: event.clientY }
        });
    }, []);

    // Handle connection creation with validation
    const onConnect = useCallback(async (params) => {
        if (!isAdmin) {
            toast.warning('Only administrators can create connections');
            return;
        }

        // Validate connection
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);

        if (!validateEdgeConnection(sourceNode, targetNode, connectionType)) {
            toast.error('Invalid connection for this relationship type');
            return;
        }

        try {
            // Create edge via API
            const response = await hierarchyService.createEdge(viewId, {
                source: params.source,
                target: params.target,
                type: connectionType,
                data: {
                    label: getEdgeLabel(connectionType),
                }
            });

            // Add edge to local state with proper styling
            const newEdge = {
                ...response.data,
                style: getEdgeStyle(connectionType),
                markerEnd: getEdgeMarker(connectionType),
            };

            setEdges((eds) => [...eds, newEdge]);
            toast.success(`${connectionType} relationship created`);
        } catch (error) {
            toast.error('Failed to create relationship');
            console.error(error);
        }
    }, [isAdmin, nodes, connectionType, viewId, setEdges]);

    // Handle edge deletion
    const onEdgesDelete = useCallback((deletedEdges) => {
        if (!isAdmin) {
            toast.warning('Only administrators can delete connections');
            return;
        }

        deletedEdges.forEach(edge => {
            toast.info(`Removed ${edge.type || 'command'} relationship`);
        });
    }, [isAdmin]);

    // Handle edge type change
    const handleChangeEdgeType = useCallback(async (edgeId, newType) => {
        try {
            await hierarchyService.updateEdge(viewId, edgeId, {
                type: newType
            });

            setEdges((edges) =>
                edges.map((edge) =>
                    edge.id === edgeId
                        ? {
                            ...edge,
                            type: newType,
                            style: getEdgeStyle(newType, edge.selected),
                            markerEnd: getEdgeMarker(newType, edge.selected),
                            data: {
                                ...edge.data,
                                label: getEdgeLabel(newType, edge.data?.customLabel),
                            },
                        }
                        : edge
                )
            );
            toast.success(`Changed relationship type to ${newType}`);
        } catch (error) {
            toast.error('Failed to update relationship type');
            console.error(error);
        }
    }, [viewId, setEdges]);

    // Handle edge deletion from context menu
    const handleDeleteEdge = useCallback(async (edgeId) => {
        try {
            await hierarchyService.deleteEdge(viewId, edgeId);
            setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
            toast.success('Relationship deleted');
        } catch (error) {
            toast.error('Failed to delete relationship');
            console.error(error);
        }
    }, [viewId, setEdges]);

    // Handle edge edit
    const handleEditEdge = useCallback((edge) => {
        setEditingEdge(edge);
        setContextMenu(null);
    }, []);

    // Save edge changes
    const handleSaveEdgeChanges = useCallback(async (edgeId, updates) => {
        try {
            await hierarchyService.updateEdge(viewId, edgeId, {
                data: updates
            });

            setEdges((edges) =>
                edges.map((edge) =>
                    edge.id === edgeId
                        ? {
                            ...edge,
                            data: {
                                ...edge.data,
                                ...updates,
                            },
                            // Update visual properties based on priority
                            style: {
                                ...getEdgeStyle(edge.type, edge.selected),
                                strokeWidth: updates.priority === 'high' ? 3 : 2,
                            },
                            className: updates.priority === 'high' ? 'edge-priority-high' : '',
                        }
                        : edge
                )
            );
            toast.success('Relationship updated');
            setEditingEdge(null);
        } catch (error) {
            toast.error('Failed to update relationship');
            console.error(error);
        }
    }, [viewId, setEdges]);

    // Connection type selector panel for admins
    const ConnectionTypePanel = () => {
        if (!isAdmin) return null;

        const connectionTypes = [
            { value: 'command', label: 'Command', color: '#4a5d23' },
            { value: 'support', label: 'Support', color: '#3b82f6' },
            { value: 'coordination', label: 'Coordination', color: '#f59e0b' },
        ];

        return (
            <Panel position="top-left" className="connection-type-panel">
                <div style={{
                    background: '#0d0d0d',
                    border: '1px solid #2d2d2d',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    display: 'flex',
                    gap: '0.5rem',
                }}>
          <span style={{
              fontSize: '0.875rem',
              color: '#999',
              alignSelf: 'center',
              marginRight: '0.5rem',
          }}>
            Connection Type:
          </span>
                    {connectionTypes.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setConnectionType(type.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: connectionType === type.value ? type.color : '#1a1a1a',
                                color: connectionType === type.value ? '#fff' : '#999',
                                border: `1px solid ${connectionType === type.value ? type.color : '#2d2d2d'}`,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </Panel>
        );
    };

    if (loading) {
        return (
            <div className="hierarchy-loading">
                <div className="spinner"></div>
                <p>Loading hierarchy...</p>
            </div>
        );
    }

    return (
        <div className="unit-hierarchy-container">
            {/* Include custom edge markers */}
            <EdgeMarkers />

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={onEdgeClick}
                onEdgeContextMenu={onEdgeContextMenu}
                onEdgesDelete={onEdgesDelete}

                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                attributionPosition="bottom-left"
                deleteKeyCode={isAdmin ? 'Delete' : null}
                multiSelectionKeyCode={isAdmin ? 'Control' : null}
                connectionLineType="smoothstep"
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                }}
            >
                <Background
                    variant="dots"
                    gap={16}
                    size={1}
                    color="#2d2d2d"
                />

                <MiniMap
                    nodeColor={(node) => node.data.branch_color || '#4a5d23'}
                    style={{
                        height: 120,
                        backgroundColor: '#0d0d0d',
                        border: '1px solid #2d2d2d'
                    }}
                    zoomable
                    pannable
                />

                <Controls />

                {/* Connection type selector for admins */}
                <ConnectionTypePanel />

                {/* Save indicator */}
                {isAdmin && (
                    <Panel position="top-right" className="save-indicator">
                        {isSaving && (
                            <div className="saving-status">
                                <div className="spinner-small"></div>
                                <span>Saving...</span>
                            </div>
                        )}
                    </Panel>
                )}

                {/* Legend Panel */}
                <Panel position="bottom-left" className="edge-legend">
                    <div style={{
                        background: '#0d0d0d',
                        border: '1px solid #2d2d2d',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        fontSize: '0.75rem',
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ffd700' }}>
                            Relationship Types:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 30, height: 2, background: '#4a5d23' }}></div>
                                <span>Command</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: 30,
                                    height: 2,
                                    background: '#3b82f6',
                                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, #0d0d0d 8px, #0d0d0d 12px)',
                                }}></div>
                                <span>Support</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: 30,
                                    height: 2,
                                    background: '#f59e0b',
                                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 12px, #0d0d0d 12px, #0d0d0d 18px)',
                                }}></div>
                                <span>Coordination</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Context Menu */}
            {contextMenu && (
                <EdgeContextMenu
                    edge={contextMenu.edge}
                    position={contextMenu.position}
                    onClose={() => setContextMenu(null)}
                    onEdit={handleEditEdge}
                    onDelete={handleDeleteEdge}
                    onChangeType={handleChangeEdgeType}
                    isAdmin={isAdmin}
                />
            )}

            {/* Edit Modal */}
            {editingEdge && (
                <EdgeEditModal
                    edge={editingEdge}
                    onClose={() => setEditingEdge(null)}
                    onSave={handleSaveEdgeChanges}
                />
            )}
        </div>
    );
};

export default UnitHierarchyFlow;

