import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
    Panel,
    useReactFlow,
    ReactFlowProvider,
    applyNodeChanges,
    applyEdgeChanges
} from 'reactflow';
import dagre from 'dagre';
import {
    Card, Button, Select, Checkbox, Drawer, Descriptions, Badge, Avatar,
    Tooltip, Space, Input, Dropdown, Menu, message, Modal, List, Spin,
    Row, Col, Statistic, Alert
} from 'antd';
import {
    FullscreenOutlined, TeamOutlined, UserOutlined, SearchOutlined,
    ExportOutlined, PrinterOutlined, ReloadOutlined, FilterOutlined,
    ZoomInOutlined, ZoomOutOutlined, DownloadOutlined, EditOutlined,
    SaveOutlined, CloseOutlined, PlusOutlined
} from '@ant-design/icons';
import { toPng, toJpeg } from 'html-to-image';
import 'reactflow/dist/style.css';
import './AdvancedORBATView.css';
import orbatService from './orbatService'

const { Option } = Select;
const { Search } = Input;

// Enhanced Position Node with edit capabilities
const EnhancedPositionNode = ({ data, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { position_type, display_title, current_holder, unit_info, role_info, is_vacant, id } = data;

    const getNodeStyle = () => {
        const baseStyle = {
            padding: '10px',
            borderRadius: '8px',
            minWidth: '220px',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '2px solid',
            cursor: 'move',
            position: 'relative'
        };

        const typeStyles = {
            command: { backgroundColor: '#fff2e8', borderColor: '#d46b08' },
            staff: { backgroundColor: '#e6f7ff', borderColor: '#1890ff' },
            nco: { backgroundColor: '#f6ffed', borderColor: '#52c41a' },
            specialist: { backgroundColor: '#f9f0ff', borderColor: '#722ed1' },
            default: { backgroundColor: '#fafafa', borderColor: '#d9d9d9' }
        };

        return { ...baseStyle, ...(typeStyles[position_type] || typeStyles.default) };
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
        // Implementation for edit mode would go here
    };

    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ opacity: 0 }}
            />
            <div style={getNodeStyle()}>
                {/* Edit button */}
                {!is_vacant && (
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            opacity: 0.7
                        }}
                        onClick={handleEditClick}
                    />
                )}

                <div style={{ fontWeight: 'bold', marginBottom: '5px', paddingRight: '30px' }}>
                    {display_title}
                </div>

                <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>
                    {unit_info.abbreviation} | {role_info.category}
                </div>

                {is_vacant ? (
                    <div style={{
                        color: '#ff4d4f',
                        fontStyle: 'italic',
                        padding: '10px',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255,77,79,0.1)',
                        borderRadius: '4px',
                        marginTop: '8px'
                    }}>
                        <UserOutlined style={{ marginRight: '5px' }} />
                        Position Vacant
                    </div>
                ) : current_holder && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '8px',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        padding: '8px',
                        borderRadius: '4px'
                    }}>
                        <Avatar
                            src={current_holder.avatar_url}
                            size="small"
                            icon={<UserOutlined />}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
                                {current_holder.rank?.abbreviation} {current_holder.username}
                            </div>
                            <div style={{ fontSize: '10px', color: '#666' }}>
                                {current_holder.service_number}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{ opacity: 0 }}
            />
        </>
    );
};

// Node types
const nodeTypes = {
    position: EnhancedPositionNode
};

