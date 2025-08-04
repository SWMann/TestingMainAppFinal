import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Shield, Star, Users, Briefcase, Award,
    Search, Plus, Edit, BarChart,
    AlertCircle, ChevronDown, ChevronUp, Info,
    Target, Zap, Globe, Building, UserCheck
} from 'lucide-react';
import api from "../../../services/api";
import './RoleListPage.css';

function RoleListPage() {
    // Navigation and auth
    const navigate = useNavigate();
    const currentUser = useSelector(state => state.auth?.user);
    const isAdmin = currentUser?.is_admin || false;

    // State management
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [expandedRole, setExpandedRole] = useState(null);
    const [roleStatistics, setRoleStatistics] = useState({});
    const [loadingStats, setLoadingStats] = useState({});

    // Role categories
    const categories = [
        { value: 'all', label: 'All Categories', icon: Globe },
        { value: 'command', label: 'Command', icon: Star },
        { value: 'staff', label: 'Staff', icon: Users },
        { value: 'nco', label: 'NCO', icon: Shield },
        { value: 'specialist', label: 'Specialist', icon: Award },
        { value: 'trooper', label: 'Trooper', icon: Target },
        { value: 'support', label: 'Support', icon: Building },
        { value: 'medical', label: 'Medical', icon: Plus },
        { value: 'logistics', label: 'Logistics', icon: Building },
        { value: 'intelligence', label: 'Intelligence', icon: Info },
        { value: 'communications', label: 'Communications', icon: Globe },
        { value: 'aviation', label: 'Aviation', icon: Zap },
        { value: 'armor', label: 'Armor', icon: Shield },
        { value: 'infantry', label: 'Infantry', icon: Target }
    ];

    // Role types
    const roleTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'command', label: 'Command Roles' },
        { value: 'staff', label: 'Staff Roles' },
        { value: 'nco', label: 'NCO Roles' },
        { value: 'specialist', label: 'Specialist Roles' }
    ];

    // Fetch roles on mount
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/units/roles/');
            const rolesData = response.data?.results || response.data || [];
            setRoles(rolesData);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleStatistics = async (roleId) => {
        try {
            setLoadingStats(prev => ({ ...prev, [roleId]: true }));
            const response = await api.get(`/units/roles/${roleId}/statistics/`);
            setRoleStatistics(prev => ({ ...prev, [roleId]: response.data }));
        } catch (error) {
            console.error('Error fetching role statistics:', error);
            setRoleStatistics(prev => ({
                ...prev,
                [roleId]: {
                    total_positions: 0,
                    filled_positions: 0,
                    vacant_positions: 0,
                    fill_rate: 0,
                    unit_distribution: [],
                    rank_distribution: []
                }
            }));
        } finally {
            setLoadingStats(prev => ({ ...prev, [roleId]: false }));
        }
    };

    const handleExpandRole = (roleId) => {
        if (expandedRole === roleId) {
            setExpandedRole(null);
        } else {
            setExpandedRole(roleId);
            if (!roleStatistics[roleId]) {
                fetchRoleStatistics(roleId);
            }
        }
    };

    // Filter roles
    const filteredRoles = roles.filter(role => {
        const matchesSearch =
            role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || role.category === selectedCategory;

        const matchesType = selectedType === 'all' ||
            (selectedType === 'command' && role.is_command_role) ||
            (selectedType === 'staff' && role.is_staff_role) ||
            (selectedType === 'nco' && role.is_nco_role) ||
            (selectedType === 'specialist' && role.is_specialist_role);

        return matchesSearch && matchesCategory && matchesType;
    });

    // Group roles by category
    const groupedRoles = filteredRoles.reduce((acc, role) => {
        const category = role.category || 'other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(role);
        return acc;
    }, {});

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.value === category);
        return cat ? cat.icon : Globe;
    };

    // Calculate statistics
    const totalPositions = roles.reduce((sum, role) => sum + (role.positions_count || 0), 0);
    const filledPositions = roles.reduce((sum, role) => sum + (role.filled_positions_count || 0), 0);
    const fillRate = totalPositions > 0 ? Math.round((filledPositions / totalPositions) * 100) : 0;

    return (
        <div className="role-list-container">
            {/* Header */}
            <div className="role-list-header">
                <div className="header-content">
                    <div>
                        <h1>
                            <Shield size={36} />
                            ROLE DIRECTORY
                        </h1>
                        <p className="header-subtitle">Military Occupational Roles and Positions</p>
                    </div>
                    {isAdmin && (
                        <div className="header-actions">
                            <button
                                className="btn primary"
                                onClick={() => navigate('/admin/roles/create')}
                            >
                                <Plus size={18} />
                                CREATE ROLE
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search roles by name, code, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            {roleTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="statistics-overview">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{roles.length}</div>
                        <div className="stat-label">Total Roles</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{totalPositions}</div>
                        <div className="stat-label">Total Positions</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{filledPositions}</div>
                        <div className="stat-label">Filled Positions</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <BarChart size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{fillRate}%</div>
                        <div className="stat-label">Fill Rate</div>
                    </div>
                </div>
            </div>

            {/* Roles List */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>LOADING ROLE DATABASE...</p>
                </div>
            ) : Object.keys(groupedRoles).length === 0 ? (
                <div className="empty-state">
                    <AlertCircle size={48} />
                    <h3>No Roles Found</h3>
                    <p>No roles match your current filters.</p>
                </div>
            ) : (
                <div className="roles-content">
                    {Object.entries(groupedRoles).map(([category, categoryRoles]) => {
                        const CategoryIcon = getCategoryIcon(category);
                        return (
                            <div key={category} className="category-section">
                                <div className="category-header">
                                    <CategoryIcon size={20} />
                                    <h2>{category.replace(/_/g, ' ').toUpperCase()}</h2>
                                    <span className="category-count">{categoryRoles.length} roles</span>
                                </div>

                                <div className="roles-grid">
                                    {categoryRoles.map(role => (
                                        <RoleCard
                                            key={role.id}
                                            role={role}
                                            expanded={expandedRole === role.id}
                                            onExpand={() => handleExpandRole(role.id)}
                                            statistics={roleStatistics[role.id]}
                                            loadingStats={loadingStats[role.id]}
                                            isAdmin={isAdmin}
                                            navigate={navigate}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Role Card Component
function RoleCard({ role, expanded, onExpand, statistics, loadingStats, isAdmin, navigate }) {
    const fillRate = (role.positions_count || 0) > 0
        ? Math.round(((role.filled_positions_count || 0) / role.positions_count) * 100)
        : 0;

    return (
        <div className={`role-card ${expanded ? 'expanded' : ''}`}>
            <div className="role-header" onClick={onExpand}>
                <div className="role-main-info">
                    <div className="role-title-section">
                        <h3>{role.name}</h3>
                        {role.abbreviation && (
                            <span className="role-code">{role.abbreviation}</span>
                        )}
                    </div>
                    <div className="role-badges">
                        {role.is_command_role && (
                            <span className="role-badge command">
                                <Star size={14} />
                                COMMAND
                            </span>
                        )}
                        {role.is_staff_role && (
                            <span className="role-badge staff">
                                <Users size={14} />
                                STAFF
                            </span>
                        )}
                        {role.is_nco_role && (
                            <span className="role-badge nco">
                                <Shield size={14} />
                                NCO
                            </span>
                        )}
                        {role.is_specialist_role && (
                            <span className="role-badge specialist">
                                <Award size={14} />
                                SPECIALIST
                            </span>
                        )}
                    </div>
                </div>

                <div className="role-quick-stats">
                    <div className="quick-stat">
                        <span className="stat-label">Positions</span>
                        <span className="stat-value">
                            {role.filled_positions_count || 0}/{role.positions_count || 0}
                        </span>
                    </div>
                    <div className="quick-stat">
                        <span className="stat-label">Fill Rate</span>
                        <span className="stat-value">{fillRate}%</span>
                    </div>
                </div>

                <button className="expand-button">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {role.description && (
                <p className="role-description">{role.description}</p>
            )}

            {/* Rank Requirements */}
            <RoleRequirements role={role} />

            {/* Expanded Content */}
            {expanded && (
                <RoleExpandedContent
                    role={role}
                    statistics={statistics}
                    loadingStats={loadingStats}
                    isAdmin={isAdmin}
                    navigate={navigate}
                />
            )}
        </div>
    );
}

// Role Requirements Component
function RoleRequirements({ role }) {
    const requirements = [];

    if (role.min_rank_details || role.min_rank) {
        requirements.push({
            label: 'Min Rank',
            value: `${role.min_rank_details?.abbreviation || role.min_rank?.abbreviation || ''} - ${role.min_rank_details?.name || role.min_rank?.name || ''}`
        });
    }

    if (role.typical_rank_details || role.typical_rank) {
        requirements.push({
            label: 'Typical',
            value: `${role.typical_rank_details?.abbreviation || role.typical_rank?.abbreviation || ''} - ${role.typical_rank_details?.name || role.typical_rank?.name || ''}`
        });
    }

    if (role.max_rank_details || role.max_rank) {
        requirements.push({
            label: 'Max Rank',
            value: `${role.max_rank_details?.abbreviation || role.max_rank?.abbreviation || ''} - ${role.max_rank_details?.name || role.max_rank?.name || ''}`
        });
    }

    if (role.min_time_in_service > 0) {
        requirements.push({
            label: 'TIS',
            value: `${role.min_time_in_service} days`
        });
    }

    if (role.min_time_in_grade > 0) {
        requirements.push({
            label: 'TIG',
            value: `${role.min_time_in_grade} days`
        });
    }

    if (role.min_operations_count > 0) {
        requirements.push({
            label: 'Ops Count',
            value: `${role.min_operations_count} minimum`
        });
    }

    if (requirements.length === 0) return null;

    return (
        <div className="role-requirements">
            {requirements.map((req, idx) => (
                <div key={idx} className="requirement-item">
                    <span className="requirement-label">{req.label}:</span>
                    <span className="requirement-value">{req.value}</span>
                </div>
            ))}
        </div>
    );
}

// Role Expanded Content Component
function RoleExpandedContent({ role, statistics, loadingStats, isAdmin, navigate }) {
    return (
        <div className="role-expanded-content">
            <div className="expanded-section">
                <h4>
                    <BarChart size={16} />
                    Statistics
                </h4>
                {loadingStats ? (
                    <div className="loading-stats">
                        <div className="spinner small"></div>
                        <p>Loading statistics...</p>
                    </div>
                ) : statistics ? (
                    <div className="statistics-content">
                        <div className="stat-grid">
                            <div className="detailed-stat">
                                <span className="label">Total Positions</span>
                                <span className="value">{statistics.total_positions || 0}</span>
                            </div>
                            <div className="detailed-stat">
                                <span className="label">Filled</span>
                                <span className="value success">{statistics.filled_positions || 0}</span>
                            </div>
                            <div className="detailed-stat">
                                <span className="label">Vacant</span>
                                <span className="value warning">{statistics.vacant_positions || 0}</span>
                            </div>
                            <div className="detailed-stat">
                                <span className="label">Fill Rate</span>
                                <span className="value">{statistics.fill_rate || 0}%</span>
                            </div>
                        </div>

                        {statistics.unit_distribution && statistics.unit_distribution.length > 0 && (
                            <DistributionChart
                                title="Unit Distribution"
                                data={statistics.unit_distribution}
                                totalKey="total_positions"
                                total={statistics.total_positions}
                                labelKey="unit__unit_type"
                            />
                        )}

                        {statistics.rank_distribution && statistics.rank_distribution.length > 0 && (
                            <DistributionChart
                                title="Rank Distribution"
                                data={statistics.rank_distribution}
                                totalKey="filled_positions"
                                total={statistics.filled_positions}
                                labelKey="user__current_rank__abbreviation"
                                nameKey="user__current_rank__name"
                            />
                        )}
                    </div>
                ) : (
                    <p className="no-stats">No statistics available</p>
                )}
            </div>

            <div className="role-actions">
                <button
                    className="btn secondary"
                    onClick={() => navigate(`/roles/${role.id}/positions`)}
                >
                    <Users size={16} />
                    View Positions
                </button>
                <button
                    className="btn secondary"
                    onClick={() => navigate(`/roles/${role.id}/eligible-users`)}
                >
                    <UserCheck size={16} />
                    Eligible Users
                </button>
                {isAdmin && (
                    <button
                        className="btn secondary"
                        onClick={() => navigate(`/admin/roles/${role.id}/edit`)}
                    >
                        <Edit size={16} />
                        Edit Role
                    </button>
                )}
            </div>
        </div>
    );
}

// Distribution Chart Component
function DistributionChart({ title, data, totalKey, total, labelKey, nameKey }) {
    return (
        <div className="unit-distribution">
            <h5>{title}</h5>
            {data.map((item, idx) => {
                const label = nameKey && item[nameKey]
                    ? `${item[labelKey] || 'Unknown'} - ${item[nameKey]}`
                    : item[labelKey] || 'Unknown';

                const percentage = total > 0 ? (item.count / total) * 100 : 0;

                return (
                    <div key={idx} className="distribution-item">
                        <span className="unit-type">{label}</span>
                        <div className="distribution-bar">
                            <div
                                className="bar-fill"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <span className="count">{item.count}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default RoleListPage;