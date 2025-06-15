// src/components/pages/ORBAT/utils/exportUtils.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Export ORBAT data in various formats
 */
export const exportORBAT = {
    /**
     * Export as PNG image
     */
    async toPNG(elementId, filename = 'orbat-chart') {
        try {
            const element = document.getElementById(elementId);
            if (!element) throw new Error('Element not found');

            const canvas = await html2canvas(element, {
                backgroundColor: '#0C1C2C',
                scale: 2,
                logging: false,
                useCORS: true
            });

            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.png`;
                link.click();
                URL.revokeObjectURL(url);
            });

            return true;
        } catch (error) {
            console.error('Export to PNG failed:', error);
            throw error;
        }
    },

    /**
     * Export as PDF document
     */
    async toPDF(orbatData, unitInfo, filename = 'orbat-report') {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPosition = 20;

            // Add header
            pdf.setFontSize(20);
            pdf.setTextColor(79, 203, 248); // Accent color
            pdf.text('Order of Battle Report', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Add unit information
            pdf.setFontSize(16);
            pdf.setTextColor(224, 230, 237); // Text primary
            pdf.text(unitInfo.name, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.setTextColor(160, 174, 192); // Text secondary
            pdf.text(`${unitInfo.abbreviation} • ${unitInfo.unit_type}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Add generation date
            pdf.setFontSize(10);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
            yPosition += 15;

            // Add statistics section
            pdf.setFontSize(14);
            pdf.setTextColor(79, 203, 248);
            pdf.text('Unit Statistics', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(11);
            pdf.setTextColor(224, 230, 237);

            const stats = orbatData.statistics;
            pdf.text(`Total Positions: ${stats.total_positions}`, 25, yPosition);
            yPosition += 7;
            pdf.text(`Filled Positions: ${stats.filled_positions}`, 25, yPosition);
            yPosition += 7;
            pdf.text(`Vacant Positions: ${stats.vacant_positions}`, 25, yPosition);
            yPosition += 7;
            pdf.text(`Fill Rate: ${Math.round((stats.filled_positions / stats.total_positions) * 100)}%`, 25, yPosition);
            yPosition += 15;

            // Add positions list
            pdf.setFontSize(14);
            pdf.setTextColor(79, 203, 248);
            pdf.text('Position Details', 20, yPosition);
            yPosition += 10;

            // Table headers
            pdf.setFontSize(10);
            pdf.setTextColor(160, 174, 192);
            pdf.text('Position', 25, yPosition);
            pdf.text('Unit', 80, yPosition);
            pdf.text('Holder', 120, yPosition);
            pdf.text('Status', 170, yPosition);
            yPosition += 7;

            // Add line
            pdf.setDrawColor(56, 44, 84);
            pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2);
            yPosition += 3;

            // Add positions
            pdf.setFontSize(10);
            orbatData.nodes.forEach((node) => {
                if (yPosition > pageHeight - 30) {
                    pdf.addPage();
                    yPosition = 20;
                }

                pdf.setTextColor(224, 230, 237);
                pdf.text(node.display_title.substring(0, 30), 25, yPosition);
                pdf.text(node.unit_info?.abbreviation || 'N/A', 80, yPosition);

                if (node.is_vacant) {
                    pdf.setTextColor(255, 107, 53); // Warning color
                    pdf.text('VACANT', 120, yPosition);
                } else {
                    pdf.setTextColor(57, 255, 20); // Success color
                    const holder = node.current_holder;
                    pdf.text(
                        `${holder?.rank?.abbreviation || ''} ${holder?.username || 'Unknown'}`,
                        120,
                        yPosition
                    );
                }

                pdf.setTextColor(160, 174, 192);
                pdf.text(node.position_type?.toUpperCase() || 'STANDARD', 170, yPosition);

                yPosition += 7;
            });

            // Save the PDF
            pdf.save(`${filename}.pdf`);
            return true;
        } catch (error) {
            console.error('Export to PDF failed:', error);
            throw error;
        }
    },

    /**
     * Export as Excel spreadsheet
     */
    toExcel(orbatData, unitInfo, filename = 'orbat-data') {
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();

            // Summary sheet
            const summaryData = [
                ['ORBAT Summary Report'],
                [''],
                ['Unit Name', unitInfo.name],
                ['Unit Abbreviation', unitInfo.abbreviation],
                ['Unit Type', unitInfo.unit_type],
                ['Branch', unitInfo.branch_name],
                [''],
                ['Statistics'],
                ['Total Positions', orbatData.statistics.total_positions],
                ['Filled Positions', orbatData.statistics.filled_positions],
                ['Vacant Positions', orbatData.statistics.vacant_positions],
                ['Fill Rate', `${Math.round((orbatData.statistics.filled_positions / orbatData.statistics.total_positions) * 100)}%`],
                [''],
                ['Generated', new Date().toLocaleString()]
            ];

            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

            // Positions sheet
            const positionsData = [
                ['Position ID', 'Display Title', 'Unit', 'Unit Abbreviation', 'Position Type', 'Role Category', 'Status', 'Current Holder', 'Rank', 'Service Number']
            ];

            orbatData.nodes.forEach(node => {
                positionsData.push([
                    node.id,
                    node.display_title,
                    node.unit_info?.name || '',
                    node.unit_info?.abbreviation || '',
                    node.position_type || 'standard',
                    node.role_info?.category || '',
                    node.is_vacant ? 'Vacant' : 'Filled',
                    node.current_holder?.username || '',
                    node.current_holder?.rank?.abbreviation || '',
                    node.current_holder?.service_number || ''
                ]);
            });

            const positionsSheet = XLSX.utils.aoa_to_sheet(positionsData);
            XLSX.utils.book_append_sheet(wb, positionsSheet, 'Positions');

            // Chain of Command sheet (based on edges)
            const chainData = [
                ['Superior Position', 'Subordinate Position', 'Relationship Type']
            ];

            orbatData.edges.forEach(edge => {
                const superiorNode = orbatData.nodes.find(n => n.id === edge.source);
                const subordinateNode = orbatData.nodes.find(n => n.id === edge.target);

                if (superiorNode && subordinateNode) {
                    chainData.push([
                        superiorNode.display_title,
                        subordinateNode.display_title,
                        'Direct Report'
                    ]);
                }
            });

            const chainSheet = XLSX.utils.aoa_to_sheet(chainData);
            XLSX.utils.book_append_sheet(wb, chainSheet, 'Chain of Command');

            // Statistics by Type sheet
            const typeStats = {};
            orbatData.nodes.forEach(node => {
                const type = node.position_type || 'standard';
                if (!typeStats[type]) {
                    typeStats[type] = { total: 0, filled: 0, vacant: 0 };
                }
                typeStats[type].total++;
                if (node.is_vacant) {
                    typeStats[type].vacant++;
                } else {
                    typeStats[type].filled++;
                }
            });

            const statsData = [
                ['Position Type', 'Total', 'Filled', 'Vacant', 'Fill Rate']
            ];

            Object.entries(typeStats).forEach(([type, stats]) => {
                statsData.push([
                    type.charAt(0).toUpperCase() + type.slice(1),
                    stats.total,
                    stats.filled,
                    stats.vacant,
                    `${Math.round((stats.filled / stats.total) * 100)}%`
                ]);
            });

            const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
            XLSX.utils.book_append_sheet(wb, statsSheet, 'Statistics by Type');

            // Save the file
            XLSX.writeFile(wb, `${filename}.xlsx`);
            return true;
        } catch (error) {
            console.error('Export to Excel failed:', error);
            throw error;
        }
    },

    /**
     * Export as JSON
     */
    toJSON(orbatData, unitInfo, filename = 'orbat-data') {
        try {
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0',
                    unit: unitInfo
                },
                statistics: orbatData.statistics,
                nodes: orbatData.nodes,
                edges: orbatData.edges
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.json`;
            link.click();
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Export to JSON failed:', error);
            throw error;
        }
    },

    /**
     * Export as CSV (simplified position list)
     */
    toCSV(orbatData, filename = 'orbat-positions') {
        try {
            const headers = [
                'Position ID',
                'Display Title',
                'Unit',
                'Unit Abbreviation',
                'Position Type',
                'Status',
                'Current Holder',
                'Rank',
                'Service Number'
            ];

            const rows = orbatData.nodes.map(node => [
                node.id,
                `"${node.display_title}"`,
                `"${node.unit_info?.name || ''}"`,
                node.unit_info?.abbreviation || '',
                node.position_type || 'standard',
                node.is_vacant ? 'Vacant' : 'Filled',
                `"${node.current_holder?.username || ''}"`,
                node.current_holder?.rank?.abbreviation || '',
                node.current_holder?.service_number || ''
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Export to CSV failed:', error);
            throw error;
        }
    }
};

/**
 * Generate printable ORBAT report
 */
export const generatePrintableReport = (orbatData, unitInfo) => {
    const printWindow = window.open('', '_blank');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ORBAT Report - ${unitInfo.name}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                h1, h2, h3 {
                    color: #0066cc;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #0066cc;
                    padding-bottom: 20px;
                }
                .statistics {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                    padding: 20px;
                    background: #f5f5f5;
                    border-radius: 8px;
                }
                .stat-item {
                    text-align: center;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #0066cc;
                }
                .positions-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                .positions-table th,
                .positions-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                .positions-table th {
                    background-color: #0066cc;
                    color: white;
                }
                .positions-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .vacant {
                    color: #ff6b35;
                    font-weight: bold;
                }
                .filled {
                    color: #39ff14;
                    font-weight: bold;
                }
                @media print {
                    body {
                        margin: 10px;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Order of Battle Report</h1>
                <h2>${unitInfo.name} (${unitInfo.abbreviation})</h2>
                <p>${unitInfo.unit_type} • ${unitInfo.branch_name || 'Unknown Branch'}</p>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>

            <div class="statistics">
                <div class="stat-item">
                    <div class="stat-value">${orbatData.statistics.total_positions}</div>
                    <div>Total Positions</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${orbatData.statistics.filled_positions}</div>
                    <div>Filled</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${orbatData.statistics.vacant_positions}</div>
                    <div>Vacant</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Math.round((orbatData.statistics.filled_positions / orbatData.statistics.total_positions) * 100)}%</div>
                    <div>Fill Rate</div>
                </div>
            </div>

            <h3>Position Details</h3>
            <table class="positions-table">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Unit</th>
                        <th>Type</th>
                        <th>Current Holder</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${orbatData.nodes.map(node => `
                        <tr>
                            <td>${node.display_title}</td>
                            <td>${node.unit_info?.abbreviation || 'N/A'}</td>
                            <td>${node.position_type?.toUpperCase() || 'STANDARD'}</td>
                            <td>${node.is_vacant ? '-' : `${node.current_holder?.rank?.abbreviation || ''} ${node.current_holder?.username || 'Unknown'}`}</td>
                            <td class="${node.is_vacant ? 'vacant' : 'filled'}">${node.is_vacant ? 'VACANT' : 'FILLED'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Print Report
            </button>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};