import React, { useState, useEffect } from 'react';
import {
    X, Shield, Building, FileText, MapPin, Calendar, Flag,
    User, Search, Briefcase, Plus, Trash2, GitBranch
} from 'lucide-react';
import './AdminModals.css';
import api from "../../services/api";


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
                        <span className="node-meta">{unit.abbreviation} - {unit.unit_type}</span>
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