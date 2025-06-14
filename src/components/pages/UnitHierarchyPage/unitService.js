// src/services/unitService.js

import api from "../../../services/api";

export const unitService = {
    /**
     * Get all units
     */
    getUnits: (params = {}) => {
        return api.get('/units/', { params });
    },

    /**
     * Get a specific unit by ID
     */
    getUnit: (id) => {
        return api.get(`/units/${id}/`);
    },

    /**
     * Create a new unit
     */
    createUnit: (data) => {
        return api.post('/units/', data);
    },

    /**
     * Update a unit
     */
    updateUnit: (id, data) => {
        return api.patch(`/units/${id}/`, data);
    },

    /**
     * Delete a unit
     */
    deleteUnit: (id) => {
        return api.delete(`/units/${id}/`);
    },

    /**
     * Get unit members
     */
    getUnitMembers: (unitId) => {
        return api.get(`/units/${unitId}/members/`);
    },

    /**
     * Get unit positions
     */
    getUnitPositions: (unitId) => {
        return api.get(`/units/${unitId}/positions/`);
    },

    /**
     * Get unit events
     */
    getUnitEvents: (unitId) => {
        return api.get(`/units/${unitId}/events/`);
    },

    /**
     * Get unit hierarchy (subunits)
     */
    getUnitHierarchy: (unitId) => {
        return api.get(`/units/${unitId}/hierarchy/`);
    },

    /**
     * Get full unit structure (all units in tree format)
     */
    getUnitStructure: () => {
        return api.get('/units/structure/');
    },

    /**
     * Get all branches
     */
    getBranches: () => {
        return api.get('/units/branches/');
    },

    /**
     * Get a specific branch
     */
    getBranch: (id) => {
        return api.get(`/units/branches/${id}/`);
    },

    /**
     * Get units for a specific branch
     */
    getBranchUnits: (branchId) => {
        return api.get(`/units/branches/${branchId}/units/`);
    },

    /**
     * Get ranks for a specific branch
     */
    getBranchRanks: (branchId) => {
        return api.get(`/units/branches/${branchId}/ranks/`);
    },

    /**
     * Get unit statistics
     */
    getUnitStatistics: (unitId) => {
        return api.get(`/units/${unitId}/statistics/`);
    },

    /**
     * Get unit readiness report
     */
    getUnitReadiness: (unitId) => {
        return api.get(`/units/${unitId}/readiness/`);
    },

    /**
     * Transfer member between units
     */
    transferMember: (fromUnitId, toUnitId, userId, data) => {
        return api.post(`/units/${fromUnitId}/transfer_member/`, {
            to_unit: toUnitId,
            user: userId,
            ...data
        });
    },

    /**
     * Bulk assign members to unit
     */
    bulkAssignMembers: (unitId, userIds) => {
        return api.post(`/units/${unitId}/bulk_assign/`, {
            user_ids: userIds
        });
    },

    /**
     * Get unit activity log
     */
    getUnitActivity: (unitId, params = {}) => {
        return api.get(`/units/${unitId}/activity/`, { params });
    },

    /**
     * Get unit documents
     */
    getUnitDocuments: (unitId) => {
        return api.get(`/units/${unitId}/documents/`);
    },

    /**
     * Upload unit document
     */
    uploadUnitDocument: (unitId, file, metadata) => {
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        return api.post(`/units/${unitId}/documents/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * Get unit's chain of command
     */
    getChainOfCommand: (unitId) => {
        return api.get(`/units/${unitId}/chain_of_command/`);
    },

    /**
     * Get unit equipment/assets
     */
    getUnitAssets: (unitId) => {
        return api.get(`/units/${unitId}/assets/`);
    },

    /**
     * Search units
     */
    searchUnits: (query, params = {}) => {
        return api.get('/units/search/', {
            params: {
                q: query,
                ...params
            }
        });
    },

    /**
     * Get unit types
     */
    getUnitTypes: () => {
        return api.get('/units/types/');
    },

    /**
     * Merge units
     */
    mergeUnits: (sourceUnitId, targetUnitId) => {
        return api.post(`/units/${sourceUnitId}/merge/`, {
            target_unit: targetUnitId
        });
    },

    /**
     * Split unit
     */
    splitUnit: (unitId, splitConfig) => {
        return api.post(`/units/${unitId}/split/`, splitConfig);
    },

    /**
     * Get unit announcements
     */
    getUnitAnnouncements: (unitId) => {
        return api.get(`/units/${unitId}/announcements/`);
    },

    /**
     * Create unit announcement
     */
    createUnitAnnouncement: (unitId, data) => {
        return api.post(`/units/${unitId}/announcements/`, data);
    },

    /**
     * Get unit calendar
     */
    getUnitCalendar: (unitId, params = {}) => {
        return api.get(`/units/${unitId}/calendar/`, { params });
    },

    /**
     * Export unit roster
     */
    exportUnitRoster: (unitId, format = 'csv') => {
        return api.get(`/units/${unitId}/export_roster/`, {
            params: { format },
            responseType: 'blob'
        });
    },

    /**
     * Get unit metrics over time
     */
    getUnitMetrics: (unitId, params = {}) => {
        return api.get(`/units/${unitId}/metrics/`, { params });
    },

    /**
     * Update unit emblem
     */
    updateUnitEmblem: (unitId, file) => {
        const formData = new FormData();
        formData.append('emblem', file);

        return api.patch(`/units/${unitId}/emblem/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * Get unit permissions for current user
     */
    getUnitPermissions: (unitId) => {
        return api.get(`/units/${unitId}/permissions/`);
    },

    /**
     * Request unit access
     */
    requestUnitAccess: (unitId, reason) => {
        return api.post(`/units/${unitId}/request_access/`, { reason });
    },

    /**
     * Get pending access requests (for unit admins)
     */
    getAccessRequests: (unitId) => {
        return api.get(`/units/${unitId}/access_requests/`);
    },

    /**
     * Approve/deny access request
     */
    handleAccessRequest: (unitId, requestId, approved, reason = '') => {
        return api.post(`/units/${unitId}/access_requests/${requestId}/`, {
            approved,
            reason
        });
    }
};