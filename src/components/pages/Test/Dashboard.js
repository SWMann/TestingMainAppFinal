import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ConnectionMode,
    Panel,
    ReactFlowProvider,
    useReactFlow,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Shield, Users, ChevronRight, Edit2, Plus, Save, Eye, Settings,
    Maximize2, Download, Upload, Layout, User, Star, Clock, X,
    ChevronUp, AlertCircle, Check, Loader2, Building2
} from 'lucide-react';
import api from "../../../services/api";

// Custom Node Component
const UnitNode = ({ data, selected }) => {
    const [showPositions, setShowPositions] = useState(false);

    return (
        <div
            className={`unit-node ${selected ? 'selected' : ''} ${data.is_vacant ? 'vacant' : ''}`}
            style={{
                borderColor: data.branch_color || '#666',
                backgroundColor: selected ? `${data.branch_color}10` : 'white'
            }}
        >
            <div className="unit-header">
                <div className="unit-icon">
                    {data.emblem_url ? (
                        <img src={data.emblem_url} alt={data.abbreviation} />
                    ) : (
                        <Shield size={24} color={data.branch_color || '#666'} />
                    )}
                </div>
                <div className="unit-info">
                    <h4>{data.abbreviation || data.name}</h4>
                    <span className="unit-type">{data.unit_type}</span>
                </div>
                {data.is_admin && (
                    <button
                        className="edit-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onEdit(data);
                        }}
                    >
                        <Edit2 size={14} />
                    </button>
                )}
            </div>

            <div className="unit-details">
                <div className="detail-row">
                    <Users size={14} />
                    <span>{data.personnel_count || 0} personnel</span>
                </div>
                {data.commander && (
                    <div className="detail-row">
                        <Star size={14} />
                        <span>{data.commander.rank} {data.commander.username}</span>
                    </div>
                )}
            </div>

            {data.positions && data.positions.length > 0 && (
                <div className="unit-positions">
                    <button
                        className="positions-toggle"
                        onClick={() => setShowPositions(!showPositions)}
                    >
                        <ChevronRight
                            size={14}
                            style={{ transform: showPositions ? 'rotate(90deg)' : 'none' }}
                        />
                        Positions ({data.positions.length})
                    </button>

                    {showPositions && (
                        <div className="positions-list">
                            {data.positions.map(pos => (
                                <div
                                    key={pos.id}
                                    className={`position-item ${pos.is_vacant ? 'vacant' : ''}`}
                                >
                                    <span className="position-title">{pos.display_title}</span>
                                    {pos.is_command_position && <Star size={12} />}
                                    {pos.is_vacant && <AlertCircle size={12} />}
                                    {data.is_admin && (
                                        <button
                                            className="position-edit-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                data.onEditPosition(pos);
                                            }}
                                        >
                                            <Edit2 size={10} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Edit Dialog Component for Units
const EditUnitDialog = ({ unit, onClose, onSave }) => {
    const [formData, setFormData] = useState(unit || {});
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [parentUnits, setParentUnits] = useState([]);

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const [branchesRes, unitsRes] = await Promise.all([
                api.get('/units/branches/'),
                api.get('/units/')
            ]);
            setBranches(branchesRes.data.results || branchesRes.data || []);
            setParentUnits(unitsRes.data.results || unitsRes.data || []);
        } catch (error) {
            console.error('Error fetching form data:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.abbreviation) return;
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving unit:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>Edit Unit</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="dialog-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Abbreviation</label>
                        <input
                            type="text"
                            value={formData.abbreviation || ''}
                            onChange={e => setFormData({...formData, abbreviation: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Branch</label>
                        <select
                            value={formData.branch || ''}
                            onChange={e => setFormData({...formData, branch: e.target.value})}
                        >
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Parent Unit</label>
                        <select
                            value={formData.parent_unit || ''}
                            onChange={e => setFormData({...formData, parent_unit: e.target.value || null})}
                        >
                            <option value="">None (Top Level)</option>
                            {parentUnits.filter(u => u.id !== formData.id).map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Unit Type</label>
                        <select
                            value={formData.unit_type || ''}
                            onChange={e => setFormData({...formData, unit_type: e.target.value})}
                        >
                            <option value="">Select Type</option>
                            <option value="Corps">Corps</option>
                            <option value="Division">Division</option>
                            <option value="Brigade">Brigade</option>
                            <option value="Battalion">Battalion</option>
                            <option value="Company">Company</option>
                            <option value="Platoon">Platoon</option>
                            <option value="Squad">Squad</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            value={formData.location || ''}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder="e.g., Fort Hood, TX"
                        />
                    </div>

                    <div className="form-group">
                        <label>Motto</label>
                        <input
                            type="text"
                            value={formData.motto || ''}
                            onChange={e => setFormData({...formData, motto: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={3}
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.is_active !== false}
                                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                            />
                            Active Unit
                        </label>
                    </div>

                    <div className="dialog-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !formData.name || !formData.abbreviation}
                            className="btn-primary"
                        >
                            {loading ? <Loader2 className="spin" size={16} /> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Edit Dialog Component for Positions
const EditPositionDialog = ({ position, onClose, onSave }) => {
    const [formData, setFormData] = useState(position || {});
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAssignUser = async (userId) => {
        setLoading(true);
        try {
            await api.post(`/units/positions/${position.id}/assign/`, {
                user_id: userId,
                assignment_type: 'primary',
                status: 'active'
            });
            onClose();
            onSave(); // Trigger refresh
        } catch (error) {
            console.error('Error assigning user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVacatePosition = async () => {
        if (!window.confirm('Are you sure you want to vacate this position?')) return;

        setLoading(true);
        try {
            await api.post(`/units/positions/${position.id}/vacate/`);
            onClose();
            onSave(); // Trigger refresh
        } catch (error) {
            console.error('Error vacating position:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>Edit Position: {position.display_title}</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="dialog-form">
                    <div className="position-info">
                        <div className="info-row">
                            <strong>Status:</strong>
                            <span className={position.is_vacant ? 'vacant-status' : 'filled-status'}>
                {position.is_vacant ? 'Vacant' : 'Filled'}
              </span>
                        </div>

                        {position.current_holder && (
                            <div className="info-row">
                                <strong>Current Holder:</strong>
                                <span>{position.current_holder.rank} {position.current_holder.username}</span>
                            </div>
                        )}

                        <div className="info-row">
                            <strong>Type:</strong>
                            <span>{position.role_category}</span>
                        </div>
                    </div>

                    {position.is_vacant ? (
                        <div className="form-group">
                            <label>Assign User</label>
                            <select
                                onChange={e => e.target.value && handleAssignUser(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">Select a user...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.current_rank?.abbreviation || ''} {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="position-actions">
                            <button
                                type="button"
                                onClick={handleVacatePosition}
                                disabled={loading}
                                className="btn-danger"
                            >
                                {loading ? <Loader2 className="spin" size={16} /> : 'Vacate Position'}
                            </button>
                        </div>
                    )}

                    <div className="dialog-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// View Management Dialog
const ViewManagementDialog = ({ views, currentView, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        view_type: 'custom',
        is_public: true,
        show_vacant_positions: true,
        show_personnel_count: true
    });
    const [loading, setLoading] = useState(false);
    const [editingView, setEditingView] = useState(null);

    const handleSubmit = async () => {
        if (!formData.name) return;
        setLoading(true);
        try {
            if (editingView) {
                await api.put(`/units/hierarchy/${editingView.id}/`, formData);
            } else {
                await api.post('/units/hierarchy/', formData);
            }
            onSave();
            setFormData({
                name: '',
                description: '',
                view_type: 'custom',
                is_public: true,
                show_vacant_positions: true,
                show_personnel_count: true
            });
            setEditingView(null);
        } catch (error) {
            console.error('Error saving view:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (viewId) => {
        if (!window.confirm('Are you sure you want to delete this view?')) return;

        try {
            await api.delete(`/units/hierarchy/${viewId}/`);
            onDelete();
        } catch (error) {
            console.error('Error deleting view:', error);
        }
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog wide-dialog" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>Manage Hierarchy Views</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="dialog-content">
                    <div className="views-list">
                        <h4>Existing Views</h4>
                        {views.map(view => (
                            <div key={view.id} className={`view-item ${view.id === currentView?.id ? 'current' : ''}`}>
                                <div className="view-info">
                                    <span className="view-name">{view.name}</span>
                                    <span className="view-type">{view.view_type}</span>
                                    {view.is_default && <span className="default-badge">Default</span>}
                                </div>
                                <div className="view-actions">
                                    <button onClick={() => {
                                        setEditingView(view);
                                        setFormData(view);
                                    }}>
                                        <Edit2 size={14} />
                                    </button>
                                    {!view.is_default && (
                                        <button onClick={() => handleDelete(view.id)} className="delete-btn">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="view-form">
                        <h4>{editingView ? 'Edit View' : 'Create New View'}</h4>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label>View Type</label>
                            <select
                                value={formData.view_type || 'custom'}
                                onChange={e => setFormData({...formData, view_type: e.target.value})}
                            >
                                <option value="full">Full Organization</option>
                                <option value="branch">Branch Specific</option>
                                <option value="custom">Custom View</option>
                                <option value="operational">Operational Structure</option>
                                <option value="administrative">Administrative Structure</option>
                            </select>
                        </div>

                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_public !== false}
                                    onChange={e => setFormData({...formData, is_public: e.target.checked})}
                                />
                                Public View
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.show_vacant_positions !== false}
                                    onChange={e => setFormData({...formData, show_vacant_positions: e.target.checked})}
                                />
                                Show Vacant Positions
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.show_personnel_count !== false}
                                    onChange={e => setFormData({...formData, show_personnel_count: e.target.checked})}
                                />
                                Show Personnel Count
                            </label>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !formData.name}
                                className="btn-primary"
                            >
                                {loading ? <Loader2 className="spin" size={16} /> : (editingView ? 'Update View' : 'Create View')}
                            </button>
                            {editingView && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingView(null);
                                        setFormData({
                                            name: '',
                                            description: '',
                                            view_type: 'custom',
                                            is_public: true,
                                            show_vacant_positions: true,
                                            show_personnel_count: true
                                        });
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Hierarchy Editor Component
const UnitHierarchyEditor = ({ user }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedView, setSelectedView] = useState(null);
    const [views, setViews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [editingPosition, setEditingPosition] = useState(null);
    const [showViewManager, setShowViewManager] = useState(false);

    const { fitView } = useReactFlow();
    const isAdmin = user?.is_admin || false;

    // Custom node types
    const nodeTypes = useMemo(() => ({
        unit: UnitNode,
    }), []);

    // Load hierarchy views
    useEffect(() => {
        loadViews();
    }, []);

    const loadViews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/units/hierarchy/');
            const viewsList = response.data.results || response.data || [];
            setViews(viewsList);

            // Load default view
            const defaultResponse = await api.get('/units/hierarchy/default/');
            if (defaultResponse.data) {
                setSelectedView(defaultResponse.data);
                await loadHierarchyData(defaultResponse.data.id);
            }
        } catch (error) {
            console.error('Error loading views:', error);
            // If no default view exists, try to load the first available view
            if (views.length > 0) {
                setSelectedView(views[0]);
                await loadHierarchyData(views[0].id);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadHierarchyData = async (viewId) => {
        setLoading(true);
        try {
            const response = await api.get(`/units/hierarchy/${viewId}/data/`);
            const data = response.data;

            // Convert to ReactFlow format
            const flowNodes = data.nodes.map(node => ({
                id: node.id.toString(),
                type: 'unit',
                position: data.node_positions?.[node.id] || { x: Math.random() * 500, y: Math.random() * 500 },
                data: {
                    ...node,
                    is_admin: isAdmin,
                    onEdit: handleEditUnit,
                    onEditPosition: handleEditPosition
                }
            }));

            const flowEdges = data.edges.map(edge => ({
                ...edge,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { strokeWidth: 2 }
            }));

            setNodes(flowNodes);
            setEdges(flowEdges);

            setTimeout(() => fitView({ padding: 0.2 }), 100);
        } catch (error) {
            console.error('Error loading hierarchy data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewChange = async (viewId) => {
        const view = views.find(v => v.id === parseInt(viewId));
        setSelectedView(view);
        await loadHierarchyData(viewId);
    };

    const handleSavePositions = async () => {
        if (!isAdmin || !selectedView) return;

        setSaving(true);
        try {
            const positions = {};
            nodes.forEach(node => {
                positions[node.id] = node.position;
            });

            await api.post(`/units/hierarchy/${selectedView.id}/save_positions/`, {
                positions
            });

            // Show success message (you might want to add a toast notification here)
            console.log('Positions saved successfully');
        } catch (error) {
            console.error('Error saving positions:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEditUnit = (unitData) => {
        setEditingUnit(unitData);
    };

    const handleEditPosition = (positionData) => {
        setEditingPosition(positionData);
    };

    const handleSaveUnit = async (unitData) => {
        try {
            await api.put(`/units/${unitData.id}/`, unitData);
            // Reload hierarchy
            await loadHierarchyData(selectedView.id);
        } catch (error) {
            console.error('Error saving unit:', error);
            throw error;
        }
    };

    const handleRefresh = async () => {
        if (selectedView) {
            await loadHierarchyData(selectedView.id);
        }
    };

    const onConnect = useCallback((params) => {
        if (!isAdmin) return;
        setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    }, [isAdmin, setEdges]);

    const handleAutoLayout = () => {
        // Simple auto-layout algorithm
        const layoutNodes = [...nodes];
        const nodeMap = new Map(layoutNodes.map(n => [n.id, n]));
        const levels = new Map();

        // Find root nodes (no parent)
        const roots = layoutNodes.filter(n => !edges.find(e => e.target === n.id));

        // BFS to assign levels
        const queue = roots.map(r => ({ node: r, level: 0 }));
        const visited = new Set();

        while (queue.length > 0) {
            const { node, level } = queue.shift();

            if (visited.has(node.id)) continue;
            visited.add(node.id);

            if (!levels.has(level)) levels.set(level, []);
            levels.get(level).push(node);

            // Find children
            const childEdges = edges.filter(e => e.source === node.id);
            childEdges.forEach(edge => {
                const child = nodeMap.get(edge.target);
                if (child && !visited.has(child.id)) {
                    queue.push({ node: child, level: level + 1 });
                }
            });
        }

        // Position nodes
        const ySpacing = 150;
        const xSpacing = 250;

        levels.forEach((levelNodes, level) => {
            const totalWidth = (levelNodes.length - 1) * xSpacing;
            const startX = 400 - totalWidth / 2;

            levelNodes.forEach((node, index) => {
                node.position = {
                    x: startX + index * xSpacing,
                    y: 50 + level * ySpacing
                };
            });
        });

        setNodes(layoutNodes);
        setTimeout(() => fitView({ padding: 0.2 }), 100);
    };

    const handleAddUnit = async () => {
        const newUnit = {
            name: 'New Unit',
            abbreviation: 'NEW',
            unit_type: 'Company',
            is_active: true
        };
        setEditingUnit(newUnit);
    };

    if (loading && nodes.length === 0) {
        return (
            <div className="hierarchy-loading">
                <Loader2 className="spin" size={48} />
                <p>Loading hierarchy...</p>
            </div>
        );
    }

    return (
        <div className="hierarchy-editor">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
            >
                <Background variant="dots" gap={12} size={1} />
                <MiniMap
                    style={{
                        height: 100,
                        width: 150,
                    }}
                    zoomable
                    pannable
                />
                <Controls />

                {/* Top Panel - View Selector */}
                <Panel position="top-left">
                    <div className="control-panel">
                        <div className="view-selector">
                            <Eye size={16} />
                            <select
                                value={selectedView?.id || ''}
                                onChange={(e) => handleViewChange(e.target.value)}
                            >
                                {views.map(view => (
                                    <option key={view.id} value={view.id}>
                                        {view.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isAdmin && (
                            <>
                                <button
                                    className="control-btn"
                                    onClick={() => setShowViewManager(true)}
                                    title="Manage Views"
                                >
                                    <Settings size={16} />
                                </button>

                                <button
                                    className="control-btn"
                                    onClick={handleAddUnit}
                                    title="Add Unit"
                                >
                                    <Plus size={16} />
                                </button>

                                <button
                                    className="control-btn"
                                    onClick={handleAutoLayout}
                                    title="Auto Layout"
                                >
                                    <Layout size={16} />
                                </button>

                                <button
                                    className={`control-btn ${saving ? 'saving' : ''}`}
                                    onClick={handleSavePositions}
                                    disabled={saving}
                                    title="Save Positions"
                                >
                                    {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                                </button>
                            </>
                        )}

                        <button
                            className="control-btn"
                            onClick={handleRefresh}
                            title="Refresh"
                        >
                            <Loader2 size={16} />
                        </button>

                        <button
                            className="control-btn"
                            onClick={() => fitView({ padding: 0.2 })}
                            title="Fit View"
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </Panel>

                {/* Right Panel - Legend */}
                <Panel position="top-right">
                    <div className="legend-panel">
                        <h4>Legend</h4>
                        <div className="legend-item">
                            <Building2 size={14} color="#4B5320" />
                            <span>Unit</span>
                        </div>
                        <div className="legend-item">
                            <Star size={14} color="#FFD700" />
                            <span>Command Position</span>
                        </div>
                        <div className="legend-item">
                            <AlertCircle size={14} color="#FF6B6B" />
                            <span>Vacant Position</span>
                        </div>
                        <div className="legend-item">
                            <Users size={14} color="#4ECDC4" />
                            <span>Personnel Count</span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Edit Dialogs */}
            {editingUnit && (
                <EditUnitDialog
                    unit={editingUnit}
                    onClose={() => setEditingUnit(null)}
                    onSave={handleSaveUnit}
                />
            )}

            {editingPosition && (
                <EditPositionDialog
                    position={editingPosition}
                    onClose={() => setEditingPosition(null)}
                    onSave={handleRefresh}
                />
            )}

            {showViewManager && isAdmin && (
                <ViewManagementDialog
                    views={views}
                    currentView={selectedView}
                    onClose={() => setShowViewManager(false)}
                    onSave={() => {
                        loadViews();
                        setShowViewManager(false);
                    }}
                    onDelete={() => {
                        loadViews();
                    }}
                />
            )}

            <style>{`
        .hierarchy-editor {
          width: 100%;
          height: 100vh;
          background: #f5f5f5;
        }
        
        .hierarchy-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 1rem;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Control Panel */
        .control-panel {
          display: flex;
          gap: 0.5rem;
          background: white;
          padding: 0.75rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .view-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-right: 0.5rem;
          border-right: 1px solid #e0e0e0;
          margin-right: 0.5rem;
        }
        
        .view-selector select {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 14px;
        }
        
        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .control-btn:hover {
          background: #f0f0f0;
        }
        
        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .control-btn.saving {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }
        
        /* Legend Panel */
        .legend-panel {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          min-width: 180px;
        }
        
        .legend-panel h4 {
          margin: 0 0 0.75rem 0;
          font-size: 14px;
          font-weight: 600;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 13px;
        }
        
        /* Unit Node Styles */
        .unit-node {
          background: white;
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 0.75rem;
          min-width: 200px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .unit-node:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .unit-node.selected {
          border-width: 3px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .unit-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          position: relative;
        }
        
        .unit-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .unit-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .unit-info {
          flex: 1;
        }
        
        .unit-info h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .unit-type {
          font-size: 12px;
          color: #666;
        }
        
        .edit-btn {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .unit-node:hover .edit-btn {
          opacity: 1;
        }
        
        .unit-details {
          font-size: 13px;
          color: #555;
        }
        
        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        
        .unit-positions {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e0e0e0;
        }
        
        .positions-toggle {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          color: #666;
          padding: 0;
          width: 100%;
          text-align: left;
        }
        
        .positions-toggle:hover {
          color: #333;
        }
        
        .positions-list {
          margin-top: 0.5rem;
          font-size: 12px;
        }
        
        .position-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.25rem 0.5rem;
          margin: 0.25rem 0;
          background: #f8f8f8;
          border-radius: 4px;
          position: relative;
        }
        
        .position-item:hover .position-edit-btn {
          opacity: 1;
        }
        
        .position-item.vacant {
          background: #FFF3E0;
          color: #E65100;
        }
        
        .position-title {
          flex: 1;
        }
        
        .position-edit-btn {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          margin-left: 0.5rem;
        }
        
        /* Dialog Styles */
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .dialog {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        .dialog.wide-dialog {
          max-width: 800px;
        }
        
        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .dialog-header h3 {
          margin: 0;
          font-size: 20px;
        }
        
        .dialog-header button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .dialog-header button:hover {
          background: #f0f0f0;
        }
        
        .dialog-form, .dialog-content {
          padding: 1.5rem;
        }
        
        .dialog-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 14px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .form-group textarea {
          resize: vertical;
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 14px;
          cursor: pointer;
        }
        
        .checkbox-group input[type="checkbox"] {
          width: auto;
          margin: 0;
        }
        
        .dialog-actions, .form-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding: 1.5rem;
          padding-top: 0;
        }
        
        .form-actions {
          padding: 0;
          margin-top: 1rem;
        }
        
        .btn-primary,
        .btn-secondary,
        .btn-danger {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn-primary {
          background: #4CAF50;
          color: white;
        }
        
        .btn-primary:hover {
          background: #45a049;
        }
        
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }
        
        .btn-secondary:hover {
          background: #e0e0e0;
        }
        
        .btn-danger {
          background: #f44336;
          color: white;
        }
        
        .btn-danger:hover {
          background: #d32f2f;
        }
        
        /* Position Info Styles */
        .position-info {
          background: #f8f8f8;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.25rem;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 14px;
        }
        
        .info-row:last-child {
          margin-bottom: 0;
        }
        
        .vacant-status {
          color: #E65100;
          font-weight: 500;
        }
        
        .filled-status {
          color: #4CAF50;
          font-weight: 500;
        }
        
        .position-actions {
          display: flex;
          justify-content: center;
          margin: 1.5rem 0;
        }
        
        /* View Management Styles */
        .views-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .views-list h4,
        .view-form h4 {
          margin: 0 0 1rem 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .view-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          transition: background 0.2s;
        }
        
        .view-item:hover {
          background: #f8f8f8;
        }
        
        .view-item.current {
          border-color: #4CAF50;
          background: #E8F5E9;
        }
        
        .view-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .view-name {
          font-weight: 500;
        }
        
        .view-type {
          font-size: 12px;
          color: #666;
          background: #f0f0f0;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
        }
        
        .default-badge {
          font-size: 11px;
          background: #FFD700;
          color: #333;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-weight: 500;
        }
        
        .view-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .view-actions button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .view-actions button:hover {
          background: #f0f0f0;
        }
        
        .view-actions .delete-btn:hover {
          background: #ffebee;
          border-color: #f44336;
          color: #f44336;
        }
      `}</style>
        </div>
    );
};

// Wrapper component with ReactFlowProvider
const UnitHierarchyEditorWrapper = (props) => {
    return (
        <ReactFlowProvider>
            <UnitHierarchyEditor {...props} />
        </ReactFlowProvider>
    );
};

export default UnitHierarchyEditorWrapper;