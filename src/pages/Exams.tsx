import { useAllExams } from '../hooks/useExams';
import { FileText, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Exams = () => {
  const { data: exams, isLoading, error } = useAllExams();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-red-500/50">
        <p className="text-red-400 font-medium">Failed to load exams</p>
        <p className="text-slate-400 text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-50">Exam management</h1>
      <p className="text-slate-400 text-sm">
        One exam per chapter. Manage exams from here or via Courses → [course] → Chapters → Add / Manage exam.
      </p>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Chapter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Passing score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {!exams?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    <FileText className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                    <p>No exams yet.</p>
                    <p className="text-sm mt-1">
                      Go to <Link to="/courses" className="text-indigo-400 hover:text-indigo-300">Courses</Link>, open a course, then use “Add / Manage exam” on a chapter.
                    </p>
                  </td>
                </tr>
              ) : (
                exams.map((exam: any) => (
                  <tr key={exam.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {exam.course?.title ?? '—'} <span className="text-slate-500">({exam.course?.level ?? '—'})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                      {exam.chapter?.title ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">{exam.passing_score}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">{exam.questionCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/chapters/${exam.chapter_id}/exam`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
