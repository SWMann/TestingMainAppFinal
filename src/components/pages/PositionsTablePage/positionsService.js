// positionsService.js - Service layer for positions data
import api from '../../../services/api';

class PositionsService {
    /**
     * Fetch all positions with their assignments
     * @returns {Promise<Array>} Array of positions with expanded details
     */
    static async getAllPositions() {
        try {
            const response = await api.get('/units/positions/');
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching positions:', error);
            throw error;
        }
    }

    /**
     * Fetch positions for a specific unit
     * @param {string} unitId - UUID of the unit
     * @returns {Promise<Array>} Array of positions for the unit
     */
    static async getUnitPositions(unitId) {
        try {
            const response = await api.get(`/units/${unitId}/positions/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching unit positions:', error);
            throw error;
        }
    }

    /**
     * Fetch all units with their hierarchical structure
     * @returns {Promise<Array>} Array of units with parent/child relationships
     */
    static async getAllUnitsWithHierarchy() {
        try {
            const response = await api.get('/units/');
            const units = response.data.results || response.data;

            // Build hierarchical structure
            return this.buildUnitHierarchy(units);
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    }

    /**
     * Build hierarchical unit structure from flat array
     * @param {Array} units - Flat array of units
     * @returns {Array} Hierarchical unit structure
     */
    static buildUnitHierarchy(units) {
        const unitMap = {};
        const rootUnits = [];

        // First pass: create unit map
        units.forEach(unit => {
            unitMap[unit.id] = {
                ...unit,
                children: []
            };
        });

        // Second pass: build hierarchy
        units.forEach(unit => {
            if (unit.parent_unit && unitMap[unit.parent_unit]) {
                unitMap[unit.parent_unit].children.push(unitMap[unit.id]);
            } else {
                rootUnits.push(unitMap[unit.id]);
            }
        });

        return rootUnits;
    }

    /**
     * Fetch positions and units data combined
     * @returns {Promise<Object>} Combined data with units and positions
     */
    static async getPositionsTableData() {
        try {
            const [units, positions, branches] = await Promise.all([
                this.getAllUnitsWithHierarchy(),
                this.getAllPositions(),
                api.get('/units/branches/').then(res => res.data.results || res.data)
            ]);

            // Map positions to their units
            const positionsByUnit = {};
            positions.forEach(position => {
                if (!positionsByUnit[position.unit]) {
                    positionsByUnit[position.unit] = [];
                }
                positionsByUnit[position.unit].push(position);
            });

            // Add positions to units
            const addPositionsToUnits = (unitArray) => {
                unitArray.forEach(unit => {
                    unit.positions = positionsByUnit[unit.id] || [];
                    if (unit.children) {
                        addPositionsToUnits(unit.children);
                    }
                });
            };

            addPositionsToUnits(units);

            return {
                units,
                positions,
                branches,
                stats: {
                    totalUnits: Object.keys(unitMap).length,
                    totalPositions: positions.length,
                    filledPositions: positions.filter(p => !p.is_vacant).length,
                    vacantPositions: positions.filter(p => p.is_vacant).length
                }
            };
        } catch (error) {
            console.error('Error fetching positions table data:', error);
            throw error;
        }
    }

    /**
     * Get user's current position
     * @param {string} userId - User UUID
     * @returns {Promise<Object|null>} User's primary position or null
     */
    static async getUserPrimaryPosition(userId) {
        try {
            const response = await api.get(`/users/${userId}/positions/`);
            const positions = response.data;

            // Find primary active position
            return positions.find(p =>
                p.status === 'active' &&
                p.assignment_type === 'primary'
            ) || null;
        } catch (error) {
            console.error('Error fetching user position:', error);
            return null;
        }
    }

    /**
     * Search positions by query
     * @param {string} query - Search query
     * @returns {Promise<Array>} Filtered positions
     */
    static async searchPositions(query) {
        try {
            const response = await api.get('/units/positions/', {
                params: { search: query }
            });
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error searching positions:', error);
            throw error;
        }
    }

    /**
     * Get chain of command for a position
     * @param {string} positionId - Position UUID
     * @returns {Promise<Object>} Chain of command data
     */
    static async getPositionChainOfCommand(positionId) {
        try {
            const response = await api.get(`/units/positions/${positionId}/chain_of_command/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chain of command:', error);
            throw error;
        }
    }

    /**
     * Export positions data to CSV
     * @param {Array} units - Hierarchical units array with positions
     * @returns {string} CSV formatted string
     */
    static exportToCSV(units) {
        const headers = ['Position', 'Role', 'Current Holder', 'Service Number', 'Unit', 'Branch', 'Status'];
        const rows = [headers];

        const extractPositions = (unit, unitPath = '') => {
            const currentPath = unitPath ? `${unitPath} > ${unit.name}` : unit.name;

            unit.positions?.forEach(position => {
                rows.push([
                    position.display_title || position.title || 'Unknown',
                    position.role_name || 'Unknown',
                    position.is_vacant ? 'VACANT' :
                        position.current_holder ?
                            `${position.current_holder.rank || ''} ${position.current_holder.username}`.trim() :
                            'Unknown',
                    position.current_holder?.service_number || '-',
                    unit.abbreviation || unit.name,
                    unit.branch_name || '-',
                    position.is_vacant ? 'Vacant' : 'Filled'
                ]);
            });

            unit.children?.forEach(child => extractPositions(child, currentPath));
        };

        units.forEach(unit => extractPositions(unit));

        // Convert to CSV format
        return rows.map(row =>
            row.map(cell =>
                // Escape cells containing commas or quotes
                cell.toString().includes(',') || cell.toString().includes('"')
                    ? `"${cell.toString().replace(/"/g, '""')}"`
                    : cell
            ).join(',')
        ).join('\n');
    }
}

export default PositionsService;