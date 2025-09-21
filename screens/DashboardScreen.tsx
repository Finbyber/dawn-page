
import React, { useState, useEffect, useMemo } from 'react';
import { Screen, Report, SafetyInspectionData } from '../types';
import Header from '../components/common/Header';
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, FilterIcon, MenuIcon } from '../components/icons/Icons';
import { getReports } from '../utils/storage';

interface DashboardScreenProps {
  setScreen: (screen: Screen) => void;
}

const DashboardStatCard: React.FC<{ title: string; value: string; change: string; isUp: boolean; isNeutral?: boolean }> = ({ title, value, change, isUp, isNeutral = false }) => (
    <div className="bg-slate-800 p-4 rounded-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      <div className={`flex items-center text-sm mt-1 ${isNeutral ? 'text-slate-400' : isUp ? 'text-green-400' : 'text-red-400'}`}>
        {!isNeutral && (isUp ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />)}
        <span className="ml-1 font-semibold">{change}</span>
      </div>
    </div>
);

const FilterDropdown: React.FC<{ label: string }> = ({ label }) => (
    <button className="w-full bg-slate-800 p-3 rounded-lg flex justify-between items-center text-left hover:bg-slate-700 transition-colors">
      <span className="text-white font-medium">{label}</span>
      <ChevronDownIcon className="h-5 w-5 text-slate-400" />
    </button>
);

