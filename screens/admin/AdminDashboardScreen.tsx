import React, { useState, useEffect, useMemo } from 'react';
import { getReports, getUsers } from '../../utils/storage';
import { Report, SafetyInspectionData, FieldUser } from '../../types';
import { ArrowUpIcon, ArrowDownIcon } from '../../components/icons/Icons';

const AdminStatCard: React.FC<{ title: string; value: string; change?: string; isUp?: boolean; isNeutral?: boolean; }> = ({ title, value, change, isUp, isNeutral }) => (
    <div className="bg-slate-800 p-6 rounded-lg">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-4xl font-bold text-white mt-2">{value}</p>
        {change && (
            <div className={`flex items-center text-sm mt-2 font-semibold ${isNeutral ? 'text-slate-400' : isUp ? 'text-green-400' : 'text-red-400'}`}>
                {!isNeutral && (isUp ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                <span className="ml-1">{change} vs. previous 30 days</span>
            </div>
        )}
    </div>
);

const AdminDashboardScreen: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<FieldUser[]>([]);

    useEffect(() => {
        setReports(getReports());
        setUsers(getUsers());
    }, []);

    const dashboardStats = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
        const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

        const calcChange = (current: number, previous: number) => {
            if (previous > 0) {
                const change = Math.round(((current - previous) / previous) * 100);
                return { value: Math.abs(change), isUp: change >= 0, isNeutral: change === 0 };
            }
            if (current > 0) {
                return { value: 100, isUp: true, isNeutral: false }; // No previous data, but new data exists
            }
            return { value: 0, isUp: false, isNeutral: true }; // No data at all
        };

        const inspectionReports = reports.filter(
            (report): report is Report & { data: SafetyInspectionData } =>
                report.type === 'Safety Inspection' && !!report.data && report.data.checklist
        );
        
        const calcChecklistItemFails = (itemText: 'Incidents' | 'Near Miss' | 'Environmental') => {
            const getFailCount = (report: Report & { data: SafetyInspectionData }) => 
                report.data.checklist.find(c => c.text === itemText)?.status === 'Fail' ? 1 : 0;

            // FIX: Use .replace(/-/g, '/') to parse dates in local timezone, preventing off-by-one-day errors.
            const recentFails = inspectionReports.filter(r => new Date(r.date.replace(/-/g, '/')) >= thirtyDaysAgo).reduce((sum, r) => sum + getFailCount(r), 0);
            const previousFails = inspectionReports.filter(r => {
                const reportDate = new Date(r.date.replace(/-/g, '/'));
                return reportDate >= sixtyDaysAgo && reportDate < thirtyDaysAgo;
            }).reduce((sum, r) => sum + getFailCount(r), 0);
            
            const { value, isUp, isNeutral } = calcChange(recentFails, previousFails);
            return {
                total: inspectionReports.reduce((sum, r) => sum + getFailCount(r), 0),
                change: `${value}%`,
                isUp,
                isNeutral
            };
        };

        const activeUsers = users.filter(u => u.status === 'Active').length;
        const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

        return {
            totalReports: reports.length,
            incidents: calcChecklistItemFails('Incidents'),
            nearMisses: calcChecklistItemFails('Near Miss'),
            environmental: calcChecklistItemFails('Environmental'),
            activeUsers,
            inactiveUsers,
        };
    }, [reports, users]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AdminStatCard title="Total Reports" value={dashboardStats.totalReports.toString()} />
                <AdminStatCard title="Total Active Users" value={dashboardStats.activeUsers.toString()} />
                <AdminStatCard title="Total Inactive Users" value={dashboardStats.inactiveUsers.toString()} />
                <AdminStatCard 
                    title="Failed Incident Items" 
                    value={dashboardStats.incidents.total.toString()}
                    change={dashboardStats.incidents.change}
                    isUp={dashboardStats.incidents.isUp}
                    isNeutral={dashboardStats.incidents.isNeutral}
                />
                <AdminStatCard 
                    title="Failed Near Miss Items" 
                    value={dashboardStats.nearMisses.total.toString()}
                    change={dashboardStats.nearMisses.change}
                    isUp={dashboardStats.nearMisses.isUp}
                    isNeutral={dashboardStats.nearMisses.isNeutral}
                />
                <AdminStatCard 
                    title="Failed Environmental Items" 
                    value={dashboardStats.environmental.total.toString()}
                    change={dashboardStats.environmental.change}
                    isUp={dashboardStats.environmental.isUp}
                    isNeutral={dashboardStats.environmental.isNeutral}
                />
            </div>
        </div>
    );
};

export default AdminDashboardScreen;