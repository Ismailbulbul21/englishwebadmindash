import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type {
  Lesson,
  LessonItem,
  LessonQuizQuestion,
  LessonSection,
  EnglishLevel,
  LessonDifficultyBand,
  LessonSectionKey,
  LessonItemType,
  LessonQuizQuestionType,
} from '../types/database';

export const LESSON_LEVELS: EnglishLevel[] = ['beginner', 'intermediate', 'advanced'];
export const DIFFICULTY_BANDS: LessonDifficultyBand[] = ['very_easy', 'developing', 'challenging', 'mastery'];
export const SECTION_KEYS: LessonSectionKey[] = [
  'warm_up',
  'core_language',
  'conversation',
  'practice',
  'speaking',
  'recap',
];
export const ITEM_TYPES: LessonItemType[] = ['vocabulary', 'phrase'];
export const QUIZ_TYPES: LessonQuizQuestionType[] = ['meaning_choice', 'fill_blank', 'word_order'];

export const useLessons = (level?: string) => {
  return useQuery({
    queryKey: ['lessons', level],
    queryFn: async () => {
      let q = supabase.from('lessons').select('*');
      if (level) q = q.eq('level', level);
      const { data, error } = await q.order('level', { ascending: true }).order('position', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Lesson[];
    },
  });
};

export const useLessonAdmin = (lessonId: string) => {
  return useQuery({
    queryKey: ['lessonAdmin', lessonId],
    queryFn: async () => {
      const { data: lesson, error: le } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
      if (le) throw le;
      const { data: sections } = await supabase
        .from('lesson_sections')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true });
      const { data: items } = await supabase
        .from('lesson_items')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true });
      const { data: questions } = await supabase
        .from('lesson_quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true });
      return {
        lesson: lesson as Lesson,
        sections: (sections ?? []) as LessonSection[],
        items: (items ?? []) as LessonItem[],
        questions: (questions ?? []) as LessonQuizQuestion[],
      };
    },
    enabled: !!lessonId,
  });
};

export const useCreateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      level: EnglishLevel;
      title: string;
      subtitle: string;
      position: number;
      estimated_minutes?: number;
      is_published?: boolean;
      unit_number?: number;
      unit_title?: string;
      difficulty_band?: LessonDifficultyBand;
    }) => {
      const { data, error } = await supabase.from('lessons').insert(payload).select().single();
      if (error) throw error;
      return data as Lesson;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lesson> & { id: string }) => {
      const { error } = await supabase
        .from('lessons')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['lessons'] });
      qc.invalidateQueries({ queryKey: ['lessonAdmin', v.id] });
      toast.success('Lesson updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['lessons'] });
      qc.invalidateQueries({ queryKey: ['lessonAdmin', id] });
      toast.success('Lesson deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpsertSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<LessonSection> & { lesson_id: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from('lesson_sections')
          .update({
            position: row.position,
            section_key: row.section_key,
            title: row.title,
            payload: row.payload ?? {},
          })
          .eq('id', row.id);
        if (error) throw error;
        return row.id;
      }
      const { data, error } = await supabase.from('lesson_sections').insert(row).select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['lessonAdmin', v.lesson_id] });
      toast.success('Section saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lessonId }: { id: string; lessonId: string }) => {
      void lessonId;
      const { error } = await supabase.from('lesson_sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['lessonAdmin', v.lessonId] });
      toast.success('Section removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpsertLessonItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<LessonItem> & { lesson_id: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from('lesson_items')
          .update({
            position: row.position,
            text: row.text,
            hint_text: row.hint_text,
            audio_url: row.audio_url,
            item_type: row.item_type,
            translation: row.translation,
          })
          .eq('id', row.id);
        if (error) throw error;
        return row.id;
      }
      const { data, error } = await supabase.from('lesson_items').insert(row).select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['lessonAdmin', v.lesson_id] });
      toast.success('Item saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteLessonItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lessonId }: { id: string; lessonId: string }) => {
      void lessonId;
      const { error } = await supabase.from('lesson_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['lessonAdmin', v.lessonId] });
      toast.success('Item removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpsertQuizQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<LessonQuizQuestion> & { lesson_id: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from('lesson_quiz_questions')
          .update({
            position: row.position,
            question_type: row.question_type,
            question_text: row.question_text,
            option_a: row.option_a,
            option_b: row.option_b,
            option_c: row.option_c,
            option_d: row.option_d,
            correct_answer: row.correct_answer,
          })
          .eq('id', row.id);
        if (error) throw error;
        return row.id;
      }
      const { data, error } = await supabase.from('lesson_quiz_questions').insert(row).select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['lessonAdmin', v.lesson_id] });
      toast.success('Question saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteQuizQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lessonId }: { id: string; lessonId: string }) => {
      void lessonId;
      const { error } = await supabase.from('lesson_quiz_questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['lessonAdmin', v.lessonId] });
      toast.success('Question removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
