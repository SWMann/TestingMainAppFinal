// src/components/pages/ORBAT/ORBATStatisticsPanel.js
import React, { useMemo } from 'react';
import {
    TrendingUp, Users, UserCheck, UserX, Award, Shield, Star,
    Target, BarChart, PieChart, Activity, Briefcase, Crown
} from 'lucide-react';

const ORBATStatisticsPanel = ({ orbatData, unit }) => {
    const statistics = useMemo(() => {
        if (!orbatData || !orbatData.nodes) return null;

        const nodes = orbatData.nodes;
        const total = nodes.length;
        const filled = nodes.filter(n => !n.is_vacant).length;
        const vacant = nodes.filter(n => n.is_vacant).length;
        const fillRate = total > 0 ? Math.round((filled / total) * 100) : 0;

        // Position type breakdown
        const positionTypes = {
            command: nodes.filter(n => n.position_type === 'command').length,
            staff: nodes.filter(n => n.position_type === 'staff').length,
            nco: nodes.filter(n => n.position_type === 'nco').length,
            specialist: nodes.filter(n => n.position_type === 'specialist').length,
            standard: nodes.filter(n => n.position_type === 'standard').length
        };

        // Rank distribution
        const rankDistribution = {};
        nodes.filter(n => !n.is_vacant && n.current_holder?.rank?.abbreviation).forEach(n => {
            const rank = n.current_holder.rank.abbreviation;
            rankDistribution[rank] = (rankDistribution[rank] || 0) + 1;
        });

        // Unit breakdown
        const unitBreakdown = {};
        nodes.forEach(n => {
            const unitName = n.unit_info?.abbreviation || 'Unknown';
            unitBreakdown[unitName] = (unitBreakdown[unitName] || 0) + 1;
        });

        return {
            total,
            filled,
            vacant,
            fillRate,
            positionTypes,
            rankDistribution,
            unitBreakdown
        };
    }, [orbatData]);

    if (!statistics) return null;

    const getStatusColor = (rate) => {
        if (rate >= 90) return '#39FF14';
        if (rate >= 75) return '#E4D00A';
        if (rate >= 50) return '#FF6B35';
        return '#FF4444';
    };

    const getPositionTypeIcon = (type) => {
        const icons = {
            command: <Crown size={16} />,
            staff: <Briefcase size={16} />,
            nco: <Shield size={16} />,
            specialist: <Star size={16} />,
            standard: <Users size={16} />
        };
        return icons[type] || icons.standard;
    };

    return (
        <div className="orbat-statistics-panel">
            <div className="stats-header">
                <h3 className="stats-title">
                    <BarChart size={20} />
                    ORBAT Statistics
                </h3>
                {unit && (
                    <div className="unit-badge">
                        <Shield size={16} />
                        {unit.abbreviation}
                    </div>
                )}
            </div>

            <div className="stats-content">
                {/* Primary Statistics */}
                <div className="stats-section primary-stats">
                    <div className="stat-card total">
                        <div className="stat-icon">
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{statistics.total}</div>
                            <div className="stat-label">Total Positions</div>
                        </div>
                    </div>

                    <div className="stat-card filled">
                        <div className="stat-icon">
                            <UserCheck size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{statistics.filled}</div>
                            <div className="stat-label">Filled</div>
                        </div>
                    </div>

                    <div className="stat-card vacant">
                        <div className="stat-icon">
                            <UserX size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{statistics.vacant}</div>
                            <div className="stat-label">Vacant</div>
                        </div>
                    </div>

                    <div className="stat-card fill-rate">
                        <div className="stat-icon">
                            <Activity size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value" style={{ color: getStatusColor(statistics.fillRate) }}>
                                {statistics.fillRate}%
                            </div>
                            <div className="stat-label">Fill Rate</div>
                        </div>
                    </div>
                </div>

                {/* Fill Rate Progress */}
                <div className="stats-section">
                    <h4 className="section-title">Unit Readiness</h4>
                    <div className="fill-rate-container">
                        <div className="fill-rate-bar">
                            <div
                                className="fill-rate-progress"
                                style={{
                                    width: `${statistics.fillRate}%`,
                                    backgroundColor: getStatusColor(statistics.fillRate)
                                }}
                            />
                        </div>
                        <div className="fill-rate-labels">
                            <span>0%</span>
                            <span className="rate-status" style={{ color: getStatusColor(statistics.fillRate) }}>
                                {statistics.fillRate >= 90 ? 'Excellent' :
                                    statistics.fillRate >= 75 ? 'Good' :
                                        statistics.fillRate >= 50 ? 'Fair' : 'Critical'}
                            </span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* Position Type Breakdown */}
                <div className="stats-section">
                    <h4 className="section-title">
                        <PieChart size={16} />
                        Position Types
                    </h4>
                    <div className="position-type-breakdown">
                        {Object.entries(statistics.positionTypes).map(([type, count]) => (
                            count > 0 && (
                                <div key={type} className="position-type-item">
                                    <div className="type-info">
                                        {getPositionTypeIcon(type)}
                                        <span className="type-name">
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </span>
                                    </div>
                                    <div className="type-stats">
                                        <span className="type-count">{count}</span>
                                        <span className="type-percentage">
                                            ({Math.round((count / statistics.total) * 100)}%)
                                        </span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* Rank Distribution */}
                {Object.keys(statistics.rankDistribution).length > 0 && (
                    <div className="stats-section">
                        <h4 className="section-title">
                            <Award size={16} />
                            Rank Distribution
                        </h4>
                        <div className="rank-distribution">
                            {Object.entries(statistics.rankDistribution)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([rank, count]) => (
                                    <div key={rank} className="rank-item">
                                        <span className="rank-name">{rank}</span>
                                        <div className="rank-bar">
                                            <div
                                                className="rank-fill"
                                                style={{
                                                    width: `${(count / statistics.filled) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="rank-count">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="stats-section">
                    <h4 className="section-title">Quick Insights</h4>
                    <div className="quick-insights">
                        {statistics.fillRate < 75 && (
                            <div className="insight-item warning">
                                <Target size={16} />
                                <span>Unit is below 75% strength</span>
                            </div>
                        )}
                        {statistics.positionTypes.command > 0 &&
                            nodes.filter(n => n.position_type === 'command' && n.is_vacant).length > 0 && (
                                <div className="insight-item critical">
                                    <Crown size={16} />
                                    <span>Command positions vacant</span>
                                </div>
                            )}
                        {statistics.vacant > statistics.filled && (
                            <div className="insight-item warning">
                                <Activity size={16} />
                                <span>More vacant than filled positions</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ORBATStatisticsPanel;