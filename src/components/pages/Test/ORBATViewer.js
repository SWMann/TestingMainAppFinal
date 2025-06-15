// src/components/pages/ORBATPage/ORBATPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './ORBATPage.css';
import SimpleORBATWrapper from "./SmartORBATLoader";

const ORBATPage = () => {
    const { unitId } = useParams();
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [selectedUnitId, setSelectedUnitId] = useState(unitId || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (unitId) {
            setSelectedUnitId(unitId);
        }
    }, [unitId]);

    const fetchUnits = async () => {
        try {
            const response = await api.get('/units/orbat/units_list/');
            setUnits(response.data);

            // If no unit selected and we have units, select the first one
            if (!unitId && response.data.length > 0) {
                const firstUnit = response.data[0];
                setSelectedUnitId(firstUnit.id);
            }
        } catch (err) {
            console.error('Error fetching units:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnitChange = (event) => {
        const newUnitId = event.target.value;
        setSelectedUnitId(newUnitId);
        navigate(`/units/${newUnitId}/orbat`);
    };

    return (
        <div className="orbat-page">
            <div className="orbat-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <h1>Organizational Structure (ORBAT)</h1>

                <div className="unit-selector">
                    <label>Select Unit:</label>
                    <select
                        value={selectedUnitId}
                        onChange={handleUnitChange}
                        disabled={loading}
                    >
                        <option value="">-- Select a Unit --</option>
                        {units.map(unit => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name} ({unit.abbreviation})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="orbat-content">
                {selectedUnitId ? (
                    <SimpleORBATWrapper unitId={selectedUnitId} />
                ) : (
                    <div className="no-unit-selected">
                        Please select a unit to view its organizational structure
                    </div>
                )}
            </div>
        </div>
    );
};

export default ORBATPage;