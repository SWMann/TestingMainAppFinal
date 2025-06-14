// src/components/UnitHierarchy/EdgeTypes/EdgeMarkers.jsx
import React from 'react';

/**
 * Custom SVG marker definitions for different edge types
 * These should be included in your React Flow component
 */
const EdgeMarkers = () => {
    return (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
                {/* Command Edge Marker - Filled Arrow */}
                <marker
                    id="command-arrow"
                    viewBox="0 0 20 20"
                    refX="20"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <path
                        d="M 0 5 L 10 10 L 0 15 L 3 10 z"
                        fill="#4a5d23"
                        stroke="#4a5d23"
                        strokeWidth="1"
                    />
                </marker>

                {/* Command Edge Marker - Selected */}
                <marker
                    id="command-arrow-selected"
                    viewBox="0 0 20 20"
                    refX="20"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <path
                        d="M 0 5 L 10 10 L 0 15 L 3 10 z"
                        fill="#ffd700"
                        stroke="#ffd700"
                        strokeWidth="1"
                    />
                </marker>

                {/* Support Edge Marker - Open Arrow */}
                <marker
                    id="support-arrow"
                    viewBox="0 0 20 20"
                    refX="20"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <path
                        d="M 0 5 L 10 10 L 0 15"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                    />
                </marker>

                {/* Support Edge Marker - Selected */}
                <marker
                    id="support-arrow-selected"
                    viewBox="0 0 20 20"
                    refX="20"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <path
                        d="M 0 5 L 10 10 L 0 15"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="2"
                    />
                </marker>

                {/* Coordination Edge Marker - Circle */}
                <marker
                    id="coordination-arrow"
                    viewBox="0 0 20 20"
                    refX="20"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <circle
                        cx="10"
                        cy="10"
                        r="4"
                        fill="#f59e0b"
                        stroke="#f59e0b"
                        strokeWidth="1"
                    />
                </marker>

                {/* Coordination Edge Marker - Selected */}
                <marker
                    id="coordination-arrow-selected"
                    viewBox="0 0 20 20"
                    refX="20"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <circle
                        cx="10"
                        cy="10"
                        r="5"
                        fill="#fbbf24"
                        stroke="#fbbf24"
                        strokeWidth="1"
                    />
                </marker>

                {/* Administrative Edge Marker - Square */}
                <marker
                    id="admin-arrow"
                    viewBox="0 0 20 20"
                    refX="20"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <rect
                        x="6"
                        y="6"
                        width="8"
                        height="8"
                        fill="#8b5cf6"
                        stroke="#8b5cf6"
                        strokeWidth="1"
                        transform="rotate(45 10 10)"
                    />
                </marker>

                {/* Operational Edge Marker - Double Arrow */}
                <marker
                    id="operational-arrow"
                    viewBox="0 0 20 20"
                    refX="20"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <path
                        d="M 0 7 L 7 10 L 0 13 M 7 7 L 14 10 L 7 13"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                    />
                </marker>
            </defs>
        </svg>
    );
};

export default EdgeMarkers;