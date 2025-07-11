/**
 * Unit Organization Chart Component
 *
 * Prerequisites:
 * - User must be authenticated
 * - Requires API endpoints: /units/orbat/units_list/ and /units/orbat/unit_orbat/
 * - Install required dependencies: npm install reactflow dagre axios
 *
 * Usage:
 * import UnitOrganizationChart from './components/UnitOrganizationChart';
 * <UnitOrganizationChart />
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    ReactFlowProvider,
    Panel,
    ConnectionMode,
    MarkerType,
    Position
} from 'reactflow';
import dagre from 'dagre';
import axios from 'axios';
import 'reactflow/dist/style.css';

// Create API instance - update the baseURL to match your backend
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/anotherbackendagain-backend2/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add auth token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Custom Node Component
const UnitNode = ({ data }) => {
    const { unit, onNodeClick } = data;
    const isInactive = !unit.is_active;
    const branchColor = unit.branch_color || '#42c8f4';

    return (
        <div
            className={`unit-node ${isInactive ? 'inactive' : ''}`}
            onClick={() => onNodeClick(unit)}
            style={{
                borderColor: branchColor,
                boxShadow: isInactive ? 'none' : `0 0 10px ${branchColor}40`,
                opacity: isInactive ? 0.6 : 1
            }}
        >
            <div className="unit-header" style={{ borderBottomColor: branchColor }}>
                <h4>{unit.abbreviation}</h4>
                {unit.emblem_url && (
                    <img src={unit.emblem_url} alt={unit.name} className="unit-emblem" />
                )}
            </div>
            <div className="unit-body">
                <p className="unit-name">{unit.name}</p>
                <p className="unit-type">{unit.unit_type}</p>
                {unit.commander && unit.commander.username && (
                    <p className="unit-commander">
                        {unit.commander.rank} {unit.commander.username}
                    </p>
                )}
                <div className="unit-stats">
                    <span>Personnel: {unit.personnel_count || 0}</span>
                </div>
            </div>
            {isInactive && <div className="inactive-badge">INACTIVE</div>}
        </div>
    );
};

// Modal Component
const UnitModal = ({ unit, isOpen, onClose, positions }) => {
    if (!isOpen || !unit) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{unit.name}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Abbreviation:</label>
                            <span>{unit.abbreviation}</span>
                        </div>
                        <div className="info-item">
                            <label>Type:</label>
                            <span>{unit.unit_type}</span>
                        </div>
                        <div className="info-item">
                            <label>Branch:</label>
                            <span>{unit.branch_name}</span>
                        </div>
                        <div className="info-item">
                            <label>Status:</label>
                            <span className={unit.is_active ? 'active' : 'inactive'}>
                {unit.is_active ? 'Active' : 'Inactive'}
              </span>
                        </div>
                        {unit.motto && (
                            <div className="info-item full-width">
                                <label>Motto:</label>
                                <span>"{unit.motto}"</span>
                            </div>
                        )}
                        {unit.description && (
                            <div className="info-item full-width">
                                <label>Description:</label>
                                <p>{unit.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="positions-section">
                        <h3>Positions ({positions.length})</h3>
                        <div className="positions-list">
                            {positions.map(position => (
                                <div key={position.id} className="position-item">
                                    <span className="position-title">{position.display_title}</span>
                                    <span className={`position-status ${position.is_vacant ? 'vacant' : 'filled'}`}>
                    {position.is_vacant ? 'Vacant' : 'Filled'}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Position Panel Component
const PositionPanel = ({ unit, positions }) => {
    if (!unit) return null;

    const vacantPositions = positions.filter(p => p.is_vacant);
    const filledPositions = positions.filter(p => !p.is_vacant);

    return (
        <div className="position-panel">
            <div className="panel-header">
                <h3>{unit.name} - Positions</h3>
                <div className="position-stats">
                    <span className="filled">Filled: {filledPositions.length}</span>
                    <span className="vacant">Vacant: {vacantPositions.length}</span>
                    <span className="total">Total: {positions.length}</span>
                </div>
            </div>
            <div className="positions-container">
                <div className="position-group">
                    <h4>Filled Positions</h4>
                    {filledPositions.length > 0 ? (
                        filledPositions.map(position => (
                            <div key={position.id} className="position-card filled">
                                <div className="position-info">
                                    <h5>{position.display_title}</h5>
                                    <p className="role-category">{position.role_category}</p>
                                    {position.current_holder && (
                                        <p className="holder">
                                            {position.current_holder.rank?.abbreviation || ''} {position.current_holder.username}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-positions">No filled positions</p>
                    )}
                </div>
                <div className="position-group">
                    <h4>Vacant Positions</h4>
                    {vacantPositions.length > 0 ? (
                        vacantPositions.map(position => (
                            <div key={position.id} className="position-card vacant">
                                <div className="position-info">
                                    <h5>{position.display_title}</h5>
                                    <p className="role-category">{position.role_category}</p>
                                    <p className="vacancy-note">Position Available</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-positions">No vacant positions</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Component
// Note: This component requires authentication. Ensure the user is logged in before rendering.
const UnitOrganizationChart = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unitData, setUnitData] = useState({});
    const [error, setError] = useState(null);

    // Auto-layout function using dagre
    const getLayoutedElements = useCallback((nodes, edges, direction = 'TB') => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 150 });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: 200, height: 150 });
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
                    y: nodeWithPosition.y - 75,
                },
            };
        });

        return { nodes: layoutedNodes, edges };
    }, []);

    // Fetch ORBAT data
    const fetchORBATData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch actual units list from API
            const response = await api.get('/units/orbat/units_list/');
            const units = response.data;

            // Check if we have data
            if (!units || units.length === 0) {
                setError('No units found in the organization.');
                return;
            }

            // Create nodes
            const flowNodes = units.map(unit => ({
                id: unit.id,
                type: 'unitNode',
                data: {
                    unit: {
                        ...unit,
                        // Ensure branch_color exists, default to blue if not
                        branch_color: unit.branch_color || '#42c8f4'
                    },
                    onNodeClick: handleNodeClick
                },
                position: { x: 0, y: 0 }
            }));

            // Create edges based on parent_unit_id
            const flowEdges = units
                .filter(unit => unit.parent_unit_id)
                .map(unit => ({
                    id: `e${unit.parent_unit_id}-${unit.id}`,
                    source: unit.parent_unit_id,
                    target: unit.id,
                    type: 'smoothstep',
                    animated: false,
                    style: {
                        stroke: '#42c8f4',
                        strokeWidth: 2
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#42c8f4'
                    }
                }));

            // Store unit data for quick access
            const unitMap = {};
            units.forEach(unit => {
                unitMap[unit.id] = unit;
            });
            setUnitData(unitMap);

            // Apply auto-layout
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                flowNodes,
                flowEdges
            );

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        } catch (error) {
            console.error('Failed to fetch ORBAT data:', error);
            setError(`Failed to load organization chart: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }, [getLayoutedElements, setNodes, setEdges]);

    // Fetch positions for a unit
    const fetchUnitPositions = useCallback(async (unitId) => {
        try {
            // Fetch actual unit ORBAT data from API
            const response = await api.get(`/units/orbat/unit_orbat/?unit_id=${unitId}&include_subunits=false`);

            // Extract positions from the nodes data
            const positions = response.data.nodes
                .filter(node => node.position_type) // Filter to get position nodes
                .map(node => ({
                    id: node.id,
                    display_title: node.display_title,
                    role_category: node.role_info?.category || 'unknown',
                    is_vacant: node.is_vacant,
                    current_holder: node.current_holder
                }));

            setPositions(positions);
        } catch (error) {
            console.error('Failed to fetch positions:', error);
            setPositions([]);
        }
    }, []);

    // Handle node click
    const handleNodeClick = useCallback((unit) => {
        setSelectedUnit(unit);
        fetchUnitPositions(unit.id);
    }, [fetchUnitPositions]);

    // Handle node double click for modal
    const onNodeDoubleClick = useCallback((event, node) => {
        const unit = node.data.unit;
        setSelectedUnit(unit);
        fetchUnitPositions(unit.id);
        setModalOpen(true);
    }, [fetchUnitPositions]);

    // Node types
    const nodeTypes = useMemo(() => ({ unitNode: UnitNode }), []);

    // Initialize data
    useEffect(() => {
        fetchORBATData();
    }, [fetchORBATData]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading Organization Chart...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <h2>Error Loading Organization Chart</h2>
                    <p>{error}</p>
                    <button className="retry-button" onClick={fetchORBATData}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="org-chart-container">
            <div className="chart-header">
                <h1>Unit Organization Chart</h1>
                <div className="legend">
                    <div className="legend-item">
                        <div className="legend-color active"></div>
                        <span>Active Unit</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color inactive"></div>
                        <span>Inactive Unit</span>
                    </div>
                </div>
            </div>

            <div className="chart-main">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeDoubleClick={onNodeDoubleClick}
                        nodeTypes={nodeTypes}
                        connectionMode={ConnectionMode.Loose}
                        fitView
                        attributionPosition="bottom-left"
                    >
                        <Background variant="dots" gap={20} size={1} color="#333" />
                        <Controls />
                        <MiniMap
                            nodeColor={(node) => {
                                const unit = node.data.unit;
                                return unit.is_active ? unit.branch_color : '#666';
                            }}
                            style={{
                                backgroundColor: '#111',
                                border: '1px solid #42c8f4'
                            }}
                        />
                        <Panel position="top-right">
                            <button
                                className="reset-button"
                                onClick={() => fetchORBATData()}
                            >
                                Reset View
                            </button>
                        </Panel>
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

            {selectedUnit && (
                <PositionPanel unit={selectedUnit} positions={positions} />
            )}

            <UnitModal
                unit={selectedUnit}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                positions={positions}
            />

            <style jsx>{`
        .org-chart-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0a0a0a;
          color: #fff;
          font-family: 'Exo 2', sans-serif;
        }

        .chart-header {
          padding: 1rem 2rem;
          background: rgba(17, 17, 17, 0.95);
          border-bottom: 1px solid rgba(66, 200, 244, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-header h1 {
          margin: 0;
          font-size: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #42c8f4;
        }

        .legend {
          display: flex;
          gap: 2rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid #42c8f4;
        }

        .legend-color.active {
          background: rgba(66, 200, 244, 0.3);
        }

        .legend-color.inactive {
          background: rgba(102, 102, 102, 0.3);
          border-color: #666;
        }

        .chart-main {
          flex: 1;
          position: relative;
        }

        .unit-node {
          background: rgba(10, 10, 10, 0.95);
          border: 2px solid;
          border-radius: 8px;
          padding: 0;
          width: 200px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .unit-node:hover {
          transform: translateY(-2px);
        }

        .unit-node.inactive {
          filter: grayscale(80%);
        }

        .unit-header {
          padding: 0.5rem;
          border-bottom: 1px solid;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .unit-header h4 {
          margin: 0;
          font-size: 1rem;
          text-transform: uppercase;
        }

        .unit-emblem {
          width: 30px;
          height: 30px;
          object-fit: contain;
        }

        .unit-body {
          padding: 0.5rem;
        }

        .unit-name {
          font-size: 0.875rem;
          margin: 0.25rem 0;
          font-weight: 600;
        }

        .unit-type {
          font-size: 0.75rem;
          color: #a8b2bd;
          margin: 0.25rem 0;
        }

        .unit-commander {
          font-size: 0.75rem;
          color: #42c8f4;
          margin: 0.25rem 0;
        }

        .unit-stats {
          font-size: 0.75rem;
          color: #a8b2bd;
          margin-top: 0.5rem;
        }

        .inactive-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff3333;
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .position-panel {
          height: 250px;
          background: rgba(17, 17, 17, 0.95);
          border-top: 1px solid rgba(66, 200, 244, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(66, 200, 244, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: #42c8f4;
        }

        .position-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
        }

        .position-stats .filled {
          color: #00ff88;
        }

        .position-stats .vacant {
          color: #ffaa00;
        }

        .positions-container {
          flex: 1;
          display: flex;
          gap: 2rem;
          padding: 1rem;
          overflow-y: auto;
        }

        .position-group {
          flex: 1;
        }

        .position-group h4 {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          text-transform: uppercase;
          color: #a8b2bd;
        }

        .position-card {
          background: rgba(10, 10, 10, 0.6);
          border: 1px solid rgba(66, 200, 244, 0.2);
          border-radius: 4px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .position-card.filled {
          border-color: rgba(0, 255, 136, 0.3);
        }

        .position-card.vacant {
          border-color: rgba(255, 170, 0, 0.3);
        }

        .position-card:hover {
          background: rgba(66, 200, 244, 0.05);
        }

        .position-info h5 {
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          color: #fff;
        }

        .position-info p {
          margin: 0.25rem 0;
          font-size: 0.75rem;
          color: #a8b2bd;
        }

        .holder {
          color: #42c8f4;
        }

        .vacancy-note {
          color: #ffaa00;
          font-style: italic;
        }

        .no-positions {
          color: #6c757d;
          font-style: italic;
          font-size: 0.875rem;
          padding: 1rem;
          text-align: center;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(17, 17, 17, 0.98) 100%);
          border: 1px solid rgba(66, 200, 244, 0.3);
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 30px rgba(66, 200, 244, 0.3);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(66, 200, 244, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #42c8f4;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .close-button {
          background: none;
          border: 1px solid rgba(66, 200, 244, 0.3);
          color: #42c8f4;
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background: rgba(66, 200, 244, 0.1);
          border-color: #42c8f4;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-item label {
          font-size: 0.75rem;
          color: #a8b2bd;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .info-item span, .info-item p {
          color: #fff;
          font-size: 0.875rem;
        }

        .info-item .active {
          color: #00ff88;
        }

        .info-item .inactive {
          color: #ff3333;
        }

        .positions-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #42c8f4;
          text-transform: uppercase;
        }

        .positions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .position-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(66, 200, 244, 0.05);
          border: 1px solid rgba(66, 200, 244, 0.1);
          border-radius: 4px;
        }

        .position-title {
          font-size: 0.875rem;
          color: #fff;
        }

        .position-status {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .position-status.vacant {
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
          border: 1px solid rgba(255, 170, 0, 0.3);
        }

        .position-status.filled {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .reset-button {
          background: rgba(66, 200, 244, 0.1);
          border: 1px solid rgba(66, 200, 244, 0.3);
          color: #42c8f4;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        .reset-button:hover {
          background: rgba(66, 200, 244, 0.2);
          border-color: #42c8f4;
        }

        .loading-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
        }

        .loading-spinner {
          color: #42c8f4;
          font-size: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .error-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
        }

        .error-content {
          text-align: center;
          padding: 2rem;
          background: rgba(17, 17, 17, 0.95);
          border: 1px solid rgba(255, 51, 51, 0.3);
          border-radius: 8px;
          max-width: 400px;
        }

        .error-content h2 {
          color: #ff3333;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          text-transform: uppercase;
        }

        .error-content p {
          color: #a8b2bd;
          margin-bottom: 1.5rem;
        }

        .retry-button {
          background: rgba(66, 200, 244, 0.1);
          border: 1px solid rgba(66, 200, 244, 0.3);
          color: #42c8f4;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          text-transform: uppercase;
          font-size: 0.875rem;
        }

        .retry-button:hover {
          background: rgba(66, 200, 244, 0.2);
          border-color: #42c8f4;
          transform: translateY(-2px);
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(66, 200, 244, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(66, 200, 244, 0.5);
        }
      `}</style>
        </div>
    );
};

export default UnitOrganizationChart;