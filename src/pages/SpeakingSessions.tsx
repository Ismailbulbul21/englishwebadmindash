import { MessageSquare } from 'lucide-react';

export const SpeakingSessions = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-50">Speaking sessions</h1>
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-300 font-medium">This project does not use speaking sessions</p>
        <p className="text-slate-400 text-sm mt-2">
          There is no speaking_sessions table in this database. Chat is available via chat_messages per class.
        </p>
      </div>
    </div>
  );
};
