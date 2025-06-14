// src/components/UnitHierarchy/UnitHierarchyView.jsx
import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UnitHierarchyFlow from './UnitHierarchyFlow';
import ViewSelector from './ViewSelector';
import HierarchyControls from './HierarchyControls';
import { hierarchyService } from './hierarchyService';
import './UnitHierarchy.css';
import 'reactflow/dist/style.css';

const UnitHierarchyView = () => {
    const { viewId } = useParams();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const [currentViewId, setCurrentViewId] = useState(viewId);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [filterConfig, setFilterConfig] = useState({
        showVacant: true,
        showPersonnelCount: true,
        unitTypes: [],
        branches: []
    });

    useEffect(() => {
        // If no viewId provided, load default view
        if (!currentViewId) {
            loadDefaultView();
        }
    }, [currentViewId]);

    const loadDefaultView = async () => {
        try {
            const response = await hierarchyService.getDefaultView();
            setCurrentViewId(response.data.id);
            navigate(`/units/hierarchy/${response.data.id}`, { replace: true });
        } catch (error) {
            console.error('Failed to load default view:', error);
        }
    };

    const handleViewChange = (newViewId) => {
        setCurrentViewId(newViewId);
        navigate(`/units/hierarchy/${newViewId}`);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className={`unit-hierarchy-page ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="hierarchy-header">
                <div className="header-left">
                    <h1>Unit Hierarchy</h1>
                    <ViewSelector
                        currentView={currentViewId}
                        onViewChange={handleViewChange}
                        isAdmin={user?.is_admin}
                    />
                </div>
                <div className="header-right">
                    <HierarchyControls
                        filterConfig={filterConfig}
                        onFilterChange={setFilterConfig}
                        onFullscreen={toggleFullscreen}
                        isFullscreen={isFullscreen}
                        viewId={currentViewId}
                        isAdmin={user?.is_admin}
                    />
                </div>
            </div>

            <div className="hierarchy-content">
                {currentViewId && (
                    <ReactFlowProvider>
                        <UnitHierarchyFlow
                            viewId={currentViewId}
                            filterConfig={filterConfig}
                            isAdmin={user?.is_admin}
                        />
                    </ReactFlowProvider>
                )}
            </div>
        </div>
    );
};

export default UnitHierarchyView;