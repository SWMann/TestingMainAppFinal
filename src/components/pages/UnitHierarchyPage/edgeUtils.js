// src/components/UnitHierarchy/utils/edgeUtils.js

/**
 * Get the appropriate marker ID based on edge type and selection state
 */
export const getEdgeMarker = (edgeType, isSelected = false) => {
    const markerMap = {
        command: isSelected ? 'command-arrow-selected' : 'command-arrow',
        support: isSelected ? 'support-arrow-selected' : 'support-arrow',
        coordination: isSelected ? 'coordination-arrow-selected' : 'coordination-arrow',
        administrative: 'admin-arrow',
        operational: 'operational-arrow',
    };

    return `url(#${markerMap[edgeType] || markerMap.command})`;
};

/**
 * Get edge style configuration based on type
 */
export const getEdgeStyle = (edgeType, isSelected = false) => {
    const baseStyle = {
        strokeWidth: isSelected ? 3 : 2,
        transition: 'all 0.2s ease',
    };

    const styleMap = {
        command: {
            ...baseStyle,
            stroke: isSelected ? '#ffd700' : '#4a5d23',
        },
        support: {
            ...baseStyle,
            stroke: isSelected ? '#60a5fa' : '#3b82f6',
            strokeDasharray: '8 4',
        },
        coordination: {
            ...baseStyle,
            stroke: isSelected ? '#fbbf24' : '#f59e0b',
            strokeDasharray: '12 6',
        },
        administrative: {
            ...baseStyle,
            stroke: isSelected ? '#a78bfa' : '#8b5cf6',
            strokeDasharray: '4 4',
        },
        operational: {
            ...baseStyle,
            stroke: isSelected ? '#34d399' : '#10b981',
            strokeDasharray: '16 4',
        },
    };

    return styleMap[edgeType] || styleMap.command;
};

/**
 * Get edge label configuration
 */
export const getEdgeLabel = (edgeType, customLabel) => {
    const labelMap = {
        command: 'Commands',
        support: 'Supports',
        coordination: 'Coordinates with',
        administrative: 'Admin control',
        operational: 'Operational control',
    };

    return customLabel || labelMap[edgeType] || '';
};

/**
 * Parse edge metadata for additional information
 */
export const parseEdgeMetadata = (edge) => {
    const metadata = edge.data || {};

    return {
        label: getEdgeLabel(edge.type, metadata.label),
        priority: metadata.priority || 'normal',
        supportType: metadata.supportType,
        metadata: metadata.description,
        strength: metadata.strength || 'primary',
        bidirectional: metadata.bidirectional || false,
    };
};

/**
 * Create edge configuration for React Flow
 */
export const createEdgeConfig = (source, target, type = 'command', additionalData = {}) => {
    const id = `edge-${source}-${target}-${type}`;

    return {
        id,
        source: source.toString(),
        target: target.toString(),
        type,
        animated: type === 'operational' || additionalData.animated,
        style: getEdgeStyle(type),
        markerEnd: getEdgeMarker(type),
        data: {
            label: getEdgeLabel(type, additionalData.label),
            ...additionalData,
        },
    };
};

/**
 * Validate edge connection rules
 */
export const validateEdgeConnection = (source, target, edgeType) => {
    // Add business rules for valid connections
    const rules = {
        command: {
            // Command relationships should follow hierarchy
            validate: (sourceNode, targetNode) => {
                // Example: Check if source is higher in hierarchy
                return true; // Implement actual validation
            },
        },
        support: {
            // Support can be between any units
            validate: () => true,
        },
        coordination: {
            // Coordination typically between same-level units
            validate: (sourceNode, targetNode) => {
                // Example: Check if units are at same level
                return true; // Implement actual validation
            },
        },
    };

    const validator = rules[edgeType]?.validate || (() => true);
    return validator(source, target);
};

/**
 * Group edges by type for visualization
 */
export const groupEdgesByType = (edges) => {
    return edges.reduce((groups, edge) => {
        const type = edge.type || 'command';
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(edge);
        return groups;
    }, {});
};

/**
 * Calculate edge routing to avoid overlaps
 */
export const calculateEdgeRouting = (edges, nodes) => {
    // Simple offset calculation for parallel edges
    const edgeGroups = {};

    edges.forEach(edge => {
        const key = `${edge.source}-${edge.target}`;
        const reverseKey = `${edge.target}-${edge.source}`;

        if (!edgeGroups[key]) {
            edgeGroups[key] = [];
        }

        // Check for bidirectional edges
        if (edgeGroups[reverseKey]) {
            edge.data = {
                ...edge.data,
                offset: 20,
            };
        }

        edgeGroups[key].push(edge);
    });

    return edges;
};