import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createReport } from '@/services/reports';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const SimpleHSEApp = () => {
  const { profile, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [submittingReport, setSubmittingReport] = useState<string | null>(null);

  const handleCreateReport = async (type: 'Incident' | 'Near Miss' | 'Safety Inspection' | 'Environmental') => {
    if (!profile) return;
    
    setSubmittingReport(type);
    
    try {
      const { data, error } = await createReport({
        type,
        title: `${type} Report - ${new Date().toLocaleDateString()}`,
        description: `Sample ${type.toLowerCase()} report created from HSE app`,
        location: 'Main Facility',
        severity: type === 'Incident' ? 'Medium' : undefined,
        data: {
          reportedBy: profile.display_name || profile.email,
          timestamp: new Date().toISOString(),
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: `Failed to create ${type.toLowerCase()} report: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${type} report created successfully!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${type.toLowerCase()} report`,
        variant: "destructive",
      });
    } finally {
      setSubmittingReport(null);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">HSE Management System</h1>
              <p className="text-gray-600">Health, Safety & Environment Portal</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{profile?.display_name || profile?.email}</p>
              <Badge variant="outline" className="mb-2">{profile?.role || 'Field User'}</Badge>
              <br />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { type: 'Incident' as const, icon: '⚠️', description: 'Report incidents and accidents' },
            { type: 'Near Miss' as const, icon: '💡', description: 'Report near miss events' },
            { type: 'Safety Inspection' as const, icon: '✅', description: 'Conduct safety inspections' },
            { type: 'Environmental' as const, icon: '🌍', description: 'Report environmental concerns' },
          ].map((item) => (
            <Card key={item.type} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="text-2xl mb-2">{item.icon}</div>
                <CardTitle className="text-lg">{item.type} Report</CardTitle>
                <CardDescription className="text-sm">{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleCreateReport(item.type)}
                  disabled={submittingReport === item.type}
                >
                  {submittingReport === item.type ? 'Creating...' : 'Create Report'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>Your HSE management capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">✅ Available Now</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• User Authentication & Profiles</li>
                  <li>• Database Integration</li>
                  <li>• Report Creation</li>
                  <li>• Secure Data Storage</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">🚧 Coming Soon</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Full Report Management</li>
                  <li>• Advanced Analytics Dashboard</li>
                  <li>• Notification System</li>
                  <li>• Photo Upload & Management</li>
                  <li>• Offline Sync Capabilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleHSEApp;