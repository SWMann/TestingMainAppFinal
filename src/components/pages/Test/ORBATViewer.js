// src/components/pages/ORBATView/ORBATView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Select, Button, Space, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import SmartORBATLoader from "./SmartORBATLoader";

const { Option } = Select;

const ORBATView = () => {
    const { unitId } = useParams();
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [selectedUnitId, setSelectedUnitId] = useState(unitId || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unitInfo, setUnitInfo] = useState(null);

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        // Update selected unit when URL param changes
        if (unitId) {
            setSelectedUnitId(unitId);
            fetchUnitInfo(unitId);
        }
    }, [unitId]);

    const fetchUnits = async () => {
        try {
            const response = await api.get('/units/');
            setUnits(response.data.results || response.data);

            // If no unit is selected and we have units, select the first top-level unit
            if (!unitId && response.data.length > 0) {
                const topLevelUnit = response.data.find(u => !u.parent_unit) || response.data[0];
                if (topLevelUnit) {
                    setSelectedUnitId(topLevelUnit.id);
                    fetchUnitInfo(topLevelUnit.id);
                }
            }
        } catch (err) {
            console.error('Error fetching units:', err);
            setError('Failed to load units');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnitInfo = async (unitId) => {
        try {
            const response = await api.get(`/units/${unitId}/`);
            setUnitInfo(response.data);
        } catch (err) {
            console.error('Error fetching unit info:', err);
        }
    };

    const handleUnitChange = (value) => {
        setSelectedUnitId(value);
        navigate(`/units/${value}/orbat`);
        fetchUnitInfo(value);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Loading units..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => window.location.reload()}>
                            Reload
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!selectedUnitId) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="No Unit Selected"
                    description="Please select a unit to view its organizational structure."
                    type="info"
                    showIcon
                />
                <Card style={{ marginTop: '20px' }}>
                    <Select
                        placeholder="Select a unit to view ORBAT"
                        style={{ width: '100%' }}
                        onChange={handleUnitChange}
                        showSearch
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {units.map(unit => (
                            <Option key={unit.id} value={unit.id}>
                                {unit.name} ({unit.abbreviation})
                            </Option>
                        ))}
                    </Select>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#fff',
                padding: '16px 24px',
                borderBottom: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                            >
                                Back
                            </Button>
                            <h2 style={{ margin: 0 }}>
                                <TeamOutlined /> ORBAT Viewer
                            </h2>
                        </Space>

                        <Space>
                            <span>Unit:</span>
                            <Select
                                value={selectedUnitId}
                                onChange={handleUnitChange}
                                style={{ width: '300px' }}
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {units.map(unit => (
                                    <Option key={unit.id} value={unit.id}>
                                        {unit.name} ({unit.abbreviation})
                                    </Option>
                                ))}
                            </Select>
                        </Space>
                    </Space>

                    {unitInfo && (
                        <div style={{ marginTop: '12px', color: '#666' }}>
                            <Space>
                                <span><strong>Type:</strong> {unitInfo.unit_type}</span>
                                <span><strong>Branch:</strong> {unitInfo.branch_name}</span>
                                {unitInfo.commander && (
                                    <span><strong>Commander:</strong> {unitInfo.commander.rank} {unitInfo.commander.username}</span>
                                )}
                            </Space>
                        </div>
                    )}
                </div>
            </div>

            {/* ORBAT Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {selectedUnitId && <SmartORBATLoader unitId={selectedUnitId} />}
            </div>
        </div>
    );
};

export default ORBATView;