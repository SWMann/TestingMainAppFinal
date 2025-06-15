// src/services/orbatService.js

import api from "../../../services/api";

class ORBATService {
    /**
     * Get ORBAT data for a specific unit
     * @param {string} unitId - Unit UUID
     * @param {boolean} includeSubunits - Include sub-unit positions
     * @returns {Promise} ORBAT data with nodes and edges
     */
    async getUnitORBAT(unitId, includeSubunits = true) {
        const response = await api.get('/units/orbat/unit_orbat/', {
            params: {
                unit_id: unitId,
                include_subunits: includeSubunits
            }
        });
        return response.data;
    }

    /**
     * Get complete organizational ORBAT
     * @returns {Promise} Full ORBAT data
     */
    async getFullORBAT() {
        const response = await api.get('/units/orbat/full_orbat/');
        return response.data;
    }

    /**
     * Save manual position coordinates
     * @param {string} positionId - Position UUID
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Promise}
     */
    async savePositionCoordinates(positionId, x, y) {
        const response = await api.patch(`/units/positions/${positionId}/`, {
            manual_x: x,
            manual_y: y
        });
        return response.data;
    }

    /**
     * Update position's parent (for drag-and-drop reorganization)
     * @param {string} positionId - Position UUID
     * @param {string} newParentId - New parent position UUID
     * @returns {Promise}
     */
    async updatePositionParent(positionId, newParentId) {
        const response = await api.patch(`/units/positions/${positionId}/`, {
            parent_position: newParentId
        });
        return response.data;
    }

    /**
     * Get position details with full expansion
     * @param {string} positionId - Position UUID
     * @returns {Promise}
     */
    async getPositionDetails(positionId) {
        const response = await api.get(`/units/positions/${positionId}/`);
        return response.data;
    }

    /**
     * Get chain of command for a position
     * @param {string} positionId - Position UUID
     * @returns {Promise}
     */
    async getPositionChainOfCommand(positionId) {
        const response = await api.get(`/units/positions/${positionId}/chain_of_command/`);
        return response.data;
    }

    /**
     * Export ORBAT as image (requires additional backend implementation)
     * @param {object} reactFlowInstance - React Flow instance
     * @returns {Promise<Blob>}
     */
    async exportAsImage(reactFlowInstance) {
        // This would require implementing html2canvas or similar
        // on the frontend and potentially a backend endpoint
        // for PDF generation
        throw new Error('Not implemented yet');
    }

    /**
     * Search positions within ORBAT
     * @param {string} query - Search query
     * @param {object} filters - Additional filters
     * @returns {Promise}
     */
    async searchPositions(query, filters = {}) {
        const response = await api.get('/units/positions/', {
            params: {
                search: query,
                ...filters
            }
        });
        return response.data;
    }
}

export default new ORBATService();