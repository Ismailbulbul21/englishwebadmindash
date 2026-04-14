import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLessons, useCreateLesson, LESSON_LEVELS } from '../hooks/useLessons';
import { Plus, BookOpen, Pencil } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import type { EnglishLevel } from '../types/database';

const createSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  title: z.string().min(1),
  subtitle: z.string().min(1),
});

type CreateForm = z.infer<typeof createSchema>;

export const Lessons = () => {
  const [level, setLevel] = useState<string>('');
  const [open, setOpen] = useState(false);
  const { data: lessons, isLoading } = useLessons(level || undefined);
  const create = useCreateLesson();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { level: 'beginner', title: '', subtitle: '' },
  });

  const onCreate = async (form: CreateForm) => {
    const lvl = form.level as EnglishLevel;
    const { data: maxRow } = await supabase
      .from('lessons')
      .select('position')
      .eq('level', lvl)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPos = (maxRow?.position ?? 0) + 1;
    await create.mutateAsync({
      level: lvl,
      title: form.title,
      subtitle: form.subtitle,
      position: nextPos,
      estimated_minutes: 5,
      is_published: false,
      unit_number: 1,
      unit_title: 'Unit 1',
      difficulty_band: 'very_easy',
    });
    setOpen(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-indigo-400" />
          Lessons
        </h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200"
          >
            <option value="">All levels</option>
            {LESSON_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <Plus className="h-4 w-4" />
            New lesson
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Published</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(lessons ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No lessons yet.
                  </td>
                </tr>
              ) : (
                (lessons ?? []).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-700/40">
                    <td className="px-4 py-3 text-sm text-slate-300 capitalize">{row.level}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{row.position}</td>
                    <td className="px-4 py-3 text-sm text-slate-100 font-medium">{row.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {row.unit_number}: {row.unit_title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${row.is_published ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-200'}`}
                      >
                        {row.is_published ? 'Yes' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{row.difficulty_band.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/lessons/${row.id}`}
                        className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold text-slate-50 mb-4">Create lesson</Dialog.Title>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Level</label>
                <select {...register('level')} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200">
                  {LESSON_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                {errors.level && <p className="text-red-400 text-xs mt-1">{errors.level.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input {...register('title')} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Subtitle</label>
                <input {...register('subtitle')} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" />
                {errors.subtitle && <p className="text-red-400 text-xs mt-1">{errors.subtitle.message}</p>}
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  Create
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