// Enhanced auto-layout with better spacing
const getLayoutedElements = (nodes, edges, direction = 'TB', options = {}) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = options.nodeWidth || 250;
    const nodeHeight = options.nodeHeight || 140;

    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: options.horizontalSpacing || 120,
        ranksep: options.verticalSpacing || 180,
        marginx: 50,
        marginy: 50,
        align: 'DR' // Down-Right alignment for better tree structure
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: nodeWidth,
            height: nodeHeight,
            // Use manual positions if available
            x: node.data.manual_x || undefined,
            y: node.data.manual_y || undefined
        });
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
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// Main Advanced ORBAT Component
const AdvancedORBATView = ({ unitId, initialData = null }) => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Filter states
    const [includeSubunits, setIncludeSubunits] = useState(true);
    const [layoutDirection, setLayoutDirection] = useState('TB');
    const [showVacant, setShowVacant] = useState(true);
    const [filterByType, setFilterByType] = useState('all');
    const [highlightedNodes, setHighlightedNodes] = useState(new Set());

    // Statistics
    const [statistics, setStatistics] = useState({
        totalPositions: 0,
        filledPositions: 0,
        vacantPositions: 0,
        units: 0
    });

    const { fitView, getNodes, getEdges, setViewport } = useReactFlow();

    // Fetch ORBAT data
    const fetchORBATData = useCallback(async () => {
        if (initialData) {
            processORBATData(initialData);
            return;
        }

        setLoading(true);
        try {
            const data = await orbatService.getUnitORBAT(unitId, includeSubunits);
            processORBATData(data);
        } catch (error) {
            console.error('Error fetching ORBAT data:', error);
            message.error('Failed to load ORBAT data');
        } finally {
            setLoading(false);
        }
    }, [unitId, includeSubunits, showVacant, filterByType, layoutDirection]);

    const processORBATData = (data) => {
        // Convert to React Flow format
        const flowNodes = data.nodes.map((node) => ({
            id: node.id,
            type: 'position',
            data: node,
            position: { x: 0, y: 0 }
        }));

        const flowEdges = data.edges.map((edge) => ({
            ...edge,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
            },
            style: edge.data?.relationship === 'external_reports_to'
                ? { strokeDasharray: '5 5' }
                : {}
        }));

        // Apply filters
        let filteredNodes = flowNodes;
        if (!showVacant) {
            filteredNodes = flowNodes.filter(node => !node.data.is_vacant);
        }
        if (filterByType !== 'all') {
            filteredNodes = filteredNodes.filter(node => node.data.position_type === filterByType);
        }

        // Update statistics
        setStatistics({
            totalPositions: data.nodes.length,
            filledPositions: data.nodes.filter(n => !n.is_vacant).length,
            vacantPositions: data.nodes.filter(n => n.is_vacant).length,
            units: data.statistics?.units_included || 1
        });

        // Apply auto-layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            filteredNodes,
            flowEdges,
            layoutDirection
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Fit view after layout
        setTimeout(() => {
            fitView({ padding: 0.2 });
        }, 100);
    };

    useEffect(() => {
        fetchORBATData();
    }, [fetchORBATData]);

    // Search functionality
    const handleSearch = async (value) => {
        if (!value) {
            setHighlightedNodes(new Set());
            return;
        }

        setSearching(true);
        try {
            // Search through current nodes
            const results = nodes.filter(node =>
                node.data.display_title.toLowerCase().includes(value.toLowerCase()) ||
                node.data.current_holder?.username.toLowerCase().includes(value.toLowerCase()) ||
                node.data.current_holder?.service_number.includes(value)
            );

            setSearchResults(results);

            // Highlight matching nodes
            const nodeIds = new Set(results.map(r => r.id));
            setHighlightedNodes(nodeIds);

            // If single result, center on it
            if (results.length === 1) {
                const node = results[0];
                setViewport({
                    x: -node.position.x + window.innerWidth / 2 - 125,
                    y: -node.position.y + window.innerHeight / 2 - 70,
                    zoom: 1
                });
            }
        } finally {
            setSearching(false);
        }
    };

    // Export functionality
    const exportAsImage = async (format = 'png') => {
        const element = reactFlowWrapper.current.querySelector('.react-flow');
        if (!element) return;

        try {
            const dataUrl = format === 'png'
                ? await toPng(element, { backgroundColor: '#ffffff' })
                : await toJpeg(element, { quality: 0.95, backgroundColor: '#ffffff' });

            const link = document.createElement('a');
            link.download = `orbat-${unitId}-${new Date().toISOString().split('T')[0]}.${format}`;
            link.href = dataUrl;
            link.click();

            message.success(`ORBAT exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export failed:', error);
            message.error('Failed to export image');
        }
    };

    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
        setDrawerVisible(true);
    }, []);

    const onNodeDragStop = useCallback((event, node) => {
        // Save new position to backend
        orbatService.savePositionCoordinates(node.id, node.position.x, node.position.y)
            .catch(err => console.error('Failed to save position:', err));
    }, []);

    const minimapNodeColor = (node) => {
        if (highlightedNodes.has(node.id)) return '#ff4d4f';

        switch (node.data?.position_type) {
            case 'command': return '#d46b08';
            case 'staff': return '#1890ff';
            case 'nco': return '#52c41a';
            case 'specialist': return '#722ed1';
            default: return '#d9d9d9';
        }
    };

    // Export menu
    const exportMenu = (
        <Menu>
            <Menu.Item key="png" icon={<DownloadOutlined />} onClick={() => exportAsImage('png')}>
                Export as PNG
            </Menu.Item>
            <Menu.Item key="jpg" icon={<DownloadOutlined />} onClick={() => exportAsImage('jpeg')}>
                Export as JPEG
            </Menu.Item>
            <Menu.Item key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
            </Menu.Item>
        </Menu>
    );

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" tip="Loading ORBAT data..." />
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', width: '100%' }} ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes.map(node => ({
                    ...node,
                    style: highlightedNodes.has(node.id)
                        ? { ...node.style, boxShadow: '0 0 0 3px #ff4d4f' }
                        : node.style
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                fitView
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
            >
                <Background variant="dots" gap={12} size={1} />
                <Controls />
                <MiniMap
                    nodeColor={minimapNodeColor}
                    nodeStrokeWidth={3}
                    pannable
                    zoomable
                />

                {/* Control Panel */}
                <Panel position="top-left">
                    <Card size="small" style={{ minWidth: '320px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {/* Statistics */}
                            <Row gutter={8}>
                                <Col span={12}>
                                    <Statistic
                                        title="Total"
                                        value={statistics.totalPositions}
                                        valueStyle={{ fontSize: '14px' }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Filled"
                                        value={statistics.filledPositions}
                                        valueStyle={{ fontSize: '14px', color: '#52c41a' }}
                                    />
                                </Col>
                            </Row>

                            {/* Search */}
                            <Search
                                placeholder="Search positions or personnel"
                                onSearch={handleSearch}
                                onChange={e => !e.target.value && setHighlightedNodes(new Set())}
                                loading={searching}
                                allowClear
                            />

                            {/* Layout Controls */}
                            <div>
                                <label>Layout: </label>
                                <Select
                                    value={layoutDirection}
                                    onChange={setLayoutDirection}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="TB">Top → Bottom</Option>
                                    <Option value="BT">Bottom → Top</Option>
                                    <Option value="LR">Left → Right</Option>
                                    <Option value="RL">Right → Left</Option>
                                </Select>
                            </div>

                            {/* Filters */}
                            <Checkbox
                                checked={includeSubunits}
                                onChange={(e) => setIncludeSubunits(e.target.checked)}
                            >
                                Include Sub-units
                            </Checkbox>

                            <Checkbox
                                checked={showVacant}
                                onChange={(e) => setShowVacant(e.target.checked)}
                            >
                                Show Vacant Positions
                            </Checkbox>

                            <Select
                                value={filterByType}
                                onChange={setFilterByType}
                                style={{ width: '100%' }}
                                placeholder="Filter by type"
                            >
                                <Option value="all">All Positions</Option>
                                <Option value="command">Command Only</Option>
                                <Option value="staff">Staff Only</Option>
                                <Option value="nco">NCO Only</Option>
                                <Option value="specialist">Specialist Only</Option>
                            </Select>

                            {/* Actions */}
                            <Space style={{ width: '100%' }}>
                                <Button
                                    icon={<FullscreenOutlined />}
                                    onClick={() => fitView({ padding: 0.2 })}
                                >
                                    Fit View
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchORBATData}
                                >
                                    Refresh
                                </Button>
                                <Dropdown overlay={exportMenu}>
                                    <Button icon={<ExportOutlined />}>
                                        Export
                                    </Button>
                                </Dropdown>
                            </Space>
                        </Space>
                    </Card>
                </Panel>

                {/* Legend */}
                <Panel position="top-right">
                    <Card size="small" title="Legend" style={{ minWidth: '200px' }}>
                        <Space direction="vertical" size="small">
                            <div><Badge color="#d46b08" text="Command" /></div>
                            <div><Badge color="#1890ff" text="Staff" /></div>
                            <div><Badge color="#52c41a" text="NCO" /></div>
                            <div><Badge color="#722ed1" text="Specialist" /></div>
                            <div><Badge color="#d9d9d9" text="Standard" /></div>
                            <div><Badge color="#ff4d4f" text="Search Match" /></div>
                        </Space>
                    </Card>
                </Panel>
            </ReactFlow>

            {/* Detail Drawer */}
            <Drawer
                title="Position Details"
                placement="right"
                width={480}
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                extra={
                    <Space>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => message.info('Edit functionality coming soon')}
                        >
                            Edit Position
                        </Button>
                    </Space>
                }
            >
                {selectedNode && (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {/* Position Card */}
                        <Card title="Position Information" size="small">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Title">
                                    {selectedNode.data.display_title}
                                </Descriptions.Item>
                                <Descriptions.Item label="Unit">
                                    {selectedNode.data.unit_info.name} ({selectedNode.data.unit_info.abbreviation})
                                </Descriptions.Item>
                                <Descriptions.Item label="Role">
                                    {selectedNode.data.role_info.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Category">
                                    <Badge
                                        color={
                                            selectedNode.data.position_type === 'command' ? '#d46b08' :
                                                selectedNode.data.position_type === 'staff' ? '#1890ff' :
                                                    selectedNode.data.position_type === 'nco' ? '#52c41a' :
                                                        selectedNode.data.position_type === 'specialist' ? '#722ed1' :
                                                            '#d9d9d9'
                                        }
                                        text={selectedNode.data.role_info.category}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    {selectedNode.data.is_vacant ? (
                                        <Badge status="error" text="Vacant" />
                                    ) : (
                                        <Badge status="success" text="Filled" />
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Current Holder Card */}
                        {selectedNode.data.current_holder && (
                            <Card title="Current Holder" size="small">
                                <Space size="large">
                                    <Avatar
                                        src={selectedNode.data.current_holder.avatar_url}
                                        size={64}
                                        icon={<UserOutlined />}
                                    />
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {selectedNode.data.current_holder.rank?.abbreviation} {selectedNode.data.current_holder.username}
                                        </div>
                                        <div style={{ color: '#666', marginBottom: '8px' }}>
                                            Service #: {selectedNode.data.current_holder.service_number}
                                        </div>
                                        <Space>
                                            <Button
                                                type="link"
                                                size="small"
                                                href={`/profile/${selectedNode.data.current_holder.id}`}
                                                target="_blank"
                                            >
                                                View Profile
                                            </Button>
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => message.info('Message feature coming soon')}
                                            >
                                                Send Message
                                            </Button>
                                        </Space>
                                    </div>
                                </Space>
                            </Card>
                        )}

                        {/* Vacant Position Actions */}
                        {selectedNode.data.is_vacant && (
                            <Alert
                                message="Position Vacant"
                                description="This position is currently vacant and available for assignment."
                                type="warning"
                                showIcon
                                action={
                                    <Button size="small" type="primary">
                                        Assign Personnel
                                    </Button>
                                }
                            />
                        )}

                        {/* Chain of Command */}
                        <Card title="Chain of Command" size="small">
                            <Button
                                type="link"
                                onClick={async () => {
                                    try {
                                        const chain = await orbatService.getPositionChainOfCommand(selectedNode.id);
                                        console.log('Chain of command:', chain);
                                        message.info('Chain of command loaded - check console');
                                    } catch (err) {
                                        message.error('Failed to load chain of command');
                                    }
                                }}
                            >
                                View Full Chain of Command
                            </Button>
                        </Card>
                    </Space>
                )}
            </Drawer>

            {/* Search Results Modal */}
            <Modal
                title={`Search Results (${searchResults.length})`}
                visible={searchResults.length > 0 && searchVisible}
                onCancel={() => setSearchVisible(false)}
                footer={null}
                width={600}
            >
                <List
                    dataSource={searchResults}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setViewport({
                                            x: -item.position.x + window.innerWidth / 2 - 125,
                                            y: -item.position.y + window.innerHeight / 2 - 70,
                                            zoom: 1
                                        });
                                        setSearchVisible(false);
                                    }}
                                >
                                    Go to Position
                                </Button>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    item.data.current_holder ?
                                        <Avatar src={item.data.current_holder.avatar_url} /> :
                                        <Avatar icon={<UserOutlined />} />
                                }
                                title={item.data.display_title}
                                description={
                                    item.data.current_holder
                                        ? `${item.data.current_holder.rank?.abbreviation} ${item.data.current_holder.username}`
                                        : 'Position Vacant'
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

// Wrapper component with ReactFlowProvider
const AdvancedORBATViewWrapper = (props) => {
    return (
        <ReactFlowProvider>
            <AdvancedORBATView {...props} />
        </ReactFlowProvider>
    );
};

export default AdvancedORBATViewWrapper;