const MonthlyInspectionChart: React.FC<{ data: number[] }> = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const maxValue = Math.max(...data, 1); // Avoid division by zero

    return (
        <div className="bg-slate-800 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-1">Monthly Safety Inspections</h3>
            <p className="text-sm text-slate-400 mb-4">Total submissions for the current year.</p>
            <div className="h-48 flex items-end justify-between gap-2 text-center" aria-label="Monthly safety inspection submissions chart">
                {data.map((value, index) => (
                    <div 
                        key={monthLabels[index]} 
                        className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                    >
                        <div className="relative w-full" style={{ height: `${(value / maxValue) * 100}%` }}>
                            {(hoveredIndex === index || activeIndex === index) && value > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-600 text-white text-xs font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none z-10">
                                    {value}
                                </div>
                            )}
                            <div 
                                className="w-full h-full bg-sky-500 rounded-t-md group-hover:bg-sky-400 transition-all duration-300 ease-in-out"
                                role="presentation"
                                aria-label={`${monthLabels[index]}: ${value} inspections`}
                            >
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{monthLabels[index]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
  
const MonthlySubmissionsGraph: React.FC<{ data: number[] }> = ({ data }) => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return (
        <div className="bg-slate-800 p-4 rounded-xl">
            <h3 className="text-slate-400 text-sm mb-4">Monthly Submissions (All Types)</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
                {monthLabels.map((month, index) => (
                    <div key={month} className="bg-slate-700/50 rounded-lg p-2">
                        <p className="text-xs font-semibold text-slate-400">{month}</p>
                        <p className="text-lg font-bold text-white mt-1">{data[index]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ChecklistStatusChartData {
    passPercent: number;
    failPercent: number;
    passCount: number;
    failCount: number;
}

const ChecklistStatusChart: React.FC<{ data: ChecklistStatusChartData }> = ({ data }) => {
    const [hoveredBar, setHoveredBar] = useState<'pass' | 'fail' | null>(null);
    const maxCount = Math.max(data.passCount, data.failCount, 1);
    const passBarHeight = (data.passCount / maxCount) * 100;
    const failBarHeight = (data.failCount / maxCount) * 100;

    return (
        <div className="bg-slate-800 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Checklist Status Breakdown</h3>
            <div className="h-48 flex items-end justify-around gap-8 text-center" aria-label="Checklist status breakdown chart">
                {/* Pass Bar */}
                <div 
                    className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                    onMouseEnter={() => setHoveredBar('pass')}
                    onMouseLeave={() => setHoveredBar(null)}
                >
                    <div className="relative w-1/2" style={{ height: `${passBarHeight}%` }}>
                        {hoveredBar === 'pass' && data.passCount > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-600 text-white text-xs font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none z-10">
                                {data.passCount}
                            </div>
                        )}
                        <div 
                            className="w-full h-full bg-green-500 rounded-t-md group-hover:bg-green-400 transition-all duration-500 ease-in-out"
                            role="presentation"
                            aria-label={`Pass count: ${data.passCount}`}
                        >
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-300 mt-2">Pass</p>
                    <p className="text-xl font-bold text-white">{data.passCount}</p>
                </div>

                {/* Fail Bar */}
                <div 
                    className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                    onMouseEnter={() => setHoveredBar('fail')}
                    onMouseLeave={() => setHoveredBar(null)}
                >
                    <div className="relative w-1/2" style={{ height: `${failBarHeight}%` }}>
                         {hoveredBar === 'fail' && data.failCount > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-600 text-white text-xs font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none z-10">
                                {data.failCount}
                            </div>
                        )}
                        <div 
                            className="w-full h-full bg-red-500 rounded-t-md group-hover:bg-red-400 transition-all duration-500 ease-in-out"
                            role="presentation"
                            aria-label={`Fail count: ${data.failCount}`}
                        >
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-300 mt-2">Fail</p>
                    <p className="text-xl font-bold text-white">{data.failCount}</p>
                </div>
            </div>
        </div>
    );
};


const ComplianceRate: React.FC<{ rate: number }> = ({ rate }) => (
    <div className="bg-slate-800 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium text-slate-300">Overall Compliance Rate</p>
        <p className="font-bold text-white text-lg">{rate}%</p>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${rate}%` }}></div>
      </div>
    </div>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setScreen }) => {
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        setReports(getReports());
    }, []);

    const dashboardData = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
        const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));
        
        const calcChange = (current: number, previous: number) => {
            if (previous > 0) {
                const change = Math.round(((current - previous) / previous) * 100);
                return { value: Math.abs(change), isUp: change >= 0 };
            }
            return { value: current > 0 ? 100 : 0, isUp: current > 0 };
        };

        const calcStatsForType = (type: Report['type']) => {
            const filteredReports = reports.filter(r => r.type === type);
            const recentCount = filteredReports.filter(r => new Date(r.date.replace(/-/g, '/')) >= thirtyDaysAgo).length;
            const previousCount = filteredReports.filter(r => new Date(r.date.replace(/-/g, '/')) >= sixtyDaysAgo && new Date(r.date.replace(/-/g, '/')) < thirtyDaysAgo).length;
            const change = calcChange(recentCount, previousCount);

            return { total: filteredReports.length, change };
        };

        const inspectionReports = reports.filter(
            (report): report is Report & { data: SafetyInspectionData } =>
                report.type === 'Safety Inspection' && !!report.data && report.data.checklist
        );

        const calcStatsForChecklistItem = (itemText: 'Incidents' | 'Near Miss' | 'Environmental') => {
            const getFailCount = (report: Report & { data: SafetyInspectionData }) => {
                const item = report.data.checklist.find(c => c.text === itemText);
                return (item && item.status === 'Fail') ? 1 : 0;
            };

            const totalFails = inspectionReports.reduce((acc, report) => acc + getFailCount(report), 0);
            
            const recentFails = inspectionReports
                .filter(r => new Date(r.date.replace(/-/g, '/')) >= thirtyDaysAgo)
                .reduce((acc, report) => acc + getFailCount(report), 0);

            const previousFails = inspectionReports
                .filter(r => new Date(r.date.replace(/-/g, '/')) >= sixtyDaysAgo && new Date(r.date.replace(/-/g, '/')) < thirtyDaysAgo)
                .reduce((acc, report) => acc + getFailCount(report), 0);
            
            const change = calcChange(recentFails, previousFails);
            return { total: totalFails, change };
        };

        const incidentStats = calcStatsForChecklistItem('Incidents');
        const nearMissStats = calcStatsForChecklistItem('Near Miss');
        const environmentalStats = calcStatsForChecklistItem('Environmental');
        const inspectionStats = calcStatsForType('Safety Inspection');

        let totalPass = 0, totalFail = 0;
        inspectionReports.forEach(report => {
            report.data.checklist.forEach(item => {
                if (item.status === 'Pass') totalPass++;
                else if (item.status === 'Fail') totalFail++;
            });
        });
        const totalRatedItems = totalPass + totalFail;
        const complianceRate = totalRatedItems > 0 ? Math.round((totalPass / totalRatedItems) * 100) : 0;
        
        const checklistStatus: ChecklistStatusChartData = {
            passPercent: totalRatedItems > 0 ? (totalPass / totalRatedItems) * 100 : 0,
            failPercent: totalRatedItems > 0 ? (totalFail / totalRatedItems) * 100 : 0,
            passCount: totalPass,
            failCount: totalFail,
        };

        const currentYear = now.getFullYear();
        
        // Data for the grid view of all monthly submissions
        const allMonthlySubmissions = Array(12).fill(0);
        reports.forEach(report => {
            if (typeof report.date === 'string' && report.date.length === 10) {
                const year = parseInt(report.date.substring(0, 4), 10);
                const month = parseInt(report.date.substring(5, 7), 10); 
                if (year === currentYear && month >= 1 && month <= 12) {
                    allMonthlySubmissions[month - 1]++;
                }
            }
        });

        // Data specifically for the Safety Inspection bar chart
        const monthlyInspectionData = Array(12).fill(0);
        inspectionReports.forEach(report => {
             if (typeof report.date === 'string' && report.date.length === 10) {
                const year = parseInt(report.date.substring(0, 4), 10);
                const month = parseInt(report.date.substring(5, 7), 10); 
                if (year === currentYear && month >= 1 && month <= 12) {
                    monthlyInspectionData[month - 1]++;
                }
            }
        });

        return {
            incidentStats,
            nearMissStats,
            environmentalStats,
            inspectionStats,
            complianceRate,
            checklistStatus,
            monthlySubmissions: allMonthlySubmissions,
            monthlyInspectionData,
        };
    }, [reports]);

  return (
    <div className="bg-slate-900 min-h-screen">
        <div>
            <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm p-4 flex items-center justify-between text-white">
                <button className="p-2 rounded-full hover:bg-slate-700"><MenuIcon /></button>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <div className="w-10"></div>{/* Spacer */}
            </header>
            
            <div className="px-4 py-4 space-y-6">
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Reports Overview</h2>
                        <button className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-slate-700 transition-colors">
                            <FilterIcon />
                            Filter
                        </button>
                    </div>
                    <div className="space-y-3">
                        <FilterDropdown label="Last 30 Days" />
                        <FilterDropdown label="All Report Types" />
                        <FilterDropdown label="All Sites/Locations" />
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-4">
                    <DashboardStatCard title="Incidents" value={dashboardData.incidentStats.total.toString()} change={`${dashboardData.incidentStats.change.value}%`} isUp={dashboardData.incidentStats.change.isUp} isNeutral={dashboardData.incidentStats.change.value === 0}/>
                    <DashboardStatCard title="Near Misses" value={dashboardData.nearMissStats.total.toString()} change={`${dashboardData.nearMissStats.change.value}%`} isUp={dashboardData.nearMissStats.change.isUp} isNeutral={dashboardData.nearMissStats.change.value === 0}/>
                    <DashboardStatCard title="Inspections" value={dashboardData.inspectionStats.total.toString()} change={`${dashboardData.inspectionStats.change.value}%`} isUp={dashboardData.inspectionStats.change.isUp} isNeutral={dashboardData.inspectionStats.change.value === 0} />
                    <DashboardStatCard title="Environmental" value={dashboardData.environmentalStats.total.toString()} change={`${dashboardData.environmentalStats.change.value}%`} isUp={dashboardData.environmentalStats.change.isUp} isNeutral={dashboardData.environmentalStats.change.value === 0} />
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Trends</h2>
                    <MonthlyInspectionChart data={dashboardData.monthlyInspectionData} />
                    <MonthlySubmissionsGraph data={dashboardData.monthlySubmissions} />
                    <ChecklistStatusChart data={dashboardData.checklistStatus} />
                </section>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Compliance</h2>
                    <ComplianceRate rate={dashboardData.complianceRate} />
                </section>
                
                {/* Back button for current navigation flow */}
                <button 
                  onClick={() => setScreen(Screen.Reports)} 
                  className="w-full text-center py-3 text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Back to Reports List
                </button>
            </div>
        </div>
    </div>
  );
};

export default DashboardScreen;