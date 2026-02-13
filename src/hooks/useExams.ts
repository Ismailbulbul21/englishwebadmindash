import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Exam, ExamQuestion } from '../types/database';
import { toast } from 'react-hot-toast';

export const useExam = (chapterId: string) => {
  return useQuery({
    queryKey: ['exam', chapterId],
    queryFn: async () => {
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('chapter_id', chapterId)
        .single();

      if (examError && examError.code !== 'PGRST116') {
        throw examError;
      }

      if (!exam) {
        return { exam: null, questions: [] };
      }

      const { data: questions } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('question_order', { ascending: true });

      return {
        exam,
        questions: questions || [],
      };
    },
    enabled: !!chapterId,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterId, passingScore = 70 }: { chapterId: string; passingScore?: number }) => {
      const { data, error } = await supabase
        .from('exams')
        .insert({ chapter_id: chapterId, passing_score: passingScore })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', variables.chapterId] });
      toast.success('Exam created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create exam');
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exam> & { id: string }) => {
      const { error } = await supabase
        .from('exams')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam'] });
      toast.success('Exam updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update exam');
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: Omit<ExamQuestion, 'id'>) => {
      const { data, error } = await supabase.from('exam_questions').insert(question).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', variables.exam_id] });
      toast.success('Question created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create question');
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExamQuestion> & { id: string }) => {
      const { error } = await supabase.from('exam_questions').update(updates).eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam'] });
      toast.success('Question updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update question');
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.from('exam_questions').delete().eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam'] });
      toast.success('Question deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete question');
    },
  });
};
