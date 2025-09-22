import { useState, useEffect } from 'react';
import { Report } from '../../types';
import { getReports } from '@/services/reports';

export const useReports = (userId?: string) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data, error } = await getReports(userId);
        
        if (error) {
          setError(error.message);
        } else {
          // Transform database data to match existing Report interface
          const transformedReports: Report[] = (data || []).map((item: any) => ({
            ...item,
            date: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            submittedBy: item.user_id,
          }));
          setReports(transformedReports);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  const refetch = async () => {
    try {
      setLoading(true);
      const { data, error } = await getReports(userId);
      
      if (error) {
        setError(error.message);
      } else {
        const transformedReports: Report[] = (data || []).map((item: any) => ({
          ...item,
          date: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          submittedBy: item.user_id,
        }));
        setReports(transformedReports);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { reports, loading, error, refetch };
};