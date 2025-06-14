// src/services/positionService.js
import api from './api';

export const positionService = {
    /**
     * Get all positions
     */
    getPositions: (params = {}) => {
        return api.get('/units/positions/', { params });
    },

    /**
     * Get a specific position by ID
     */
    getPosition: (id) => {
        return api.get(`/units/positions/${id}/`);
    },

    /**
     * Create a new position
     */
    createPosition: (data) => {
        return api.post('/units/positions/', data);
    },

    /**
     * Update a position
     */
    updatePosition: (id, data) => {
        return api.patch(`/units/positions/${id}/`, data);
    },

    /**
     * Delete a position
     */
    deletePosition: (id) => {
        return api.delete(`/units/positions/${id}/`);
    },

    /**
     * Assign a user to a position
     */
    assignUser: (positionId, data) => {
        return api.post(`/units/positions/${positionId}/assign/`, data);
    },

    /**
     * Vacate a position
     */
    vacatePosition: (positionId, data = {}) => {
        return api.post(`/units/positions/${positionId}/vacate/`, data);
    },

    /**
     * Get position assignment history
     */
    getPositionHistory: (positionId, params = {}) => {
        return api.get(`/units/positions/${positionId}/history/`, { params });
    },

    /**
     * Get chain of command for a position
     */
    getChainOfCommand: (positionId) => {
        return api.get(`/units/positions/${positionId}/chain_of_command/`);
    },

    /**
     * Get all users assigned to a position
     */
    getPositionUsers: (positionId) => {
        return api.get(`/units/positions/${positionId}/users/`);
    },

    /**
     * Transfer position to another unit
     */
    transferPosition: (positionId, newUnitId) => {
        return api.post(`/units/positions/${positionId}/transfer/`, {
            new_unit: newUnitId
        });
    },

    /**
     * Get eligible users for a position
     */
    getEligibleUsers: (positionId) => {
        return api.get(`/units/positions/${positionId}/eligible_users/`);
    },

    /**
     * Check if a user meets position requirements
     */
    checkEligibility: (positionId, userId) => {
        return api.get(`/units/positions/${positionId}/check_eligibility/`, {
            params: { user_id: userId }
        });
    },

    /**
     * Update position requirements
     */
    updateRequirements: (positionId, requirements) => {
        return api.post(`/units/positions/${positionId}/requirements/`, requirements);
    },

    /**
     * Get position statistics
     */
    getPositionStatistics: (positionId) => {
        return api.get(`/units/positions/${positionId}/statistics/`);
    },

    /**
     * Clone a position
     */
    clonePosition: (positionId, data) => {
        return api.post(`/units/positions/${positionId}/clone/`, data);
    },

    /**
     * Bulk create positions
     */
    bulkCreatePositions: (data) => {
        return api.post('/units/positions/bulk_create/', data);
    },

    /**
     * Search positions
     */
    searchPositions: (query, params = {}) => {
        return api.get('/units/positions/search/', {
            params: {
                q: query,
                ...params
            }
        });
    },

    /**
     * Get vacant positions
     */
    getVacantPositions: (params = {}) => {
        return api.get('/units/positions/vacant/', { params });
    },

    /**
     * Get positions by role
     */
    getPositionsByRole: (roleId) => {
        return api.get('/units/positions/', {
            params: { role: roleId }
        });
    },

    /**
     * Request position assignment
     */
    requestAssignment: (positionId, data) => {
        return api.post(`/units/positions/${positionId}/request_assignment/`, data);
    },

    /**
     * Get assignment requests for a position
     */
    getAssignmentRequests: (positionId) => {
        return api.get(`/units/positions/${positionId}/assignment_requests/`);
    },

    /**
     * Approve/deny assignment request
     */
    handleAssignmentRequest: (positionId, requestId, approved, reason = '') => {
        return api.post(`/units/positions/${positionId}/assignment_requests/${requestId}/`, {
            approved,
            reason
        });
    },

    /**
     * Set position as primary for user
     */
    setPrimaryPosition: (positionId, userId) => {
        return api.post(`/units/positions/${positionId}/set_primary/`, {
            user_id: userId
        });
    },

    /**
     * Get position permissions
     */
    getPositionPermissions: (positionId) => {
        return api.get(`/units/positions/${positionId}/permissions/`);
    },

    /**
     * Update position permissions
     */
    updatePositionPermissions: (positionId, permissions) => {
        return api.post(`/units/positions/${positionId}/permissions/`, permissions);
    },

    /**
     * Get position activity log
     */
    getPositionActivity: (positionId, params = {}) => {
        return api.get(`/units/positions/${positionId}/activity/`, { params });
    },

    /**
     * Export position data
     */
    exportPositionData: (positionId, format = 'json') => {
        return api.get(`/units/positions/${positionId}/export/`, {
            params: { format },
            responseType: format === 'json' ? 'json' : 'blob'
        });
    },

    /**
     * Get position metrics
     */
    getPositionMetrics: (positionId, params = {}) => {
        return api.get(`/units/positions/${positionId}/metrics/`, { params });
    },

    /**
     * Update position order/hierarchy
     */
    updatePositionOrder: (positionId, parentPositionId, order) => {
        return api.post(`/units/positions/${positionId}/update_order/`, {
            parent_position: parentPositionId,
            order
        });
    },

    /**
     * Get all roles
     */
    getRoles: (params = {}) => {
        return api.get('/units/roles/', { params });
    },

    /**
     * Get a specific role
     */
    getRole: (id) => {
        return api.get(`/units/roles/${id}/`);
    },

    /**
     * Get positions for a role
     */
    getRolePositions: (roleId) => {
        return api.get(`/units/roles/${roleId}/positions/`);
    },

    /**
     * Get eligible users for a role
     */
    getRoleEligibleUsers: (roleId) => {
        return api.get(`/units/roles/${roleId}/eligible_users/`);
    },

    /**
     * Get role statistics
     */
    getRoleStatistics: (roleId) => {
        return api.get(`/units/roles/${roleId}/statistics/`);
    },

    /**
     * Create temporary assignment
     */
    createTemporaryAssignment: (positionId, data) => {
        return api.post(`/units/positions/${positionId}/temporary_assignment/`, data);
    },

    /**
     * End temporary assignment
     */
    endTemporaryAssignment: (positionId, assignmentId) => {
        return api.post(`/units/positions/${positionId}/end_temporary_assignment/`, {
            assignment_id: assignmentId
        });
    },

    /**
     * Get succession plan for position
     */
    getSuccessionPlan: (positionId) => {
        return api.get(`/units/positions/${positionId}/succession_plan/`);
    },

    /**
     * Update succession plan
     */
    updateSuccessionPlan: (positionId, successors) => {
        return api.post(`/units/positions/${positionId}/succession_plan/`, {
            successors
        });
    }
};