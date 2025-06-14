// src/components/pages/UnitHierarchyPage/hierarchyTransformers.js

/**
 * Transform unit data from API to React Flow nodes format
 */
export const transformNodesToReactFlow = (units, positions = {}) => {
    // Ensure units is an array
    const unitsArray = Array.isArray(units) ? units : [];

    if (unitsArray.length === 0) {
        console.warn('No units provided to transformNodesToReactFlow');
        return [];
    }

    return unitsArray.map(unit => {
        const nodeId = unit.id ? unit.id.toString() : '';
        const position = positions[nodeId] || calculateDefaultPosition(unit, unitsArray);

        return {
            id: nodeId,
            type: 'unitNode',
            position: {
                x: position.x || 0,
                y: position.y || 0
            },
            data: {
                ...unit,
                id: unit.id,
                label: unit.name || 'Unnamed Unit',
                // Transform positions to include current holder info
                positions: Array.isArray(unit.positions) ? unit.positions.map(pos => ({
                    ...pos,
                    current_holder: pos.is_vacant ? null : {
                        id: pos.current_holder?.id,
                        username: pos.current_holder?.username,
                        rank: pos.current_holder?.rank
                    }
                })) : []
            },
            style: {
                width: 320,
                padding: 0,
                borderRadius: '8px',
                border: `2px solid ${unit.branch_color || '#4a5d23'}`
            },
            draggable: true,
            selectable: true,
            connectable: true
        };
    });
};

/**
 * Transform edge data from API to React Flow edges format
 */
export const transformEdgesToReactFlow = (edges) => {
    // Ensure edges is an array
    const edgesArray = Array.isArray(edges) ? edges : [];

    if (edgesArray.length === 0) {
        console.warn('No edges provided to transformEdgesToReactFlow');
        return [];
    }

    return edgesArray.map(edge => {
        const edgeType = edge.type || edge.relationship_type || 'command';
        return {
            ...edge,
            id: edge.id || `edge-${edge.source}-${edge.target}`,
            source: edge.source ? edge.source.toString() : '',
            target: edge.target ? edge.target.toString() : '',
            type: edgeType,
            animated: edge.animated || false,
            style: {
                stroke: getEdgeColor(edgeType),
                strokeWidth: 2,
                ...(edge.style || {})
            },
            data: {
                label: edge.label || getEdgeLabel(edgeType),
                ...(edge.data || {})
            }
        };
    });
};

/**
 * Calculate default position for a unit node based on hierarchy
 */
const calculateDefaultPosition = (unit, allUnits) => {
    const HORIZONTAL_SPACING = 400;
    const VERTICAL_SPACING = 200;

    // Find unit's level in hierarchy
    const level = getUnitLevel(unit, allUnits);

    // Find unit's position among siblings
    const siblings = allUnits.filter(u => u.parent_unit_id === unit.parent_unit_id);
    const siblingIndex = siblings.findIndex(u => u.id === unit.id);

    // Calculate position
    const x = siblingIndex * HORIZONTAL_SPACING - ((siblings.length - 1) * HORIZONTAL_SPACING) / 2;
    const y = level * VERTICAL_SPACING;

    return { x, y };
};

/**
 * Get the hierarchical level of a unit
 */
const getUnitLevel = (unit, allUnits) => {
    let level = 0;
    let currentUnit = unit;

    while (currentUnit && currentUnit.parent_unit_id) {
        level++;
        currentUnit = allUnits.find(u => u.id === currentUnit.parent_unit_id);
        if (!currentUnit || level > 10) break; // Prevent infinite loops
    }

    return level;
};

/**
 * Get edge color based on relationship type
 */
const getEdgeColor = (type) => {
    const colors = {
        command: '#4a5d23',
        support: '#3b82f6',
        coordination: '#f59e0b',
        administrative: '#8b5cf6',
        operational: '#10b981'
    };
    return colors[type] || '#999';
};

/**
 * Get edge label based on relationship type
 */
const getEdgeLabel = (type) => {
    const labels = {
        command: 'Commands',
        support: 'Supports',
        coordination: 'Coordinates',
        administrative: 'Admin',
        operational: 'Operational'
    };
    return labels[type] || '';
};

/**
 * Build edges from unit parent-child relationships
 */
