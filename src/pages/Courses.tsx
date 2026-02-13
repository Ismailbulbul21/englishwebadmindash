import { useState } from 'react';
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, COURSE_LEVELS } from '../hooks/useCourses';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@headlessui/react';

const courseSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  course_order: z.number().min(0),
  is_published: z.boolean(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export const Courses = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const { data: courses, isLoading } = useCourses(selectedLevel !== 'all' ? selectedLevel : undefined);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { is_published: true, course_order: 0 },
  });

  const onSubmit = async (data: CourseFormData) => {
    if (editingCourse) {
      updateCourse.mutate({ id: editingCourse.id, ...data });
    } else {
      createCourse.mutate(data);
    }
    setIsCreateModalOpen(false);
    setEditingCourse(null);
    reset();
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    reset({
      level: course.level,
      title: course.title,
      description: course.description ?? '',
      course_order: course.course_order ?? 0,
      is_published: course.is_published ?? true,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this course? Chapters may be affected.')) {
      deleteCourse.mutate(id);
    }
  };

  const grouped = (COURSE_LEVELS as unknown as string[]).reduce((acc, level) => {
    acc[level] = (courses ?? []).filter((c: any) => c.level === level);
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
        >
          <option value="all">All levels</option>
          {COURSE_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button
          onClick={() => { setEditingCourse(null); reset(); setIsCreateModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create course
        </button>
      </div>

      {COURSE_LEVELS.map((level) => {
        const list = grouped[level] ?? [];
        if (selectedLevel !== 'all' && selectedLevel !== level) return null;
        return (
          <div key={level} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-slate-50 mb-4 capitalize">{level}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((course: any) => (
                <div key={course.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-50">{course.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${course.is_published ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description ?? '—'}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span>Order: {course.course_order ?? 0}</span>
                    <span>{course.created_at ? format(new Date(course.created_at), 'MMM dd, yyyy') : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/courses/${course.id}/chapters`} className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm text-center">
                      Manage chapters
                    </Link>
                    <button onClick={() => handleEdit(course)} className="p-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-slate-800 rounded-lg p-6 border border-slate-700 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold text-slate-50 mb-4">
              {editingCourse ? 'Edit course' : 'Create course'}
            </Dialog.Title>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                <select {...register('level')} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200">
                  {COURSE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-400">{errors.level.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input {...register('title')} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" />
                {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea {...register('description')} rows={3} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Order</label>
                <input type="number" {...register('course_order', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" />
                {errors.course_order && <p className="mt-1 text-sm text-red-400">{errors.course_order.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('is_published')} className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded" />
                <label className="text-sm text-slate-300">Published</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{editingCourse ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => { setIsCreateModalOpen(false); setEditingCourse(null); reset(); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg">Cancel</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
