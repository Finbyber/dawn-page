import { supabase } from '@/integrations/supabase/client';
import { Report } from '../../types';

export const createReport = async (reportData: {
  type: Report['type'];
  title: string;
  description?: string;
  location?: string;
  severity?: string;
  data?: any;
  photos?: string[];
}) => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      ...reportData,
      incident_date: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
};

export const getReports = async (userId?: string) => {
  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const updateReport = async (id: string, updates: Partial<Report>) => {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteReport = async (id: string) => {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  return { error };
};