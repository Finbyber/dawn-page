import { Report, FieldUser, Reminder, RolePermissions, Screen, UserRole, AppNotification, OfflineEdit, SafetyInspectionData, Department, RoleFeaturePermissions } from '../types';

const REPORTS_KEY = 'hse_reports';
const USERS_KEY = 'hse_users';
const DEPARTMENTS_KEY = 'hse_departments';
const OFFLINE_REPORTS_KEY = 'hse_offline_reports_queue';
const OFFLINE_EDITS_KEY = 'hse_offline_edits_queue';
const REMINDERS_KEY = 'hse_reminders';
const ROLE_PERMISSIONS_KEY = 'hse_role_permissions';
const FEATURE_PERMISSIONS_KEY = 'hse_feature_permissions';
const GPS_ENABLED_KEY = 'hse_gps_enabled';
const NOTIFICATIONS_KEY = 'hse_notifications';
const CURRENT_REPORTS_VERSION = 2;


// ===== GPS SETTINGS =====

export const getGpsEnabled = (): boolean => {
    try {
        const gpsEnabledJson = localStorage.getItem(GPS_ENABLED_KEY);
        return gpsEnabledJson ? JSON.parse(gpsEnabledJson) : false;
    } catch (error) {
        console.error("Failed to parse GPS setting from localStorage", error);
        return false;
    }
};

export const saveGpsEnabled = (isEnabled: boolean): void => {
    localStorage.setItem(GPS_ENABLED_KEY, JSON.stringify(isEnabled));
};


// ===== NOTIFICATION STORAGE =====

const getAllNotifications = (): AppNotification[] => {
    try {
        const notificationsJson = localStorage.getItem(NOTIFICATIONS_KEY);
        return notificationsJson ? JSON.parse(notificationsJson) : [];
    } catch (error) {
        console.error("Failed to parse notifications from localStorage", error);
        return [];
    }
};

