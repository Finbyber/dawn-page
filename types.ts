export interface FieldUser {
  id: string;
  email: string;
  display_name?: string;
  fullName?: string;
  role: string;
  department_id?: string;
  departmentId?: string;
  avatar_url?: string;
  avatarUrl?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Report {
  id: string;
  user_id: string;
  type: 'Incident' | 'Near Miss' | 'Safety Inspection' | 'Environmental';
  title: string;
  description?: string;
  location?: string;
  severity?: string;
  status: 'Submitted' | 'Under Review' | 'Resolved' | 'Closed' | 'In Review';
  incident_date?: string;
  data?: any;
  photos?: string[];
  gps_coordinates?: { x: number; y: number };
  created_at?: string;
  updated_at?: string;
  lastEdited?: string;
  assignedTo?: string;
  date: string; // For compatibility with existing code
  submittedBy: string; // For compatibility with existing code
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  isRead: boolean;
  timestamp?: string;
  created_at?: string;
}

export enum Screen {
  Home = 'Home',
  IncidentReport = 'IncidentReport',
  NearMissReport = 'NearMissReport',
  SafetyInspection = 'SafetyInspection',
  EnvironmentalReport = 'EnvironmentalReport',
  Reports = 'Reports',
  Dashboard = 'Dashboard',
  Notifications = 'Notifications',
  Profile = 'Profile',
  DevMenu = 'DevMenu',
  ReportDetail = 'ReportDetail',
}

export enum AdminScreen {
  Dashboard = 'Dashboard',
  Users = 'Users',
  Departments = 'Departments',
  RoleManagement = 'RoleManagement',
  Functions = 'Functions',
}

export interface ChecklistPermissions {
  [Screen.IncidentReport]: boolean;
  [Screen.NearMissReport]: boolean;
  [Screen.SafetyInspection]: boolean;
  [Screen.EnvironmentalReport]: boolean;
}

export interface ChecklistItem {
  id?: string;
  text: string;
  status: 'Pass' | 'Fail' | 'N/A';
  notes?: string;
}

export interface SafetyInspectionData {
  inspectionDate?: string;
  siteArea?: string;
  inspectorName?: string;
  notes?: string;
  photos?: string[];
  gps?: any;
  checklist: Array<{
    id?: string;
    text: string;
    status: 'Pass' | 'Fail' | 'N/A';
    notes?: string;
  }>;
}

export interface IncidentReportData {
  dateTime: string;
  location: string;
  incidentType: string;
  severity: string;
  description: string;
  photos?: string[];
  gps?: any;
}

export interface NearMissReportData {
  dateTime: string;
  location: string;
  description: string;
  contributingFactors: string;
  correctiveActionNeeded: boolean;
  photos?: string[];
  gps?: any;
}

export interface EnvironmentalReportData {
  date: string;
  location: string;
  concernType: string;
  description: string;
  actionsTaken: string;
  photos?: string[];
  gps?: any;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
  completed: boolean;
  createdAt: string;
}

export interface RolePermissions {
  [role: string]: ChecklistPermissions;
}

export interface FeaturePermissions {
  canViewReports: boolean;
  canViewDashboard: boolean;
  canAccessAdminPanel: boolean;
  canViewPhotoGallery?: boolean;
  canDeleteReport?: boolean;
}

export interface RoleFeaturePermissions {
  [role: string]: FeaturePermissions;
}

export interface OfflineEdit {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
}

export type UserRole = 'Field User' | 'Supervisor' | 'Manager' | 'Admin User' | 'Super User';