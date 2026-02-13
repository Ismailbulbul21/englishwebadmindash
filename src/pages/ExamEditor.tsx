import { useParams, Link } from 'react-router-dom';
import { useExam, useCreateExam, useUpdateExam, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from '../hooks/useExams';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@headlessui/react';
import type { CorrectAnswer } from '../types/database';
const questionSchema = z.object({
  question_text: z.string().min(1),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().min(1),
  option_d: z.string().min(1),
  correct_answer: z.enum(['a', 'b', 'c', 'd']),
  question_order: z.number().min(1),
});

type QuestionFormData = z.infer<typeof questionSchema>;

export const ExamEditor = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const { data: examData, isLoading } = useExam(chapterId || '');
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [passingScore, setPassingScore] = useState(examData?.exam?.passing_score || 70);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  });

  // Update passing score when exam data loads
  useEffect(() => {
    if (examData?.exam?.passing_score) {
      setPassingScore(examData.exam.passing_score);
    }
  }, [examData]);

  const handleCreateExam = () => {
    if (!chapterId) return;
    createExam.mutate({ chapterId, passingScore });
  };

  const handleUpdatePassingScore = () => {
    if (!examData?.exam) return;
    updateExam.mutate({ id: examData.exam.id, passing_score: passingScore });
  };

  const onSubmitQuestion = async (formData: QuestionFormData) => {
    if (!examData?.exam) return;

    const questionData = {
      ...formData,
      exam_id: examData.exam.id,
    };

    if (editingQuestion) {
      updateQuestion.mutate({ id: editingQuestion.id, ...questionData });
    } else {
      createQuestion.mutate(questionData);
    }

    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
    reset();
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    reset({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      question_order: question.question_order,
    });
    setIsQuestionModalOpen(true);
  };

  const handleDelete = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestion.mutate(questionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!examData) {
    return <div className="text-center text-slate-400">Loading exam data...</div>;
  }

  if (!examData.exam) {
    return (
      <div className="space-y-6">
        <Link
          to="/courses"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Courses</span>
        </Link>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
          <p className="text-slate-400 mb-4">No exam created for this chapter yet.</p>
          <button
            onClick={handleCreateExam}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Create Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/courses"
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Courses</span>
      </Link>

      {/* Exam Settings */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-slate-50 mb-4">Exam Settings</h2>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Passing Score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-32 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            />
          </div>
          <button
            onClick={handleUpdatePassingScore}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg mt-6"
          >
            Update Passing Score
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-50">Questions ({examData.questions.length})</h2>
          <button
            onClick={() => {
              setEditingQuestion(null);
              reset({
                question_order: examData.questions.length + 1,
              });
              setIsQuestionModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="space-y-4">
          {examData.questions.map((question: any, index: number) => (
            <div key={question.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-slate-300">Q{index + 1}:</span>
                    <span className="text-sm text-slate-200">{question.question_text}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className={`p-2 rounded ${question.correct_answer === 'a' ? 'bg-emerald-900/30 border border-emerald-500' : 'bg-slate-600'}`}>
                      <span className="text-xs text-slate-400">A:</span>
                      <span className="text-sm text-slate-200 ml-2">{question.option_a}</span>
                    </div>
                    <div className={`p-2 rounded ${question.correct_answer === 'b' ? 'bg-emerald-900/30 border border-emerald-500' : 'bg-slate-600'}`}>
                      <span className="text-xs text-slate-400">B:</span>
                      <span className="text-sm text-slate-200 ml-2">{question.option_b}</span>
                    </div>
                    <div className={`p-2 rounded ${question.correct_answer === 'c' ? 'bg-emerald-900/30 border border-emerald-500' : 'bg-slate-600'}`}>
                      <span className="text-xs text-slate-400">C:</span>
                      <span className="text-sm text-slate-200 ml-2">{question.option_c}</span>
                    </div>
                    <div className={`p-2 rounded ${question.correct_answer === 'd' ? 'bg-emerald-900/30 border border-emerald-500' : 'bg-slate-600'}`}>
                      <span className="text-xs text-slate-400">D:</span>
                      <span className="text-sm text-slate-200 ml-2">{question.option_d}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(question)}
                    className="p-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Modal */}
      <Dialog open={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-slate-800 rounded-lg p-6 border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold text-slate-50 mb-4">
              {editingQuestion ? 'Edit Question' : 'Create Question'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmitQuestion)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Question Text</label>
                <textarea
                  {...register('question_text')}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
                />
                {errors.question_text && (
                  <p className="mt-1 text-sm text-red-400">{errors.question_text.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Option A</label>
                  <input
                    {...register('option_a')}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
                  />
                  {errors.option_a && <p className="mt-1 text-sm text-red-400">{errors.option_a.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Option B</label>
                  <input
                    {...register('option_b')}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
                  />
                  {errors.option_b && <p className="mt-1 text-sm text-red-400">{errors.option_b.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Option C</label>
                  <input
                    {...register('option_c')}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
                  />
                  {errors.option_c && <p className="mt-1 text-sm text-red-400">{errors.option_c.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Option D</label>
                  <input
                    {...register('option_d')}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
                  />
                  {errors.option_d && <p className="mt-1 text-sm text-red-400">{errors.option_d.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Correct Answer</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['a', 'b', 'c', 'd'] as CorrectAnswer[]).map((answer) => (
                    <label key={answer} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        {...register('correct_answer')}
                        value={answer}
                        className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600"
                      />
                      <span className="text-slate-200 uppercase">{answer}</span>
                    </label>
                  ))}
                </div>
                {errors.correct_answer && (
                  <p className="mt-1 text-sm text-red-400">{errors.correct_answer.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Question Order</label>
                <input
                  type="number"
                  {...register('question_order', { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
                />
                {errors.question_order && (
                  <p className="mt-1 text-sm text-red-400">{errors.question_order.message}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  {editingQuestion ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuestionModalOpen(false);
                    setEditingQuestion(null);
                    reset();
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
