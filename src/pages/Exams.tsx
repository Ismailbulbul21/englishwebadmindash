import { FileText } from 'lucide-react';

export const Exams = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-50">Exam management</h1>
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-300 font-medium">This project does not use exams</p>
        <p className="text-slate-400 text-sm mt-2">
          Content is organized as Subjects → Chapters → Lessons. Use the Courses page to manage subjects and chapters.
        </p>
      </div>
    </div>
  );
};
