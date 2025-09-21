import React, { useState, useEffect } from 'react';
import { AdminScreen } from '../../types';
import AdminLoginScreen from './AdminLoginScreen';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboardScreen from './AdminDashboardScreen';
import AdminUsersScreen from './AdminUsersScreen';
import AdminFunctionsScreen from './AdminFunctionsScreen';
import AdminRoleManagementScreen from './AdminRoleManagementScreen';
import AdminDepartmentsScreen from './AdminDepartmentsScreen';

interface AdminAppProps {
    onExitAdmin?: () => void;
}

const AdminApp: React.FC<AdminAppProps> = ({ onExitAdmin }) => {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
    const [currentScreen, setCurrentScreen] = useState<AdminScreen>(AdminScreen.Dashboard);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to dark for admin

    useEffect(() => {
        // Simple session check
        const session = sessionStorage.getItem('adminLoggedIn');
        if (session === 'true') {
            setIsAdminLoggedIn(true);
        }

        // Apply dark mode
        document.documentElement.classList.add('dark');
    }, []);

    const handleLogin = () => {
        sessionStorage.setItem('adminLoggedIn', 'true');
        setIsAdminLoggedIn(true);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminLoggedIn');
        setIsAdminLoggedIn(false);
        setCurrentScreen(AdminScreen.Dashboard); // Reset to default
        if (onExitAdmin) {
            onExitAdmin();
        } else {
            window.location.href = '/';
        }
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case AdminScreen.Dashboard:
                return <AdminDashboardScreen />;
            case AdminScreen.Users:
                return <AdminUsersScreen />;
            case AdminScreen.Departments:
                return <AdminDepartmentsScreen />;
            case AdminScreen.Reminders:
                return <AdminFunctionsScreen />;
            case AdminScreen.RoleManagement:
                return <AdminRoleManagementScreen />;
            default:
                return <AdminDashboardScreen />;
        }
    };

    if (!isAdminLoggedIn) {
        return <AdminLoginScreen onLogin={handleLogin} />;
    }

    return (
        <AdminLayout currentScreen={currentScreen} setScreen={setCurrentScreen} onLogout={handleLogout}>
            {renderScreen()}
        </AdminLayout>
    );
};

export default AdminApp;