export const buildHierarchyEdges = (units) => {
    const edges = [];

    // Ensure units is an array
    const unitsArray = Array.isArray(units) ? units : [];

    unitsArray.forEach(unit => {
        if (unit.parent_unit_id) {
            edges.push({
                id: `e${unit.parent_unit_id}-${unit.id}`,
                source: unit.parent_unit_id.toString(),
                target: unit.id.toString(),
                type: 'command',
                animated: false
            });
        }
    });

    return edges;
};

/**
 * Filter nodes based on filter configuration
 */
export const filterNodes = (nodes, filterConfig) => {
    if (!Array.isArray(nodes)) {
        return [];
    }

    return nodes.map(node => {
        let hidden = false;

        // Filter by unit type
        if (filterConfig.unitTypes && filterConfig.unitTypes.length > 0) {
            hidden = !filterConfig.unitTypes.includes(node.data.unit_type);
        }

        // Filter by branch
        if (!hidden && filterConfig.branches && filterConfig.branches.length > 0) {
            hidden = !filterConfig.branches.includes(node.data.branch_name);
        }

        return {
            ...node,
            hidden,
            data: {
                ...node.data,
                showVacant: filterConfig.showVacant !== false,
                showPersonnelCount: filterConfig.showPersonnelCount !== false
            }
        };
    });
};

/**
 * Calculate layout for nodes using different algorithms
 */
export const calculateLayout = (nodes, edges, layoutType = 'hierarchical') => {
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        return nodes || [];
    }

    switch (layoutType) {
        case 'hierarchical':
            return calculateHierarchicalLayout(nodes, edges);
        case 'radial':
            return calculateRadialLayout(nodes, edges);
        case 'force':
            return calculateForceLayout(nodes, edges);
        default:
            return nodes;
    }
};

/**
 * Calculate hierarchical layout (top-down tree)
 */
const calculateHierarchicalLayout = (nodes, edges) => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const levels = new Map();
    const HORIZONTAL_SPACING = 350;
    const VERTICAL_SPACING = 180;

    // Build adjacency list
    const children = new Map();
    edges.forEach(edge => {
        if (!children.has(edge.source)) {
            children.set(edge.source, []);
        }
        children.get(edge.source).push(edge.target);
    });

    // Find root nodes (nodes with no incoming edges)
    const roots = nodes.filter(node =>
        !edges.some(edge => edge.target === node.id)
    );

    // Calculate levels using BFS
    const queue = roots.map(root => ({ id: root.id, level: 0 }));
    const visited = new Set();

    while (queue.length > 0) {
        const { id, level } = queue.shift();

        if (visited.has(id)) continue;
        visited.add(id);

        if (!levels.has(level)) {
            levels.set(level, []);
        }
        levels.get(level).push(id);

        const nodeChildren = children.get(id) || [];
        nodeChildren.forEach(childId => {
            if (!visited.has(childId)) {
                queue.push({ id: childId, level: level + 1 });
            }
        });
    }

    // Position nodes
    const positionedNodes = nodes.map(node => {
        let x = 0;
        let y = 0;

        // Find node's level
        for (const [level, nodeIds] of levels.entries()) {
            const index = nodeIds.indexOf(node.id);
            if (index !== -1) {
                y = level * VERTICAL_SPACING;
                const levelWidth = nodeIds.length * HORIZONTAL_SPACING;
                x = index * HORIZONTAL_SPACING - levelWidth / 2 + HORIZONTAL_SPACING / 2;
                break;
            }
        }

        return {
            ...node,
            position: { x, y }
        };
    });

    return positionedNodes;
};

/**
 * Calculate radial layout
 */
const calculateRadialLayout = (nodes, edges) => {
    // Implementation for radial layout
    // This would arrange nodes in concentric circles
    console.log('Radial layout not yet implemented');
    return nodes;
};

/**
 * Calculate force-directed layout
 */
const calculateForceLayout = (nodes, edges) => {
    // Implementation for force-directed layout
    // This would use physics simulation to position nodes
    console.log('Force layout not yet implemented');
    return nodes;
};

/**
 * Export hierarchy to different formats
 */
export const exportHierarchy = (nodes, edges, format = 'json') => {
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        return null;
    }

    switch (format) {
        case 'json':
            return JSON.stringify({ nodes, edges }, null, 2);
        case 'csv':
            return exportToCSV(nodes);
        case 'graphml':
            return exportToGraphML(nodes, edges);
        default:
            return null;
    }
};

/**
 * Export nodes to CSV format
 */
