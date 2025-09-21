import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Report, Screen, FieldUser, FeaturePermissions } from '../types';
import Header from '../components/common/Header';
import { getOfflineReports, getOfflineEdits } from '../utils/storage';
import { hasManagerialRole } from '../utils/auth';
import { TrashIcon, DotsHorizontalIcon, PencilIcon, EyeIcon, ReplyIcon } from '../components/icons/Icons';

const StatusBadge: React.FC<{ status: Report['status'] }> = ({ status }) => {
    const statusClasses = {
        'Submitted': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'In Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'Closed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

interface ReportListItemProps {
    report: Report;
    onClick: () => void;
    allUsers: FieldUser[];
    canDelete: boolean;
    onInitiateDelete: (reportId: string) => void;
    onEdit: (report: Report) => void;
    activeMenuId: string | null;
    setActiveMenuId: (id: string | null) => void;
    isPendingDelete: boolean;
    onUndoDelete: () => void;
    isSwiped: boolean;
    setSwipedId: (id: string | null) => void;
}

const ReportListItem: React.FC<ReportListItemProps> = ({ 
    report, onClick, allUsers, canDelete, onInitiateDelete, onEdit, 
    activeMenuId, setActiveMenuId, isPendingDelete, onUndoDelete,
    isSwiped, setSwipedId 
}) => {
    const assignedUser = report.assignedTo ? allUsers.find(u => u.id === report.assignedTo) : null;
    const assigneeInitials = assignedUser ? assignedUser.fullName.split(' ').map(n => n[0]).join('') : null;
    const menuRef = useRef<HTMLDivElement>(null);

    const isMenuOpen = activeMenuId === report.id;

    // Swipe gesture logic
    const itemRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchCurrentX = useRef(0);
    const SWIPE_WIDTH = 96; // w-24

    const onTouchStart = (e: React.TouchEvent) => {
        setActiveMenuId(null); // Close menu on swipe start
        touchStartX.current = e.targetTouches[0].clientX;
        touchCurrentX.current = touchStartX.current;
        if (itemRef.current) {
            itemRef.current.style.transition = 'transform 0s';
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchCurrentX.current = e.targetTouches[0].clientX;
        const diff = touchCurrentX.current - touchStartX.current;
        if (diff < 0) { // Only allow swiping left
            if (itemRef.current) {
                itemRef.current.style.transform = `translateX(${Math.max(-SWIPE_WIDTH, diff)}px)`;
            }
        }
    };

    const onTouchEnd = () => {
        if (!itemRef.current) return;
        itemRef.current.style.transition = 'transform 0.3s ease';
        const diff = touchCurrentX.current - touchStartX.current;

        if (diff < -SWIPE_WIDTH / 2) { // Swiped far enough
            itemRef.current.style.transform = `translateX(-${SWIPE_WIDTH}px)`;
            setSwipedId(report.id);
        } else { // Didn't swipe far enough, snap back
            itemRef.current.style.transform = 'translateX(0)';
            if (isSwiped) {
                setSwipedId(null);
            }
        }
    };

    useEffect(() => {
        // Snap back when another item is swiped.
        if (!isSwiped && itemRef.current) {
            itemRef.current.style.transform = 'translateX(0)';
        } else if (isSwiped && itemRef.current) {
            itemRef.current.style.transform = `translateX(-${SWIPE_WIDTH}px)`;
        }
    }, [isSwiped, SWIPE_WIDTH]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen, setActiveMenuId]);

    const handleMainClick = () => {
        if (isSwiped) {
            setSwipedId(null);
        } else {
            onClick();
        }
    };

    const canBeEdited = report.type === 'Safety Inspection';

    if (isPendingDelete) {
        return (
            <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg flex justify-between items-center transition-all duration-300">
                <div>
                    <p className="text-red-800 dark:text-red-300 font-semibold">Report marked for deletion.</p>
                    <p className="text-sm text-red-600 dark:text-red-400">This will be permanent in 5 seconds.</p>
                </div>
                <button 
                    onClick={onUndoDelete} 
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
                >
                    <ReplyIcon className="h-5 w-5" />
                    Undo
                </button>
            </div>
        );
    }

    return (
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="absolute top-0 right-0 h-full w-24 bg-red-600 flex items-center justify-center">
                <button
                    onClick={() => onInitiateDelete(report.id)}
                    className="text-white p-2 h-full w-full flex flex-col items-center justify-center"
                    aria-label={`Delete report ${report.id}`}
                >
                    <TrashIcon className="h-6 w-6"/>
                    <span className="text-xs mt-1 font-semibold">Delete</span>
                </button>
            </div>
            <div
                ref={itemRef}
                className="relative w-full bg-white dark:bg-slate-800 transition-transform duration-300 ease"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ touchAction: 'pan-y' }}
            >
                <div
                    onClick={handleMainClick}
                    className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                >
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{report.id} - {report.type}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(report.date.replace(/-/g, '/')).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {assigneeInitials && (
                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-semibold bg-slate-200 dark:bg-slate-600 rounded-full h-6 w-6 flex items-center justify-center">{assigneeInitials}</span>
                            </div>
                        )}
                        <StatusBadge status={report.status} />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : report.id);
                            }}
                            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            aria-haspopup="true"
                            aria-expanded={isMenuOpen}
                            aria-label="More options"
                        >
                            <DotsHorizontalIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div
                        ref={menuRef}
                        className="absolute top-12 right-4 z-20 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg border border-slate-200 dark:border-slate-600"
                        role="menu"
                        aria-orientation="vertical"
                    >
                        <div className="py-1" role="none">
                            <button
                                onClick={() => { onClick(); setActiveMenuId(null); }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                                role="menuitem"
                            >
                                <EyeIcon className="mr-3 h-5 w-5" />
                                View Details
                            </button>
                            {canBeEdited && (
                                <button
                                    onClick={() => { onEdit(report); setActiveMenuId(null); }}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                                    role="menuitem"
                                >
                                    <PencilIcon className="mr-3 h-5 w-5" />
                                    Edit
                                </button>
                            )}
                            {canDelete && (
                                 <button
                                    onClick={() => { 
                                        setActiveMenuId(null);
                                        onInitiateDelete(report.id);
                                    }}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-600"
                                    role="menuitem"
                                >
                                    <TrashIcon className="mr-3 h-5 w-5" />
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ReportsScreenProps {
    reports: Report[];
    allUsers: FieldUser[];
    setScreen: (screen: Screen) => void;
    onReportSelect: (report: Report) => void;
    user: FieldUser | null;
    userFeaturePermissions: FeaturePermissions | null;
    onDeleteReport: (reportId: string) => void;
    onEditReport: (report: Report) => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ reports, allUsers, setScreen, onReportSelect, user, userFeaturePermissions, onDeleteReport, onEditReport }) => {
    const [offlineReportCount, setOfflineReportCount] = useState(0);
    const [offlineEditCount, setOfflineEditCount] = useState(0);
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [assignedToMeFilter, setAssignedToMeFilter] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [swipedReportId, setSwipedReportId] = useState<string | null>(null);
    const deleteTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setOfflineReportCount(getOfflineReports().length);
        setOfflineEditCount(getOfflineEdits().length);
    }, [reports]); // Re-check offline counts when reports prop changes
    
    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (deleteTimerRef.current) {
                clearTimeout(deleteTimerRef.current);
            }
        };
    }, []);

    const handleInitiateDelete = (reportId: string) => {
        if (deleteTimerRef.current) {
            clearTimeout(deleteTimerRef.current);
        }
        setSwipedReportId(null); // Close any open swipe
        setPendingDeleteId(reportId);
        deleteTimerRef.current = window.setTimeout(() => {
            onDeleteReport(reportId);
            setPendingDeleteId(null);
            deleteTimerRef.current = null;
        }, 5000);
    };

    const handleUndoDelete = () => {
        if (deleteTimerRef.current) {
            clearTimeout(deleteTimerRef.current);
            deleteTimerRef.current = null;
        }
        setPendingDeleteId(null);
    };

    const reportTypes: (Report['type'] | 'All')[] = ['All', 'Incident', 'Near Miss', 'Safety Inspection', 'Environmental'];
    const reportStatuses: (Report['status'] | 'All')[] = ['All', 'Submitted', 'In Review', 'Closed'];

    const filteredReports = useMemo(() => {
        let userReports = reports;
        if (user && !hasManagerialRole(user) && !assignedToMeFilter) {
            userReports = reports.filter(report => report.submittedBy === user.id);
        }

        return userReports.filter(report => {
            const typeMatch = typeFilter === 'All' || report.type === typeFilter;
            const statusMatch = statusFilter === 'All' || report.status === statusFilter;
            const assignedMatch = !assignedToMeFilter || report.assignedTo === user?.id;
            return typeMatch && statusMatch && assignedMatch;
        });
    }, [reports, typeFilter, statusFilter, assignedToMeFilter, user]);
    
    const totalOfflineCount = offlineReportCount + offlineEditCount;
    const canDelete = userFeaturePermissions?.canDeleteReport ?? false;

    return (
        <div>
            <Header 
                title="My Reports"
                actions={
                    hasManagerialRole(user) ? (
                        <button 
                            onClick={() => setScreen(Screen.Dashboard)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            View Dashboard
                        </button>
                    ) : null
                }
            />
             {totalOfflineCount > 0 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 mx-4 mt-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Offline Data Pending</p>
                    <p className="text-sm">{offlineReportCount} report(s) and {offlineEditCount} edit(s) are saved locally and will be submitted automatically when you're back online.</p>
                </div>
            )}
            <div className="py-4">
                <div className="px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="typeFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Filter by Type
                            </label>
                            <select
                                id="typeFilter"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                {reportTypes.map(type => (
                                    <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Filter by Status
                            </label>
                             <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                {reportStatuses.map(status => (
                                    <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                        <input
                            id="assignedToMeFilter"
                            type="checkbox"
                            checked={assignedToMeFilter}
                            onChange={(e) => setAssignedToMeFilter(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-blue-600 dark:ring-offset-slate-900"
                        />
                         <label htmlFor="assignedToMeFilter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Assigned to me
                        </label>
                    </div>
                </div>

                <div className="px-4 space-y-3">
                    {filteredReports.length > 0 ? (
                        filteredReports.map(report => (
                            <ReportListItem 
                                key={report.id} 
                                report={report} 
                                onClick={() => onReportSelect(report)} 
                                allUsers={allUsers}
                                canDelete={canDelete}
                                onInitiateDelete={handleInitiateDelete}
                                onEdit={onEditReport}
                                activeMenuId={activeMenuId}
                                setActiveMenuId={setActiveMenuId}
                                isPendingDelete={pendingDeleteId === report.id}
                                onUndoDelete={handleUndoDelete}
                                isSwiped={swipedReportId === report.id}
                                setSwipedId={setSwipedReportId}
                            />
                        ))
                    ) : (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                            <p className="font-semibold">No reports found.</p>
                            <p className="text-sm">Submit a report to see it here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;