const saveAllNotifications = (notifications: AppNotification[]): void => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const getNotifications = (userId: string): AppNotification[] => {
    return getAllNotifications()
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const createNotification = (userId: string, reportId: string, message: string) => {
    if (userId) {
        const newNotification: AppNotification = {
            id: `notif-${Date.now()}`,
            userId,
            reportId,
            message,
            isRead: false,
            timestamp: new Date().toISOString(),
        };
        const allNotifications = getAllNotifications();
        saveAllNotifications([newNotification, ...allNotifications]);
    }
};

export const markNotificationAsRead = (notificationId: string, userId: string): void => {
    const allNotifications = getAllNotifications();
    const notificationIndex = allNotifications.findIndex(n => n.id === notificationId && n.userId === userId);
    if (notificationIndex > -1) {
        allNotifications[notificationIndex].isRead = true;
        saveAllNotifications(allNotifications);
    }
};

export const markAllNotificationsAsRead = (userId: string): void => {
    const allNotifications = getAllNotifications();
    const userNotificationsUpdated = allNotifications.map(n => {
        if (n.userId === userId) {
            return { ...n, isRead: true };
        }
        return n;
    });
    saveAllNotifications(userNotificationsUpdated);
};

export const deleteNotification = (notificationId: string, userId: string): void => {
    let allNotifications = getAllNotifications();
    const updatedNotifications = allNotifications.filter(n => !(n.id === notificationId && n.userId === userId));
    saveAllNotifications(updatedNotifications);
};


// ===== REPORT STORAGE =====

// Helper function to save reports in the versioned format
const saveReportsArray = (reports: Report[]): void => {
    const dataToStore = {
        version: CURRENT_REPORTS_VERSION,
        reports: reports
    };
    localStorage.setItem(REPORTS_KEY, JSON.stringify(dataToStore));
};

export const getReports = (): Report[] => {
    const reportsJson = localStorage.getItem(REPORTS_KEY);
    if (!reportsJson) {
        return []; // No data exists, this is a clean start.
    }

    let data;
    try {
        data = JSON.parse(reportsJson);
    } catch (error) {
        console.error("FATAL: Could not parse reports JSON from localStorage. Data is likely corrupted.", error);
        // Display a blocking error to the user to prevent any action that might overwrite their data.
        alert(
            "CRITICAL ERROR: Could not load your reports. " +
            "Your data is still saved in your browser but is unreadable by the app. " +
            "Please DO NOT SUBMIT new reports as this may cause data loss. " +
            "Contact support immediately and provide a screenshot of the console logs (press F12)."
        );
        // Throw an error to stop the app's execution flow. This is safer than returning an empty array.
        throw new Error("Corrupted report data in localStorage.");
    }

    let rawReports: any[] = [];
    let version = 1; // Default to v1 for old, un-versioned data

    if (Array.isArray(data)) {
        // Old format (v1): just an array of reports.
        rawReports = data;
    } else if (data && typeof data.version === 'number' && Array.isArray(data.reports)) {
        // New, versioned format.
        version = data.version;
        rawReports = data.reports;
    } else {
        console.warn("Unrecognized report data format in localStorage. Attempting to recover, but data loss is possible.");
        // We still got here, which means JSON.parse succeeded but the structure is wrong.
        // We should not proceed and risk data loss.
        alert(
            "WARNING: The format of your saved reports is unrecognized. " +
            "To prevent data loss, the application will not load your reports. " +
            "Please contact support."
        );
        throw new Error("Unrecognized report data format.");
    }

    let needsSave = false;
    const migratedReports: Report[] = [];

    // Process each report individually for robustness.
    for (const [index, rawReport] of rawReports.entries()) {
        if (!rawReport || typeof rawReport !== 'object' || Array.isArray(rawReport)) {
            console.warn(`Item at index ${index} is not a valid report object, discarding.`, rawReport);
            needsSave = true; // We are discarding an item, so a re-save is needed.
            continue;
        }

        let migratedReport = { ...rawReport };

        // --- MIGRATION & VALIDATION ---
        // We will migrate up to the current version.
        // This structure allows for future migrations.
        
        // Is this a v1 report needing migration to v2 structure?
        // Let's assume the migration logic runs if the overall version is old.
        if (version < 2) {
            needsSave = true; // Flag that a re-save is needed after migration.
            
            // Add required fields if they are missing. This is the v1 -> v2 migration.
            migratedReport.id = rawReport.id || `migrated-${Date.now()}-${index}`;
            migratedReport.type = rawReport.type || 'Incident';
            migratedReport.date = rawReport.date || new Date().toISOString().substring(0, 10);
            migratedReport.status = rawReport.status || 'Submitted';
            migratedReport.submittedBy = rawReport.submittedBy || 'unknown-user';
            migratedReport.data = rawReport.data || {};
        }

        // --- FINAL VALIDATION ---
        // After all migrations, check if the report has the minimum required fields.
        if (
            typeof migratedReport.id !== 'string' ||
            typeof migratedReport.type !== 'string' ||
            typeof migratedReport.date !== 'string' ||
            typeof migratedReport.status !== 'string' ||
            typeof migratedReport.submittedBy !== 'string' ||
            !migratedReport.data || typeof migratedReport.data !== 'object'
        ) {
            console.warn(`Report at index ${index} is invalid after migration, discarding.`, migratedReport);
            needsSave = true;
            continue;
        }
        
        migratedReports.push(migratedReport as Report);
    }
    
    if (needsSave) {
        console.log("Report data has been cleaned or migrated. Saving updated structure to localStorage.");
        saveReportsArray(migratedReports);
    }
    
    return migratedReports;
};

export const saveReport = (report: Omit<Report, 'id' | 'date' | 'status' | 'submittedBy'>, userId: string): Report => {
    const reports = getReports();
    let eventDateStr: string;
    const data = report.data as any;
    const formDate = data?.inspectionDate || data?.dateTime || data?.date;

    if (formDate && typeof formDate === 'string') {
        eventDateStr = formDate.substring(0, 10);
    } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        eventDateStr = `${year}-${month}-${day}`;
    }
    
    const newReport: Report = {
        ...report,
        id: `${report.type.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        date: eventDateStr,
        status: 'Submitted',
        submittedBy: userId,
    };
    const updatedReports = [newReport, ...reports];
    saveReportsArray(updatedReports);
    return newReport;
};

export const updateReport = (reportId: string, updatedData: SafetyInspectionData): Report | undefined => {
    const reports = getReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);

    if (reportIndex === -1) {
        console.error("Report not found for updating:", reportId);
        return undefined;
    }

    const originalReport = reports[reportIndex];
    const newStatus = 'In Review';
    
    const message = `Report ${reportId} status changed from "${originalReport.status}" to "${newStatus}".`;
    createNotification(originalReport.submittedBy, reportId, message);

    const updatedReport: Report = {
        ...originalReport,
        data: updatedData,
        status: newStatus,
        lastEdited: new Date().toISOString(),
    };

    reports[reportIndex] = updatedReport;
    saveReportsArray(reports);
    return updatedReport;
};

export const deleteReport = (reportId: string): void => {
    const reports = getReports();
    const updatedReports = reports.filter(r => r.id !== reportId);
    saveReportsArray(updatedReports);

    // Also delete related notifications to keep data consistent.
    const allNotifications = getAllNotifications();
    const updatedNotifications = allNotifications.filter(n => n.reportId !== reportId);
    saveAllNotifications(updatedNotifications);
};

export const reopenReport = (reportId: string, actionByUser: FieldUser): Report | undefined => {
    const reports = getReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);

    if (reportIndex === -1) return undefined;

    const originalReport = reports[reportIndex];
    if (originalReport.status !== 'Closed') return originalReport;

    const newStatus = 'In Review';
    const message = `Report ${reportId} status changed from "${originalReport.status}" to "${newStatus}".`;
    createNotification(originalReport.submittedBy, reportId, message);

    const updatedData = { ...originalReport.data };
    if (originalReport.type === 'Safety Inspection') {
        const reopenNote = `\n\n--- [${actionByUser.fullName}] Report re-opened on ${new Date().toLocaleString('en-GB')} ---`;
        updatedData.notes = (updatedData.notes || '') + reopenNote;
    }

    const updatedReport: Report = {
        ...originalReport,
        data: updatedData,
        status: newStatus,
        lastEdited: new Date().toISOString(),
    };

    reports[reportIndex] = updatedReport;
    saveReportsArray(reports);
    return updatedReport;
};

export const closeReport = (reportId: string, actionByUser: FieldUser): Report | undefined => {
    const reports = getReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);

    if (reportIndex === -1) return undefined;

    const originalReport = reports[reportIndex];
    if (originalReport.status === 'Closed') return originalReport;

    const newStatus = 'Closed';
    const message = `Report ${reportId} status changed from "${originalReport.status}" to "${newStatus}".`;
    createNotification(originalReport.submittedBy, reportId, message);

    const updatedData = { ...originalReport.data };
    if (originalReport.type === 'Safety Inspection') {
        const closeNote = `\n\n--- [${actionByUser.fullName}] Report closed on ${new Date().toLocaleString('en-GB')} ---`;
        updatedData.notes = (updatedData.notes || '') + closeNote;
    }
    
    const updatedReport: Report = {
        ...originalReport,
        data: updatedData,
        status: newStatus,
        lastEdited: new Date().toISOString(),
    };

    reports[reportIndex] = updatedReport;
    saveReportsArray(reports);
    return updatedReport;
};

export const assignReport = (reportId: string, assignedUserId: string, assignerUser: FieldUser): Report | undefined => {
    const reports = getReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);

    if (reportIndex === -1) {
        console.error("Report not found for assignment:", reportId);
        return undefined;
    }

    const originalReport = reports[reportIndex];
    const previousAssigneeId = originalReport.assignedTo;
    const newAssigneeId = assignedUserId || undefined;

    // If assignment hasn't changed, do nothing.
    if (previousAssigneeId === newAssigneeId) {
        return originalReport;
    }

    const updatedReport = { ...originalReport, assignedTo: newAssigneeId };
    reports[reportIndex] = updatedReport;
    saveReportsArray(reports);

    // Notify the new assignee
    if (newAssigneeId) {
        const message = `Report ${reportId} has been assigned to you by ${assignerUser.fullName}.`;
        createNotification(newAssigneeId, reportId, message);
    }
    
    // Notify the previous assignee that the report is no longer assigned to them
    if (previousAssigneeId) {
        let message;
        if (newAssigneeId) {
             const allUsers = getUsers();
             const newAssignee = allUsers.find(u => u.id === newAssigneeId);
             message = `Report ${reportId} was reassigned to ${newAssignee ? newAssignee.fullName : 'another user'} by ${assignerUser.fullName}.`;
        } else {
             message = `Report ${reportId} was unassigned from you by ${assignerUser.fullName}.`;
        }
        createNotification(previousAssigneeId, reportId, message);
    }
    
    return updatedReport;
};

export const fileToBase64 = (file: File): Promise<string> => {
    const MAX_WIDTH = 1280;
    const MAX_HEIGHT = 1280;
    const QUALITY = 0.7;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result || typeof event.target.result !== 'string') {
                return reject(new Error("Could not read file."));
            }

            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error("Could not get canvas context."));
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);

                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

// ===== OFFLINE QUEUE =====

export const getOfflineReports = (): (Omit<Report, 'id' | 'date' | 'status'> & { submittedBy: string })[] => {
    try {
        const offlineReportsJson = localStorage.getItem(OFFLINE_REPORTS_KEY);
        return offlineReportsJson ? JSON.parse(offlineReportsJson) : [];
    } catch (error) {
        console.error("Failed to parse offline reports from localStorage", error);
        return [];
    }
};

export const saveOfflineReport = (report: Omit<Report, 'id' | 'date' | 'status'> & { submittedBy: string }): void => {
    const queue = getOfflineReports();
    queue.push(report);
    localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(queue));
};

export const clearOfflineReports = (): void => {
    localStorage.removeItem(OFFLINE_REPORTS_KEY);
};


// ----- OFFLINE EDITS QUEUE -----
export const getOfflineEdits = (): OfflineEdit[] => {
    try {
        const offlineEditsJson = localStorage.getItem(OFFLINE_EDITS_KEY);
        return offlineEditsJson ? JSON.parse(offlineEditsJson) : [];
    } catch (error) {
        console.error("Failed to parse offline edits from localStorage", error);
        return [];
    }
};

export const saveOfflineEdit = (edit: OfflineEdit): void => {
    const queue = getOfflineEdits();
    queue.push(edit);
    localStorage.setItem(OFFLINE_EDITS_KEY, JSON.stringify(queue));
};

export const clearOfflineEdits = (): void => {
    localStorage.removeItem(OFFLINE_EDITS_KEY);
};


// ===== REMINDER STORAGE =====

export const getReminders = (): Reminder[] => {
    try {
        const remindersJson = localStorage.getItem(REMINDERS_KEY);
        return remindersJson ? JSON.parse(remindersJson) : [];
    } catch (error) {
        console.error("Failed to parse reminders from localStorage", error);
        return [];
    }
};

export const saveReminders = (reminders: Reminder[]): void => {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

// ===== ROLE PERMISSIONS STORAGE =====
export const getRolePermissions = (): RolePermissions => {
    try {
        const permissionsJson = localStorage.getItem(ROLE_PERMISSIONS_KEY);
        return permissionsJson ? JSON.parse(permissionsJson) : seedRolePermissions();
    } catch (error) {
        console.error("Failed to parse role permissions from localStorage", error);
        return seedRolePermissions(); // Return default if parsing fails
    }
};

export const saveRolePermissions = (permissions: RolePermissions): void => {
    localStorage.setItem(ROLE_PERMISSIONS_KEY, JSON.stringify(permissions));
};

export const seedRolePermissions = (): RolePermissions => {
    const defaultPermissions: RolePermissions = {
        'Admin User': {
            [Screen.IncidentReport]: true,
            [Screen.NearMissReport]: true,
            [Screen.SafetyInspection]: true,
            [Screen.EnvironmentalReport]: true,
        },
        'Super User': {
            [Screen.IncidentReport]: true,
            [Screen.NearMissReport]: true,
            [Screen.SafetyInspection]: true,
            [Screen.EnvironmentalReport]: true,
        },
        'Standard User': {
            [Screen.IncidentReport]: true,
            [Screen.NearMissReport]: true,
            [Screen.SafetyInspection]: false,
            [Screen.EnvironmentalReport]: true,
        },
        'Personal User': {
            [Screen.IncidentReport]: false,
            [Screen.NearMissReport]: true,
            [Screen.SafetyInspection]: false,
            [Screen.EnvironmentalReport]: false,
        },
    };
    saveRolePermissions(defaultPermissions);
    return defaultPermissions;
};

// ===== FEATURE PERMISSIONS STORAGE =====
export const getFeaturePermissions = (): RoleFeaturePermissions => {
    const permissionsJson = localStorage.getItem(FEATURE_PERMISSIONS_KEY);
    const defaultPermissions: RoleFeaturePermissions = {
        'Admin User': { canViewPhotoGallery: true, canDeleteReport: true },
        'Super User': { canViewPhotoGallery: false, canDeleteReport: false },
    };

    if (permissionsJson) {
        try {
            const storedPermissions = JSON.parse(permissionsJson);
            // Combine defaults with stored to ensure all expected roles/permissions have a value
            return {
                ...defaultPermissions,
                'Admin User': { ...defaultPermissions['Admin User'], ...storedPermissions['Admin User'] },
                'Super User': { ...defaultPermissions['Super User'], ...storedPermissions['Super User'] },
            };
        } catch (e) {
            console.error("Failed to parse feature permissions from localStorage", e);
            return defaultPermissions;
        }
    }
    return defaultPermissions;
};

export const saveFeaturePermissions = (permissions: RoleFeaturePermissions): void => {
    localStorage.setItem(FEATURE_PERMISSIONS_KEY, JSON.stringify(permissions));
};


// ===== USER STORAGE =====

export const getUsers = (): FieldUser[] => {
    try {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        return [];
    }
};

export const saveUsers = (users: FieldUser[]): void => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// ===== DEPARTMENT STORAGE =====
export const getDepartments = (): Department[] => {
    try {
        const deptsJson = localStorage.getItem(DEPARTMENTS_KEY);
        return deptsJson ? JSON.parse(deptsJson) : [];
    } catch (error) {
        console.error("Failed to parse departments from localStorage", error);
        return [];
    }
};

export const saveDepartments = (departments: Department[]): void => {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departments));
};

// Seed initial user if none exist for login demonstration
export const seedUsers = (): void => {
    const users = getUsers();
    if (users.length === 0) {
        // Seed a default department
        const seedDept: Department = { id: 'dept-default-1', name: 'Field Operations' };
        saveDepartments([seedDept]);

        const defaultUsers: FieldUser[] = [
            {
                id: 'user-default-1',
                fullName: 'Alex Johnson',
                email: 'user@hse.com',
                password: 'password123',
                role: 'Standard User',
                companySite: 'Global Construction Inc.', // Legacy
                departmentId: seedDept.id,
                status: 'Active',
                avatarUrl: `https://i.pravatar.cc/150?u=user-default-1`,
            },
            {
                id: 'user-finn-byberg',
                fullName: 'Finn Byberg',
                email: 'finn@byberg.com',
                password: 'byberg66',
                role: 'Admin User',
                companySite: 'Byberg Consulting', // Legacy
                departmentId: seedDept.id,
                status: 'Active',
                avatarUrl: `https://i.pravatar.cc/150?u=user-finn-byberg`,
            }
        ];
        saveUsers(defaultUsers);
        seedRolePermissions();
    }
};