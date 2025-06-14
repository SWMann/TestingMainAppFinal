// src/components/UnitHierarchy/Controls/HierarchyToolbar.jsx
import React from 'react';
import { Panel, useReactFlow } from 'reactflow';
import {
    Minimize2,
    RefreshCw,
    Download,
    Save
} from 'lucide-react';
import { hierarchyService } from './hierarchyService';
import { toast } from 'react-toastify';

const HierarchyToolbar = ({ viewId, isAdmin, isSaving, onSavingChange }) => {
    const reactFlowInstance = useReactFlow();

    const handleFitView = () => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    };

    const handleResetView = () => {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 });
    };

    const handleExport = () => {
        // Get the current viewport
        const viewport = reactFlowInstance.getViewport();
        const nodes = reactFlowInstance.getNodes();

        // Create SVG export
        toast.info('Export feature coming soon');

        // In a full implementation, you would:
        // 1. Convert the React Flow canvas to SVG
        // 2. Download as image or PDF
    };

    const handleSavePositions = async () => {
        if (!isAdmin) return;

        onSavingChange(true);
        const nodes = reactFlowInstance.getNodes();

        const positions = nodes.reduce((acc, node) => {
            acc[node.id] = {
                x: node.position.x,
                y: node.position.y
            };
            return acc;
        }, {});

        try {
            await hierarchyService.savePositions(viewId, positions);
            toast.success('Node positions saved successfully');
        } catch (error) {
            toast.error('Failed to save positions');
            console.error(error);
        } finally {
            onSavingChange(false);
        }
    };

    return (
        <Panel position="top-center" className="hierarchy-toolbar">
            <div className="toolbar-container">
                <button
                    className="toolbar-button"
                    onClick={handleFitView}
                    title="Fit to View"
                >
                    <Minimize2 size={16} />
                    <span>Fit View</span>
                </button>

                <button
                    className="toolbar-button"
                    onClick={handleResetView}
                    title="Reset View"
                >
                    <RefreshCw size={16} />
                    <span>Reset</span>
                </button>

                <button
                    className="toolbar-button"
                    onClick={handleExport}
                    title="Export View"
                >
                    <Download size={16} />
                    <span>Export</span>
                </button>

                {isAdmin && (
                    <button
                        className={`toolbar-button ${isSaving ? 'saving' : ''}`}
                        onClick={handleSavePositions}
                        disabled={isSaving}
                        title="Save Node Positions"
                    >
                        {isSaving ? (
                            <>
                                <div className="spinner-tiny"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Save Layout</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </Panel>
    );
};

export default HierarchyToolbar;