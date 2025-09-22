import React, { useState, useEffect } from 'react';
import { Screen } from '../../types';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

// Import screens
import HomeScreen from '../../screens/HomeScreen';
import IncidentReportScreen from '../../screens/IncidentReportScreen';
import NearMissReportScreen from '../../screens/NearMissReportScreen';
import SafetyInspectionScreen from '../../screens/SafetyInspectionScreen';
import EnvironmentalReportScreen from '../../screens/EnvironmentalReportScreen';
import ReportsScreen from '../../screens/ReportsScreen';
import DashboardScreen from '../../screens/DashboardScreen';
import NotificationsScreen from '../../screens/NotificationsScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import DevMenuScreen from '../../screens/DevMenuScreen';
import ReportDetailScreen from '../../screens/ReportDetailScreen';

// Import components
import BottomNav from '../../components/BottomNav';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const HSEApp = () => {
  const { profile, signOut, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const isOnline = useOnlineStatus();

  // Set up dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Default permissions - can be expanded based on user role
  const permissions = {
    [Screen.IncidentReport]: true,
    [Screen.NearMissReport]: true,
    [Screen.SafetyInspection]: true,
    [Screen.EnvironmentalReport]: true,
  };

  const handleNavigation = (screen: Screen) => {
    setCurrentScreen(screen);
    setIsEditing(false);
    setSelectedReportId(null);
  };

  const handleReportSelect = (reportId: string) => {
    setSelectedReportId(reportId);
    setCurrentScreen(Screen.ReportDetail);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HSE System...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Home:
        return (
          <HomeScreen
            onNavigate={handleNavigation}
            permissions={permissions}
            isOnline={isOnline}
          />
        );
      case Screen.IncidentReport:
        return (
          <IncidentReportScreen
            setScreen={setCurrentScreen}
            user={profile}
            onFinishEditing={handleFinishEditing}
          />
        );
      case Screen.NearMissReport:
        return (
          <NearMissReportScreen
            setScreen={setCurrentScreen}
            user={profile}
            onFinishEditing={handleFinishEditing}
          />
        );
      case Screen.SafetyInspection:
        return (
          <SafetyInspectionScreen
            setScreen={setCurrentScreen}
            user={profile}
            onFinishEditing={handleFinishEditing}
          />
        );
      case Screen.EnvironmentalReport:
        return (
          <EnvironmentalReportScreen
            setScreen={setCurrentScreen}
            user={profile}
            onFinishEditing={handleFinishEditing}
          />
        );
      case Screen.Reports:
        return (
          <ReportsScreen
            setScreen={setCurrentScreen}
            onSelectReport={handleReportSelect}
            user={profile}
          />
        );
      case Screen.Dashboard:
        return <DashboardScreen setScreen={setCurrentScreen} />;
      case Screen.Notifications:
        return (
          <NotificationsScreen
            setScreen={setCurrentScreen}
            user={profile}
          />
        );
      case Screen.Profile:
        return (
          <ProfileScreen
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            setScreen={setCurrentScreen}
            user={profile}
          />
        );
      case Screen.DevMenu:
        return (
          <DevMenuScreen
            setScreen={setCurrentScreen}
            user={profile}
          />
        );
      case Screen.ReportDetail:
        return (
          <ReportDetailScreen
            reportId={selectedReportId}
            setScreen={setCurrentScreen}
            user={profile}
          />
        );
      default:
        return (
          <HomeScreen
            onNavigate={handleNavigation}
            permissions={permissions}
            isOnline={isOnline}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="pb-16">
        {renderScreen()}
      </main>
      
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={handleNavigation}
        isEditing={isEditing}
        user={profile}
      />
    </div>
  );
};

export default HSEApp;