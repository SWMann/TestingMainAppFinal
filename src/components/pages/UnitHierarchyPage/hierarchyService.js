// src/services/hierarchyService.js

import api from "../../../services/api";

export const hierarchyService = {
    /**
     * Get all hierarchy views
     */
    getViews: () => {
        return api.get('/units/hierarchy/');
    },

    /**
     * Get the default hierarchy view
     */
    getDefaultView: () => {
        return api.get('/units/hierarchy/default/');
    },

    /**
     * Get a specific hierarchy view
     */
    getView: (id) => {
        return api.get(`/units/hierarchy/${id}/`);
    },

    /**
     * Get hierarchy data for a view (nodes, edges, positions)
     */
    getViewData: (id) => {
        return api.get(`/units/hierarchy/${id}/data/`);
    },

    /**
     * Create a new hierarchy view
     */
    createView: (data) => {
        return api.post('/units/hierarchy/', data);
    },

    /**
     * Update an existing hierarchy view
     */
    updateView: (id, data) => {
        return api.patch(`/units/hierarchy/${id}/`, data);
    },

    /**
     * Delete a hierarchy view
     */
    deleteView: (id) => {
        return api.delete(`/units/hierarchy/${id}/`);
    },

    /**
     * Save node positions for a hierarchy view
     */
    savePositions: (viewId, positions) => {
        return api.post(`/units/hierarchy/${viewId}/save_positions/`, {
            positions
        });
    },

    /**
     * Update layout configuration for a view
     */
    updateLayout: (viewId, layoutConfig) => {
        return api.post(`/units/hierarchy/${viewId}/update_layout/`, {
            layout_config: layoutConfig
        });
    },

    /**
     * Clone an existing view
     */
    cloneView: (viewId, newName) => {
        return api.post(`/units/hierarchy/${viewId}/clone/`, {
            name: newName
        });
    },

    /**
     * Set a view as default
     */
    setDefaultView: (viewId) => {
        return api.post(`/units/hierarchy/${viewId}/set_default/`);
    },

    /**
     * Get available unit types for filtering
     */
    getUnitTypes: () => {
        return api.get('/units/hierarchy/unit_types/');
    },

    /**
     * Export hierarchy view
     */
    exportView: (viewId, format = 'json') => {
        return api.get(`/units/hierarchy/${viewId}/export/`, {
            params: { format },
            responseType: format === 'json' ? 'json' : 'blob'
        });
    },

    /**
     * Get hierarchy statistics
     */
    getStatistics: (viewId) => {
        return api.get(`/units/hierarchy/${viewId}/statistics/`);
    },

    /**
     * Validate hierarchy structure
     */
    validateHierarchy: (viewId) => {
        return api.get(`/units/hierarchy/${viewId}/validate/`);
    },

    /**
     * Get user's recent views
     */
    getRecentViews: () => {
        return api.get('/units/hierarchy/recent/');
    },

    /**
     * Get shared views (public views from other users)
     */
    getSharedViews: () => {
        return api.get('/units/hierarchy/shared/');
    },

    /**
     * Share a view with specific users
     */
    shareView: (viewId, userIds) => {
        return api.post(`/units/hierarchy/${viewId}/share/`, {
            user_ids: userIds
        });
    },

    /**
     * Get view permissions
     */
    getViewPermissions: (viewId) => {
        return api.get(`/units/hierarchy/${viewId}/permissions/`);
    },

    /**
     * Update view permissions
     */
    updateViewPermissions: (viewId, permissions) => {
        return api.post(`/units/hierarchy/${viewId}/permissions/`, permissions);
    },

    /**
     * Get view change history
     */
    getViewHistory: (viewId) => {
        return api.get(`/units/hierarchy/${viewId}/history/`);
    },

    /**
     * Restore view to a previous version
     */
    restoreViewVersion: (viewId, versionId) => {
        return api.post(`/units/hierarchy/${viewId}/restore/`, {
            version_id: versionId
        });
    },

    /**
     * Search units within a view
     */
    searchUnitsInView: (viewId, query) => {
        return api.get(`/units/hierarchy/${viewId}/search/`, {
            params: { q: query }
        });
    },

    /**
     * Get recommended views based on user's role/unit
     */
    getRecommendedViews: () => {
        return api.get('/units/hierarchy/recommended/');
    },

    /**
     * Batch update multiple node positions
     */
    batchUpdatePositions: (viewId, updates) => {
        return api.post(`/units/hierarchy/${viewId}/batch_update_positions/`, {
            updates
        });
    },

    /**
     * Auto-layout nodes using a specific algorithm
     */
    autoLayout: (viewId, algorithm = 'hierarchical', options = {}) => {
        return api.post(`/units/hierarchy/${viewId}/auto_layout/`, {
            algorithm,
            options
        });
    },

    /**
     * Get view templates
     */
    getTemplates: () => {
        return api.get('/units/hierarchy/templates/');
    },

    /**
     * Create view from template
     */
    createFromTemplate: (templateId, data) => {
        return api.post(`/units/hierarchy/templates/${templateId}/create/`, data);
    },

    /**
     * Subscribe to view updates
     */
    subscribeToView: (viewId) => {
        return api.post(`/units/hierarchy/${viewId}/subscribe/`);
    },

    /**
     * Unsubscribe from view updates
     */
    unsubscribeFromView: (viewId) => {
        return api.post(`/units/hierarchy/${viewId}/unsubscribe/`);
    }
};