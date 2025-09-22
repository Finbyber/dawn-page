import { supabase } from '@/integrations/supabase/client';
import { Department } from '../../types';

export const getDepartments = async () => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  return { data, error };
};

export const getDepartmentById = async (id: string) => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

export const createDepartment = async (department: {
  name: string;
  description?: string;
}) => {
  const { data, error } = await supabase
    .from('departments')
    .insert(department)
    .select()
    .single();

  return { data, error };
};

export const updateDepartment = async (id: string, updates: Partial<Department>) => {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteDepartment = async (id: string) => {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id);

  return { error };
};