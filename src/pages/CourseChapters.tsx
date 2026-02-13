import { useParams, Link } from 'react-router-dom';
import { useCourse, useCreateChapter, useUpdateChapter, useDeleteChapter } from '../hooks/useCourses';
import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@headlessui/react';

const chapterSchema = z.object({
  title: z.string().min(1),
  video_url: z.string().optional(),
  video_duration: z.number().min(0).optional(),
  chapter_order: z.number().min(0),
  is_published: z.boolean(),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

export const CourseChapters = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);

  const { data, isLoading } = useCourse(courseId || '');
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: { is_published: true, chapter_order: 0 },
  });

  const onSubmit = (formData: ChapterFormData) => {
    if (!courseId) return;
    const payload = { course_id: courseId, ...formData };
    if (editingChapter) {
      updateChapter.mutate({ id: editingChapter.id, ...payload });
    } else {
      createChapter.mutate(payload);
    }
    setIsCreateModalOpen(false);
    setEditingChapter(null);
    reset();
  };

  const handleEdit = (chapter: any) => {
    setEditingChapter(chapter);
    reset({
      title: chapter.title,
      video_url: chapter.video_url ?? '',
      video_duration: chapter.video_duration ?? 0,
      chapter_order: chapter.chapter_order ?? 0,
      is_published: chapter.is_published ?? true,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (chapterId: string) => {
    if (confirm('Delete this chapter?')) {
      deleteChapter.mutate(chapterId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-slate-400">Course not found</div>;
  }

  const course = data.course;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <button
          onClick={() => { setEditingChapter(null); reset(); setIsCreateModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add chapter
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h1 className="text-2xl font-bold text-slate-50 mb-2">{course.title}</h1>
        <p className="text-slate-400">{course.description ?? '—'}</p>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Video</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.chapters.map((chapter: any) => (
                <tr key={chapter.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">{chapter.chapter_order ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">{chapter.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {chapter.video_url ? (chapter.video_duration ? `${chapter.video_duration}m` : 'Yes') : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${chapter.is_published ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                      {chapter.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(chapter)} className="p-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(chapter.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-slate-800 rounded-lg p-6 border border-slate-700 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold text-slate-50 mb-4">
              {editingChapter ? 'Edit chapter' : 'Create chapter'}
            </Dialog.Title>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input {...register('title')} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" />
                {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Video URL</label>
                <input {...register('video_url')} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Video duration (minutes)</label>
                <input type="number" {...register('video_duration', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Order</label>
                <input type="number" {...register('chapter_order', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" />
                {errors.chapter_order && <p className="mt-1 text-sm text-red-400">{errors.chapter_order.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('is_published')} className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded" />
                <label className="text-sm text-slate-300">Published</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  {editingChapter ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setIsCreateModalOpen(false); setEditingChapter(null); reset(); }} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
