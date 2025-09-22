import { supabase } from '@/integrations/supabase/client';
import { AppNotification } from '../../types';

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const createNotification = async (notification: {
  user_id: string;
  title: string;
  message: string;
  type?: string;
}) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  return { data, error };
};

export const markNotificationAsRead = async (id: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteNotification = async (id: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  return { error };
};