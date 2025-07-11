/**
 * Unit Organization Chart Component
 *
 * Displays a hierarchical organization chart of military units using ReactFlow
 * Prerequisites:
 * - User must be authenticated
 * - Requires API endpoints: /units/orbat/units_list/ and /units/orbat/unit_orbat/
 * - Install required dependencies: npm install reactflow dagre axios
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

// Create API instance
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

// Utility Functions
const formatUnitType = (unitType) => {
    if (!unitType) return '';

    // Handle legacy format (e.g., "Corps", "Division")
    if (!unitType.includes('_')) return unitType;

    // Handle new format (e.g., "navy_fleet", "ground_division")
    const [category, ...typeParts] = unitType.split('_');
    const type = typeParts.join(' ');

    const formattedType = type.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return formattedType;
};

const getUnitCategory = (unitType) => {
    if (!unitType || !unitType.includes('_')) return 'default';
    return unitType.split('_')[0];
};

// Get branch color with proper formatting
const getBranchColor = (branch) => {
    if (!branch || !branch.color_code) return '#42c8f4';
    // Add # if not present
    return branch.color_code.startsWith('#') ? branch.color_code : `#${branch.color_code}`;
};

// Custom Node Component
const UnitNode = ({ data }) => {
    const { unit, handleClick } = data;
    const isInactive = !unit.is_active;
    const branchColor = getBranchColor(unit.branch);
    const unitCategory = getUnitCategory(unit.unit_type);

    return (
        <div
            className={`unit-node ${isInactive ? 'inactive' : ''} category-${unitCategory}`}
            onClick={() => handleClick(unit)}
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
                <p className="unit-type">{formatUnitType(unit.unit_type)}</p>
                {unit.branch && (
                    <p className="unit-branch">{unit.branch.abbreviation}</p>
                )}
                <div className="unit-stats">
                    <span>Personnel: {unit.statistics?.personnel_count || unit.personnel_count || 0}</span>
                    {unit.statistics && (
                        <span className="fill-rate">
                            {unit.statistics.filled_positions}/{unit.statistics.total_positions} positions
                        </span>
                    )}
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
                            <span>{formatUnitType(unit.unit_type)}</span>
                        </div>
                        <div className="info-item">
                            <label>Branch:</label>
                            <span>{unit.branch?.name || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Status:</label>
                            <span className={unit.is_active ? 'active' : 'inactive'}>
                                {unit.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        {unit.recruitment_status && (
                            <div className="info-item">
                                <label>Recruitment:</label>
                                <span className={`recruitment-${unit.recruitment_status}`}>
                                    {unit.recruitment_status.charAt(0).toUpperCase() + unit.recruitment_status.slice(1)}
                                </span>
                            </div>
                        )}
                        {unit.location && (
                            <div className="info-item">
                                <label>Location:</label>
                                <span>{unit.location}</span>
                            </div>
                        )}
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

                    {unit.statistics && (
                        <div className="statistics-section">
                            <h3>Unit Statistics</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <label>Total Positions:</label>
                                    <span>{unit.statistics.total_positions}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Filled Positions:</label>
                                    <span className="filled">{unit.statistics.filled_positions}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Vacant Positions:</label>
                                    <span className="vacant">{unit.statistics.vacant_positions}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Fill Rate:</label>
                                    <span>{unit.statistics.fill_rate}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="positions-section">
                        <h3>Positions ({positions.length})</h3>
                        {positions.length > 0 ? (
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
                        ) : (
                            <p className="no-positions">No positions defined for this unit</p>
                        )}
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
const UnitOrganizationChart = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unitData, setUnitData] = useState({});
    const [error, setError] = useState(null);

    // Node types configuration
    const nodeTypes = useMemo(() => ({ unitNode: UnitNode }), []);

    // Fetch positions for a unit
    const fetchUnitPositions = useCallback(async (unitId) => {
        try {
            const response = await api.get(`/units/orbat/unit_orbat/?unit_id=${unitId}&include_subunits=false`);
            const positions = response.data.nodes
                .filter(node => node.position_type)
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
            // If the endpoint fails, try to use positions from the unit data
            const unit = unitData[unitId];
            if (unit && unit.positions) {
                setPositions(unit.positions);
            } else {
                setPositions([]);
            }
        }
    }, [unitData]);

    // Handle node double click for modal
    const onNodeDoubleClick = useCallback((event, node) => {
        const unit = node.data.unit;
        setSelectedUnit(unit);
        fetchUnitPositions(unit.id);
        setModalOpen(true);
    }, [fetchUnitPositions]);

    // Load ORBAT data on mount
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get('/units/');
                const data = response.data;

                // Check if component is still mounted
                if (!mounted) return;

                // Extract units from results array
                const units = data.results || data || [];

                if (!units || units.length === 0) {
                    setError('No units found in the organization.');
                    setLoading(false);
                    return;
                }

                // Store unit data
                const unitMap = {};
                units.forEach(unit => {
                    unitMap[unit.id] = unit;
                });
                setUnitData(unitMap);

                // Create nodes with inline click handlers
                const flowNodes = units.map(unit => ({
                    id: unit.id,
                    type: 'unitNode',
                    data: {
                        unit: unit,
                        handleClick: (clickedUnit) => {
                            setSelectedUnit(clickedUnit);
                        }
                    },
                    position: { x: 0, y: 0 }
                }));

                // Create edges
                const flowEdges = [];
                units.forEach(unit => {
                    if (unit.parent_unit && unitMap[unit.parent_unit]) {
                        const parentUnit = unitMap[unit.parent_unit];

                        // Inline edge style calculation
                        const sourceCategory = getUnitCategory(parentUnit.unit_type);
                        const targetCategory = getUnitCategory(unit.unit_type);
                        const differentBranches = parentUnit.branch?.id !== unit.branch?.id;

                        let edgeColor = '#42c8f4';
                        let strokeDasharray = '0';
                        let animated = false;
                        let label = 'Reports to';

                        if (!parentUnit.is_active || !unit.is_active) {
                            edgeColor = '#666666';
                            strokeDasharray = '5 5';
                            label = 'Inactive Link';
                        } else if (differentBranches) {
                            edgeColor = '#ff7b00';
                            strokeDasharray = '10 5';
                            label = 'Cross-Branch';
                            animated = true;
                        } else if (sourceCategory !== targetCategory && sourceCategory !== 'default' && targetCategory !== 'default') {
                            edgeColor = '#ffaa00';
                            strokeDasharray = '8 4';
                            label = 'Cross-Type';
                        } else {
                            edgeColor = getBranchColor(parentUnit.branch);
                            switch (sourceCategory) {
                                case 'navy':
                                    label = 'Naval Command';
                                    break;
                                case 'aviation':
                                    edgeColor = '#00ff88';
                                    label = 'Aviation Command';
                                    break;
                                case 'ground':
                                    edgeColor = '#ff3333';
                                    label = 'Ground Command';
                                    break;
                            }
                        }

                        flowEdges.push({
                            id: `e${unit.parent_unit}-${unit.id}`,
                            source: unit.parent_unit,
                            target: unit.id,
                            type: 'smoothstep',
                            style: {
                                stroke: edgeColor,
                                strokeWidth: 2,
                                strokeDasharray: strokeDasharray
                            },
                            animated: animated,
                            label: label,
                            labelShowBg: true,
                            labelStyle: {
                                fill: edgeColor,
                                fontSize: 9,
                                fontWeight: 500,
                                opacity: 0.8
                            },
                            labelBgStyle: {
                                fill: '#0a0a0a',
                                fillOpacity: 0.9,
                                borderRadius: 2,
                                padding: 2
                            },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: edgeColor
                            }
                        });
                    }
                });

                // Apply dagre layout
                const dagreGraph = new dagre.graphlib.Graph();
                dagreGraph.setDefaultEdgeLabel(() => ({}));
                dagreGraph.setGraph({ rankdir: 'TB', nodesep: 120, ranksep: 180 });

                flowNodes.forEach((node) => {
                    dagreGraph.setNode(node.id, { width: 220, height: 160 });
                });

                flowEdges.forEach((edge) => {
                    dagreGraph.setEdge(edge.source, edge.target);
                });

                dagre.layout(dagreGraph);

                const layoutedNodes = flowNodes.map((node) => {
                    const nodeWithPosition = dagreGraph.node(node.id);
                    return {
                        ...node,
                        position: {
                            x: nodeWithPosition.x - 110,
                            y: nodeWithPosition.y - 80,
                        },
                    };
                });

                if (mounted) {
                    setNodes(layoutedNodes);
                    setEdges(flowEdges);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Failed to fetch ORBAT data:', error);
                if (mounted) {
                    setError(`Failed to load organization chart: ${error.message || 'Unknown error'}`);
                    setLoading(false);
                }
            }
        };

        loadData();

        // Cleanup function
        return () => {
            mounted = false;
        };
    }, []); // Empty dependency array - only run once on mount

    // Separate effect to fetch positions when selected unit changes
    useEffect(() => {
        if (selectedUnit && selectedUnit.id) {
            fetchUnitPositions(selectedUnit.id);
        }
    }, [selectedUnit, fetchUnitPositions]);

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading Organization Chart...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <h2>Error Loading Organization Chart</h2>
                    <p>{error}</p>
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="org-chart-container">
            <div className="chart-header">
                <h1>Unit Organization Chart</h1>
                <div className="legend-container">
                    <div className="legend">
                        <h4>Unit Status</h4>
                        <div className="legend-item">
                            <div className="legend-color active"></div>
                            <span>Active Unit</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color inactive"></div>
                            <span>Inactive Unit</span>
                        </div>
                    </div>
                    <div className="legend">
                        <h4>Command Lines</h4>
                        <div className="legend-item">
                            <div className="legend-line navy"></div>
                            <span>Naval Command</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-line aviation"></div>
                            <span>Aviation Command</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-line ground"></div>
                            <span>Ground Command</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-line cross-branch"></div>
                            <span>Cross-Branch</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-line cross-type"></div>
                            <span>Cross-Type</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-line inactive-link"></div>
                            <span>Inactive Link</span>
                        </div>
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
                        fitViewOptions={{
                            padding: 0.2,
                            includeHiddenNodes: false
                        }}
                        attributionPosition="bottom-left"
                        edgesFocusable={true}
                        edgesUpdatable={false}
                        nodesFocusable={true}
                        nodesConnectable={false}
                        nodesDraggable={true}
                        panOnDrag={true}
                        zoomOnScroll={true}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            markerEnd: {
                                type: MarkerType.ArrowClosed
                            }
                        }}
                    >
                        <Background variant="dots" gap={20} size={1} color="#333" />
                        <Controls />
                        <MiniMap
                            nodeColor={(node) => {
                                const unit = node.data.unit;
                                const branchColor = getBranchColor(unit.branch);
                                return unit.is_active ? branchColor : '#666';
                            }}
                            style={{
                                backgroundColor: '#111',
                                border: '1px solid #42c8f4'
                            }}
                        />
                        <Panel position="top-right">
                            <button
                                className="reset-button"
                                onClick={() => window.location.reload()}
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
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .chart-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #42c8f4;
                }

                .legend-container {
                    display: flex;
                    gap: 3rem;
                    flex-wrap: wrap;
                }

                .legend {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .legend h4 {
                    margin: 0 0 0.5rem 0;
                    font-size: 0.875rem;
                    color: #a8b2bd;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
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

                .legend-line {
                    width: 30px;
                    height: 2px;
                    position: relative;
                    margin: 0 5px;
                }

                .legend-line::before {
                    content: '▶';
                    position: absolute;
                    right: -8px;
                    top: -8px;
                    font-size: 12px;
                }

                .legend-line.navy {
                    background: #003F87;
                }

                .legend-line.navy::before {
                    color: #003F87;
                }

                .legend-line.aviation {
                    background: #00ff88;
                }

                .legend-line.aviation::before {
                    color: #00ff88;
                }

                .legend-line.ground {
                    background: #ff3333;
                }

                .legend-line.ground::before {
                    color: #ff3333;
                }

                .legend-line.cross-branch {
                    background: repeating-linear-gradient(
                            90deg,
                            #ff7b00 0px,
                            #ff7b00 10px,
                            transparent 10px,
                            transparent 15px
                    );
                }

                .legend-line.cross-branch::before {
                    color: #ff7b00;
                }

                .legend-line.cross-type {
                    background: repeating-linear-gradient(
                            90deg,
                            #ffaa00 0px,
                            #ffaa00 8px,
                            transparent 8px,
                            transparent 12px
                    );
                }

                .legend-line.cross-type::before {
                    color: #ffaa00;
                }

                .legend-line.inactive-link {
                    background: repeating-linear-gradient(
                            90deg,
                            #666666 0px,
                            #666666 5px,
                            transparent 5px,
                            transparent 10px
                    );
                }

                .legend-line.inactive-link::before {
                    color: #666666;
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
                    width: 220px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .unit-node:hover {
                    transform: translateY(-2px);
                }

                .unit-node.inactive {
                    filter: grayscale(80%);
                }

                .unit-node.category-navy::before {
                    content: '⚓';
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #003F87;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    border: 2px solid #0a0a0a;
                    z-index: 1;
                }

                .unit-node.category-aviation::before {
                    content: '✈';
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #00ff88;
                    color: #0a0a0a;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    border: 2px solid #0a0a0a;
                    z-index: 1;
                }

                .unit-node.category-ground::before {
                    content: '⚔';
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #ff3333;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    border: 2px solid #0a0a0a;
                    z-index: 1;
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
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .unit-branch {
                    font-size: 0.75rem;
                    color: #42c8f4;
                    margin: 0.25rem 0;
                }

                .unit-stats {
                    font-size: 0.75rem;
                    color: #a8b2bd;
                    margin-top: 0.5rem;
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .unit-stats .fill-rate {
                    color: #00ff88;
                }

                .inactive-badge {
                    position: absolute;
                    top: -8px;
                    left: -8px;
                    background: #ff3333;
                    color: #fff;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.625rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    z-index: 1;
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

                .info-item .recruitment-open {
                    color: #00ff88;
                }

                .info-item .recruitment-closed {
                    color: #ff3333;
                }

                .info-item .recruitment-limited {
                    color: #ffaa00;
                }

                .statistics-section {
                    margin-bottom: 2rem;
                }

                .statistics-section h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.125rem;
                    color: #42c8f4;
                    text-transform: uppercase;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }

                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem;
                    background: rgba(66, 200, 244, 0.05);
                    border: 1px solid rgba(66, 200, 244, 0.1);
                    border-radius: 4px;
                }

                .stat-item label {
                    font-size: 0.75rem;
                    color: #a8b2bd;
                }

                .stat-item span {
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .stat-item .filled {
                    color: #00ff88;
                }

                .stat-item .vacant {
                    color: #ffaa00;
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

                /* Responsive improvements */
                @media (max-width: 1024px) {
                    .chart-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .legend-container {
                        width: 100%;
                        gap: 1.5rem;
                    }

                    .legend {
                        flex-direction: row;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }

                    .legend h4 {
                        width: 100%;
                    }
                }

                @media (max-width: 768px) {
                    .unit-node {
                        width: 180px;
                    }

                    .legend-container {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .legend {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .positions-container {
                        flex-direction: column;
                    }

                    .modal-content {
                        width: 95%;
                        max-height: 90vh;
                    }

                    .info-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Scrollbar styling for position panels */
                .positions-container::-webkit-scrollbar,
                .modal-body::-webkit-scrollbar {
                    width: 8px;
                }

                .positions-container::-webkit-scrollbar-track,
                .modal-body::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }

                .positions-container::-webkit-scrollbar-thumb,
                .modal-body::-webkit-scrollbar-thumb {
                    background: rgba(66, 200, 244, 0.5);
                    border-radius: 4px;
                }

                .positions-container::-webkit-scrollbar-thumb:hover,
                .modal-body::-webkit-scrollbar-thumb:hover {
                    background: rgba(66, 200, 244, 0.7);
                }
            `}</style>
        </div>
    );
};

export default UnitOrganizationChart;