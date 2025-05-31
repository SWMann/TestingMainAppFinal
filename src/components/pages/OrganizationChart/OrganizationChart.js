import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Users, Shield, Plus, Edit, Trash2, Eye, Save, Settings,
    Filter, Search, Download, Upload, Maximize, Grid,
    ChevronDown, AlertTriangle, CheckCircle, X
} from 'lucide-react';
import api from '../../../services/api';
import UnitNode from './UnitNode';
import CreateViewModal from './CreateViewModal';
import EditViewModal from './EditViewModal';
import FilterPanel from './FilterPanel';
import './OrganizationChart.css';

const nodeTypes = {
    unitNode: UnitNode,
};

const OrganizationChart = () => {
    const { user } = useSelector(state => state.auth);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // State management
    const [chartViews, setChartViews] = useState([]);
    const [currentView, setCurrentView] = useState(null);
    const [units, setUnits] = useState([]);
    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Filter states
    const [activeFilters, setActiveFilters] = useState({
        branches: [],
        unitTypes: [],
        showInactive: false
    });

    // Check if user can edit
    const canEdit = user?.is_admin || user?.is_staff;

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch all required data
            const [viewsRes, unitsRes, branchesRes] = await Promise.all([
                api.get('/org-charts/'),
                api.get('/units/'),
                api.get('/branches/')
            ]);

            const viewsData = viewsRes.data.results || viewsRes.data || [];
            const unitsData = unitsRes.data.results || unitsRes.data || [];
            const branchesData = branchesRes.data.results || branchesRes.data || [];

            setChartViews(viewsData);
            setUnits(unitsData);
            setBranches(branchesData);

            // Set default view or first available view
            const defaultView = viewsData.find(v => v.is_default) || viewsData[0];
            if (defaultView) {
                await loadChartView(defaultView.id);
            } else if (unitsData.length > 0) {
                // Create initial view from units if no views exist
                createInitialView(unitsData);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load organization chart data');
        } finally {
            setIsLoading(false);
        }
    };

    const loadChartView = async (viewId) => {
        try {
            const response = await api.get(`/org-charts/${viewId}/`);
            const view = response.data;

            setCurrentView(view);

            // Convert nodes and edges from backend format to React Flow format
            const flowNodes = convertNodesToFlow(view.nodes || []);
            const flowEdges = convertEdgesToFlow(view.edges || []);

            setNodes(flowNodes);
            setEdges(flowEdges);
            setHasUnsavedChanges(false);

        } catch (err) {
            console.error('Error loading chart view:', err);
            setError('Failed to load chart view');
        }
    };

    const convertNodesToFlow = (backendNodes) => {
        return backendNodes.map(node => ({
            id: node.unit.id,
            type: 'unitNode',
            position: { x: node.x_position, y: node.y_position },
            data: {
                unit: node.unit,
                showMemberCount: node.show_member_count,
                showCommander: node.show_commander,
                expanded: node.expanded,
                style: node.style_overrides || {}
            },
            style: {
                width: node.width,
                height: node.height,
                ...node.style_overrides
            }
        }));
    };

    const convertEdgesToFlow = (backendEdges) => {
        return backendEdges.map(edge => ({
            id: `${edge.source_unit.id}-${edge.target_unit.id}`,
            source: edge.source_unit.id,
            target: edge.target_unit.id,
            type: edge.edge_type || 'smoothstep',
            label: edge.label,
            style: edge.style_overrides || {},
            animated: false,
            data: {
                originalEdge: edge
            }
        }));
    };

    const createInitialView = (unitsData) => {
        // Create a hierarchical layout from units
        const hierarchyMap = new Map();
        const rootUnits = [];

        // Build hierarchy map
        unitsData.forEach(unit => {
            if (!unit.parent_unit_id) {
                rootUnits.push(unit);
            }
            if (!hierarchyMap.has(unit.parent_unit_id)) {
                hierarchyMap.set(unit.parent_unit_id, []);
            }
            if (unit.parent_unit_id) {
                hierarchyMap.get(unit.parent_unit_id).push(unit);
            }
        });

        // Generate positions using hierarchical layout
        const { nodes: layoutNodes, edges: layoutEdges } = generateHierarchicalLayout(rootUnits, hierarchyMap);

        setNodes(layoutNodes);
        setEdges(layoutEdges);
    };

    const generateHierarchicalLayout = (rootUnits, hierarchyMap, startY = 0) => {
        const nodes = [];
        const edges = [];
        const nodeWidth = 200;
        const nodeHeight = 120;
        const horizontalSpacing = 250;
        const verticalSpacing = 150;

        let currentX = 0;
        let maxY = startY;

        const processUnit = (unit, x, y, level = 0) => {
            // Create node
            nodes.push({
                id: unit.id,
                type: 'unitNode',
                position: { x, y },
                data: {
                    unit,
                    showMemberCount: true,
                    showCommander: true,
                    expanded: true,
                    style: {}
                },
                style: {
                    width: nodeWidth,
                    height: nodeHeight
                }
            });

            // Process children
            const children = hierarchyMap.get(unit.id) || [];
            let childX = x - (children.length - 1) * horizontalSpacing / 2;
            const childY = y + verticalSpacing;

            children.forEach((child, index) => {
                // Create edge from parent to child
                edges.push({
                    id: `${unit.id}-${child.id}`,
                    source: unit.id,
                    target: child.id,
                    type: 'smoothstep',
                    animated: false
                });

                // Process child recursively
                processUnit(child, childX, childY, level + 1);
                childX += horizontalSpacing;
                maxY = Math.max(maxY, childY);
            });
        };

        // Process root units
        rootUnits.forEach((unit, index) => {
            processUnit(unit, currentX, startY);
            currentX += horizontalSpacing * 2;
        });

        return { nodes, edges };
    };

    // Handle node changes
    const onNodeDragStop = useCallback((event, node) => {
        if (isEditMode) {
            setHasUnsavedChanges(true);
        }
    }, [isEditMode]);

    const onConnect = useCallback((connection) => {
        if (isEditMode) {
            setEdges((eds) => addEdge({ ...connection, type: 'smoothstep' }, eds));
            setHasUnsavedChanges(true);
        }
    }, [isEditMode, setEdges]);

    // Save changes
    const saveChanges = async () => {
        if (!currentView || !canEdit) return;

        try {
            // Convert React Flow format back to backend format
            const backendNodes = nodes.map(node => ({
                unit_id: node.id,
                x_position: node.position.x,
                y_position: node.position.y,
                width: node.style?.width || 200,
                height: node.style?.height || 120,
                show_member_count: node.data.showMemberCount,
                show_commander: node.data.showCommander,
                expanded: node.data.expanded,
                style_overrides: node.data.style || {}
            }));

            const backendEdges = edges.map(edge => ({
                source_unit_id: edge.source,
                target_unit_id: edge.target,
                edge_type: edge.type || 'smoothstep',
                label: edge.label || '',
                style_overrides: edge.style || {}
            }));

            const updateData = {
                nodes: backendNodes,
                edges: backendEdges,
                layout_data: {
                    viewport: { x: 0, y: 0, zoom: 1 }
                }
            };

            await api.put(`/org-charts/${currentView.id}/`, updateData);
            setHasUnsavedChanges(false);
            setError(null);

        } catch (err) {
            console.error('Error saving changes:', err);
            setError('Failed to save changes');
        }
    };

    // Filter units based on active filters
    const filteredNodes = useMemo(() => {
        if (!activeFilters.branches.length && !activeFilters.unitTypes.length && activeFilters.showInactive) {
            return nodes;
        }

        return nodes.filter(node => {
            const unit = node.data.unit;

            // Branch filter
            if (activeFilters.branches.length > 0) {
                if (!activeFilters.branches.includes(unit.branch?.id)) {
                    return false;
                }
            }

            // Unit type filter
            if (activeFilters.unitTypes.length > 0) {
                if (!activeFilters.unitTypes.includes(unit.unit_type)) {
                    return false;
                }
            }

            // Active status filter
            if (!activeFilters.showInactive && !unit.is_active) {
                return false;
            }

            return true;
        });
    }, [nodes, activeFilters]);

    // Auto-layout function
    const autoLayout = () => {
        if (!isEditMode) return;

        const { nodes: layoutNodes } = generateHierarchicalLayout(
            units.filter(u => !u.parent_unit_id),
            units.reduce((map, unit) => {
                if (!map.has(unit.parent_unit_id)) {
                    map.set(unit.parent_unit_id, []);
                }
                if (unit.parent_unit_id) {
                    map.get(unit.parent_unit_id).push(unit);
                }
                return map;
            }, new Map())
        );

        // Update positions while preserving existing data
        setNodes(current => current.map(node => {
            const layoutNode = layoutNodes.find(n => n.id === node.id);
            return layoutNode ? { ...node, position: layoutNode.position } : node;
        }));

        setHasUnsavedChanges(true);
    };

    if (isLoading) {
        return (
            <div className="org-chart-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading organization chart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="org-chart-container">
            {/* Header */}
            <div className="org-chart-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <Grid size={24} />
                        Organization Chart
                    </h1>

                    {/* View Selector */}
                    <div className="view-selector">
                        <select
                            value={currentView?.id || ''}
                            onChange={(e) => loadChartView(e.target.value)}
                            className="view-select"
                        >
                            <option value="">Select a view...</option>
                            {chartViews.map(view => (
                                <option key={view.id} value={view.id}>
                                    {view.name} {view.is_default && '(Default)'}
                                </option>
                            ))}
                        </select>

                        {canEdit && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn btn-primary btn-sm"
                                title="Create new view"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="header-right">
                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className={`btn btn-secondary ${showFilterPanel ? 'active' : ''}`}
                    >
                        <Filter size={16} />
                        Filters
                    </button>

                    {/* Edit Mode Toggle */}
                    {canEdit && (
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`btn ${isEditMode ? 'btn-warning' : 'btn-secondary'}`}
                        >
                            <Edit size={16} />
                            {isEditMode ? 'Exit Edit' : 'Edit Mode'}
                        </button>
                    )}

                    {/* Save Changes */}
                    {isEditMode && hasUnsavedChanges && (
                        <button
                            onClick={saveChanges}
                            className="btn btn-success"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    )}

                    {/* View Actions */}
                    {currentView && canEdit && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="btn btn-secondary"
                            title="Edit view settings"
                        >
                            <Settings size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-banner">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Unsaved Changes Warning */}
            {hasUnsavedChanges && (
                <div className="warning-banner">
                    <AlertTriangle size={20} />
                    <span>You have unsaved changes</span>
                    <button onClick={saveChanges} className="btn btn-sm btn-success">
                        <Save size={14} />
                        Save Now
                    </button>
                </div>
            )}

            {/* Main Chart Area */}
            <div className="chart-main">
                {/* Filter Panel */}
                {showFilterPanel && (
                    <FilterPanel
                        branches={branches}
                        unitTypes={[...new Set(units.map(u => u.unit_type).filter(Boolean))]}
                        activeFilters={activeFilters}
                        onFiltersChange={setActiveFilters}
                        onClose={() => setShowFilterPanel(false)}
                    />
                )}

                {/* React Flow Chart */}
                <div className="flow-container">
                    <ReactFlow
                        nodes={filteredNodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeDragStop={onNodeDragStop}
                        nodeTypes={nodeTypes}
                        connectionMode="loose"
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        nodesDraggable={isEditMode}
                        nodesConnectable={isEditMode}
                        elementsSelectable={isEditMode}
                    >
                        <Background variant="dots" gap={20} size={1} />
                        <MiniMap
                            nodeStrokeColor="#4FCBF8"
                            nodeColor="#0A1929"
                            nodeBorderRadius={8}
                            maskColor="rgba(12, 28, 44, 0.8)"
                        />
                        <Controls />

                        {/* Custom Panel */}
                        <Panel position="top-left">
                            <div className="chart-info-panel">
                                <h3>{currentView?.name || 'Organization Chart'}</h3>
                                {currentView?.description && (
                                    <p>{currentView.description}</p>
                                )}
                                <div className="stats">
                                    <span>{filteredNodes.length} units shown</span>
                                    {isEditMode && <span className="edit-indicator">Edit Mode</span>}
                                </div>
                            </div>
                        </Panel>

                        {/* Edit Mode Panel */}
                        {isEditMode && (
                            <Panel position="bottom-left">
                                <div className="edit-tools-panel">
                                    <h4>Edit Tools</h4>
                                    <div className="tool-buttons">
                                        <button
                                            onClick={autoLayout}
                                            className="btn btn-sm btn-secondary"
                                            title="Auto-arrange layout"
                                        >
                                            <Grid size={14} />
                                            Auto Layout
                                        </button>
                                    </div>
                                    <div className="edit-help">
                                        <p>• Drag nodes to reposition</p>
                                        <p>• Connect nodes by dragging from node handles</p>
                                        <p>• Click background to deselect</p>
                                    </div>
                                </div>
                            </Panel>
                        )}
                    </ReactFlow>
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateViewModal
                    branches={branches}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(newView) => {
                        setChartViews([...chartViews, newView]);
                        setShowCreateModal(false);
                        loadChartView(newView.id);
                    }}
                />
            )}

            {showEditModal && currentView && (
                <EditViewModal
                    view={currentView}
                    branches={branches}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={(updatedView) => {
                        setCurrentView(updatedView);
                        setChartViews(chartViews.map(v => v.id === updatedView.id ? updatedView : v));
                        setShowEditModal(false);
                    }}
                    onDelete={() => {
                        setChartViews(chartViews.filter(v => v.id !== currentView.id));
                        setCurrentView(null);
                        setNodes([]);
                        setEdges([]);
                        setShowEditModal(false);
                    }}
                />
            )}
        </div>
    );
};

// Wrap in ReactFlowProvider
const OrganizationChartWrapper = () => (
    <ReactFlowProvider>
        <OrganizationChart />
    </ReactFlowProvider>
);

export default OrganizationChartWrapper;