const exportToCSV = (nodes) => {
    const headers = ['ID', 'Name', 'Abbreviation', 'Type', 'Branch', 'Personnel Count', 'Commander'];
    const rows = nodes.map(node => [
        node.id,
        node.data.name || '',
        node.data.abbreviation || '',
        node.data.unit_type || '',
        node.data.branch_name || '',
        node.data.personnel_count || 0,
        node.data.commander ? `${node.data.commander.rank} ${node.data.commander.username}` : 'Vacant'
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    return csv;
};

/**
 * Export to GraphML format
 */
const exportToGraphML = (nodes, edges) => {
    // Implementation for GraphML export
    // This would create an XML format suitable for other graph tools
    console.log('GraphML export not yet implemented');
    return '';
};

/**
 * Validate hierarchy structure
 */
export const validateHierarchy = (nodes, edges) => {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        errors.push('Invalid nodes or edges data');
        return { errors, warnings, isValid: false };
    }

    // Check for cycles
    if (hasCycles(nodes, edges)) {
        errors.push('Hierarchy contains circular references');
    }

    // Check for orphaned nodes
    const orphans = findOrphanedNodes(nodes, edges);
    if (orphans.length > 0) {
        warnings.push(`Found ${orphans.length} orphaned units`);
    }

    // Check for duplicate edges
    const duplicates = findDuplicateEdges(edges);
    if (duplicates.length > 0) {
        warnings.push(`Found ${duplicates.length} duplicate relationships`);
    }

    return { errors, warnings, isValid: errors.length === 0 };
};

/**
 * Check if the graph has cycles
 */
const hasCycles = (nodes, edges) => {
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycleDFS = (nodeId) => {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const outgoingEdges = edges.filter(e => e.source === nodeId);

        for (const edge of outgoingEdges) {
            if (!visited.has(edge.target)) {
                if (hasCycleDFS(edge.target)) {
                    return true;
                }
            } else if (recursionStack.has(edge.target)) {
                return true;
            }
        }

        recursionStack.delete(nodeId);
        return false;
    };

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            if (hasCycleDFS(node.id)) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Find nodes with no connections
 */
const findOrphanedNodes = (nodes, edges) => {
    const connectedNodes = new Set();

    edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    });

    return nodes.filter(node => !connectedNodes.has(node.id));
};

/**
 * Find duplicate edges
 */
const findDuplicateEdges = (edges) => {
    const seen = new Set();
    const duplicates = [];

    edges.forEach(edge => {
        const key = `${edge.source}-${edge.target}-${edge.type}`;
        if (seen.has(key)) {
            duplicates.push(edge);
        }
        seen.add(key);
    });

    return duplicates;
};

/**
 * Get nodes at a specific hierarchical level
 */
export const getNodesAtLevel = (nodes, edges, level) => {
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        return [];
    }

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const levelNodes = [];

    nodes.forEach(node => {
        if (getNodeLevel(node, edges, nodeMap) === level) {
            levelNodes.push(node);
        }
    });

    return levelNodes;
};

/**
 * Get the level of a specific node
 */
const getNodeLevel = (node, edges, nodeMap) => {
    let level = 0;
    let currentNodeId = node.id;

    while (currentNodeId) {
        const parentEdge = edges.find(e => e.target === currentNodeId);
        if (!parentEdge) break;

        level++;
        currentNodeId = parentEdge.source;

        if (level > 20) break; // Prevent infinite loops
    }

    return level;
};

/**
 * Find all descendants of a node
 */
export const findDescendants = (nodeId, edges) => {
    if (!Array.isArray(edges)) {
        return [];
    }

    const descendants = [];
    const queue = [nodeId];
    const visited = new Set();

    while (queue.length > 0) {
        const currentId = queue.shift();

        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const children = edges
            .filter(e => e.source === currentId)
            .map(e => e.target);

        descendants.push(...children);
        queue.push(...children);
    }

    return descendants;
};

/**
 * Find all ancestors of a node
 */
export const findAncestors = (nodeId, edges) => {
    if (!Array.isArray(edges)) {
        return [];
    }

    const ancestors = [];
    let currentId = nodeId;

    while (currentId) {
        const parentEdge = edges.find(e => e.target === currentId);
        if (!parentEdge) break;

        ancestors.push(parentEdge.source);
        currentId = parentEdge.source;

        if (ancestors.length > 20) break; // Prevent infinite loops
    }

    return ancestors;
};