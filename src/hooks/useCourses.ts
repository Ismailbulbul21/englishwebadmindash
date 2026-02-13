import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// appforenglish: courses (level, title, description, is_published, course_order) -> chapters (course_id, title, video_url, chapter_order, is_published)
const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const useCourses = (level?: string) => {
  return useQuery({
    queryKey: ['courses', level],
    queryFn: async () => {
      let query = supabase.from('courses').select('*');
      if (level) query = query.eq('level', level);
      const { data, error } = await query.order('course_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (courseError) throw courseError;
      const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', courseId)
        .order('chapter_order', { ascending: true });
      return { course, chapters: chapters ?? [] };
    },
    enabled: !!courseId,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      level: string;
      title: string;
      description?: string;
      course_order?: number;
      is_published?: boolean;
    }) => {
      const { data, error } = await supabase.from('courses').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      level?: string;
      title?: string;
      description?: string;
      course_order?: number;
      is_published?: boolean;
    }) => {
      const { error } = await supabase
        .from('courses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', v.id] });
      toast.success('Course updated successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      course_id: string;
      title: string;
      video_url?: string;
      video_duration?: number;
      chapter_order?: number;
      is_published?: boolean;
    }) => {
      const { data, error } = await supabase.from('chapters').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['course', v.course_id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Chapter created successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      course_id?: string;
      title?: string;
      video_url?: string;
      video_duration?: number;
      chapter_order?: number;
      is_published?: boolean;
    }) => {
      const { error } = await supabase
        .from('chapters')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Chapter updated successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chapterId: string) => {
      const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Chapter deleted successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export { COURSE_LEVELS };
