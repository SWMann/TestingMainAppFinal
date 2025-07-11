import React, { useState, useEffect } from 'react';
import {
    X, Shield, Building, FileText, MapPin, Calendar, Flag,
    User, Search, Briefcase, Plus, Trash2, GitBranch
} from 'lucide-react';
import './AdminModals.css';
import api from "../../services/api";

// Helper function to format unit type for display
const formatUnitType = (unitType) => {
    if (!unitType) return '';

    // Handle legacy format (e.g., "Corps", "Division")
    if (!unitType.includes('_')) return unitType;

    // Handle new format (e.g., "navy_fleet", "ground_division")
    const [category, ...typeParts] = unitType.split('_');
    const type = typeParts.join(' ');

    const categoryLabels = {
        'navy': 'Navy',
        'aviation': 'Naval Aviation',
        'ground': 'Ground'
    };

    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const formattedCategory = categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);

    return `${formattedCategory}: ${formattedType}`;
};

export const UnitHierarchyModal = ({ unit, onClose }) => {
    const [hierarchyData, setHierarchyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHierarchy();
    }, []);

    const fetchHierarchy = async () => {
        try {
            const endpoint = unit ? `/units/${unit.id}/hierarchy/` : '/units/structure/';
            const response = await api.get(endpoint);
            setHierarchyData(response.data);
        } catch (error) {
            console.error('Error fetching hierarchy:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderUnitNode = (unit, level = 0) => {
        return (
            <div key={unit.id} className="hierarchy-node" style={{ marginLeft: `${level * 30}px` }}>
                <div className="node-content">
                    {unit.emblem_url && (
                        <img src={unit.emblem_url} alt="" className="node-emblem" />
                    )}
                    <div className="node-info">
                        <h5>{unit.name}</h5>
                        <span className="node-meta">{unit.abbreviation} - {formatUnitType(unit.unit_type)}</span>
                    </div>
                </div>
                {unit.subunits && unit.subunits.length > 0 && (
                    <div className="subunits">
                        {unit.subunits.map(subunit => renderUnitNode(subunit, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container large">
                <div className="modal-header">
                    <h2>
                        <GitBranch size={24} />
                        Unit Hierarchy {unit ? `- ${unit.name}` : '- Full Structure'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content hierarchy-view">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading hierarchy...</p>
                        </div>
                    ) : hierarchyData ? (
                        <div className="hierarchy-tree">
                            {Array.isArray(hierarchyData) ? (
                                hierarchyData.map(unit => renderUnitNode(unit))
                            ) : (
                                renderUnitNode(hierarchyData)
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <GitBranch size={48} />
                            <p>No hierarchy data available</p>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};