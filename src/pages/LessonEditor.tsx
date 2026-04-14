import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  useLessonAdmin,
  useUpdateLesson,
  useDeleteLesson,
  useUpsertSection,
  useDeleteSection,
  useUpsertLessonItem,
  useDeleteLessonItem,
  useUpsertQuizQuestion,
  useDeleteQuizQuestion,
  LESSON_LEVELS,
  DIFFICULTY_BANDS,
  SECTION_KEYS,
  ITEM_TYPES,
  QUIZ_TYPES,
} from '../hooks/useLessons';
import { ArrowLeft, Trash2 } from 'lucide-react';
import type { EnglishLevel, LessonDifficultyBand, LessonItemType, LessonQuizQuestionType, LessonSectionKey } from '../types/database';

type Tab = 'details' | 'sections' | 'items' | 'quiz';

export const LessonEditor = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const id = lessonId ?? '';
  const { data, isLoading, error } = useLessonAdmin(id);
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const upsertSection = useUpsertSection();
  const deleteSection = useDeleteSection();
  const upsertItem = useUpsertLessonItem();
  const deleteItem = useDeleteLessonItem();
  const upsertQ = useUpsertQuizQuestion();
  const deleteQ = useDeleteQuizQuestion();
  const [tab, setTab] = useState<Tab>('details');

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-400">Failed to load lesson</div>;
  }

  const { lesson, sections, items, questions } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/lessons" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          Lessons
        </Link>
        <h1 className="text-2xl font-bold text-slate-50 flex-1 min-w-0 truncate">{lesson.title}</h1>
        <button
          type="button"
          className="text-sm px-3 py-1.5 rounded-lg bg-red-900/40 text-red-300 hover:bg-red-900/60 inline-flex items-center gap-1"
          onClick={async () => {
            if (!confirm('Delete this lesson and all related content?')) return;
            await deleteLesson.mutateAsync(id);
            navigate('/lessons');
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete lesson
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        {(['details', 'sections', 'items', 'quiz'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <DetailsForm
          lesson={lesson}
          onSave={(patch) => updateLesson.mutate({ id: lesson.id, ...patch })}
        />
      )}

      {tab === 'sections' && (
        <SectionsPanel
          lessonId={id}
          sections={sections}
          onSave={(row) => upsertSection.mutate(row)}
          onDelete={(sid) => deleteSection.mutate({ id: sid, lessonId: id })}
        />
      )}

      {tab === 'items' && (
        <ItemsPanel
          lessonId={id}
          items={items}
          onSave={(row) => upsertItem.mutate(row)}
          onDelete={(iid) => deleteItem.mutate({ id: iid, lessonId: id })}
        />
      )}

      {tab === 'quiz' && (
        <QuizPanel
          lessonId={id}
          questions={questions}
          onSave={(row) => upsertQ.mutate(row)}
          onDelete={(qid) => deleteQ.mutate({ id: qid, lessonId: id })}
        />
      )}
    </div>
  );
};

function DetailsForm({
  lesson,
  onSave,
}: {
  lesson: import('../types/database').Lesson;
  onSave: (p: Partial<import('../types/database').Lesson>) => void;
}) {
  const [form, setForm] = useState({
    level: lesson.level,
    title: lesson.title,
    subtitle: lesson.subtitle,
    description: lesson.description ?? '',
    position: lesson.position,
    estimated_minutes: lesson.estimated_minutes,
    is_published: lesson.is_published,
    unit_number: lesson.unit_number,
    unit_title: lesson.unit_title,
    goal: lesson.goal ?? '',
    pronunciation_focus: lesson.pronunciation_focus ?? '',
    grammar_focus: lesson.grammar_focus ?? '',
    slug: lesson.slug ?? '',
    difficulty_band: lesson.difficulty_band,
  });

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-slate-400">
          Level
          <select
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as EnglishLevel }))}
          >
            {LESSON_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-400">
          Position (order in level)
          <input
            type="number"
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))}
          />
        </label>
        <label className="text-sm text-slate-400 md:col-span-2">
          Title
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </label>
        <label className="text-sm text-slate-400 md:col-span-2">
          Subtitle
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          />
        </label>
        <label className="text-sm text-slate-400 md:col-span-2">
          Description
          <textarea
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 min-h-[80px]"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <label className="text-sm text-slate-400">
          Estimated minutes (1–60)
          <input
            type="number"
            min={1}
            max={60}
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.estimated_minutes}
            onChange={(e) => setForm((f) => ({ ...f, estimated_minutes: Number(e.target.value) }))}
          />
        </label>
        <label className="text-sm text-slate-400">
          Difficulty band
          <select
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.difficulty_band}
            onChange={(e) => setForm((f) => ({ ...f, difficulty_band: e.target.value as LessonDifficultyBand }))}
          >
            {DIFFICULTY_BANDS.map((d) => (
              <option key={d} value={d}>
                {d.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-400">
          Unit number
          <input
            type="number"
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.unit_number}
            onChange={(e) => setForm((f) => ({ ...f, unit_number: Number(e.target.value) }))}
          />
        </label>
        <label className="text-sm text-slate-400">
          Unit title
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.unit_title}
            onChange={(e) => setForm((f) => ({ ...f, unit_title: e.target.value }))}
          />
        </label>
        <label className="text-sm text-slate-400 md:col-span-2">
          Slug (optional)
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </label>
        <label className="text-sm text-slate-400 md:col-span-2">
          Goal
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.goal}
            onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
          />
        </label>
        <label className="text-sm text-slate-400 md:col-span-2">
          Pronunciation focus
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.pronunciation_focus}
            onChange={(e) => setForm((f) => ({ ...f, pronunciation_focus: e.target.value }))}
          />
        </label>
        <label className="text-sm text-slate-400 md:col-span-2">
          Grammar focus
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={form.grammar_focus}
            onChange={(e) => setForm((f) => ({ ...f, grammar_focus: e.target.value }))}
          />
        </label>
        <label className="flex items-center gap-2 text-slate-300 md:col-span-2">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
          />
          Published
        </label>
      </div>
      <button
        type="button"
        onClick={() =>
          onSave({
            level: form.level,
            title: form.title,
            subtitle: form.subtitle,
            description: form.description || null,
            position: form.position,
            estimated_minutes: form.estimated_minutes,
            is_published: form.is_published,
            unit_number: form.unit_number,
            unit_title: form.unit_title,
            goal: form.goal || null,
            pronunciation_focus: form.pronunciation_focus || null,
            grammar_focus: form.grammar_focus || null,
            slug: form.slug || null,
            difficulty_band: form.difficulty_band,
          })
        }
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
      >
        Save lesson
      </button>
    </div>
  );
}

function SectionsPanel({
  lessonId,
  sections,
  onSave,
  onDelete,
}: {
  lessonId: string;
  sections: import('../types/database').LessonSection[];
  onSave: (row: Partial<import('../types/database').LessonSection> & { lesson_id: string }) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <SectionRow key={s.id} lessonId={lessonId} section={s} onSave={onSave} onDelete={onDelete} />
      ))}
      <button
        type="button"
        className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm"
        onClick={() =>
          onSave({
            lesson_id: lessonId,
            position: (sections[sections.length - 1]?.position ?? 0) + 1,
            section_key: 'warm_up',
            title: 'New section',
            payload: {},
          })
        }
      >
        Add section
      </button>
    </div>
  );
}

function SectionRow({
  lessonId,
  section,
  onSave,
  onDelete,
}: {
  lessonId: string;
  section: import('../types/database').LessonSection;
  onSave: (row: Partial<import('../types/database').LessonSection> & { lesson_id: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [position, setPosition] = useState(section.position);
  const [key, setKey] = useState<LessonSectionKey>(section.section_key);
  const [payloadText, setPayloadText] = useState(JSON.stringify(section.payload ?? {}, null, 2));

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm text-slate-400">
          Section key
          <select
            className="mt-1 block px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={key}
            onChange={(e) => setKey(e.target.value as LessonSectionKey)}
          >
            {SECTION_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-400 flex-1 min-w-[120px]">
          Title
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="text-sm text-slate-400 w-24">
          Order
          <input
            type="number"
            className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
          />
        </label>
      </div>
      <label className="block text-sm text-slate-400">
        Payload (JSON)
        <textarea
          className="mt-1 w-full font-mono text-sm px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 min-h-[120px]"
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm"
          onClick={() => {
            let payload: Record<string, unknown> = {};
            try {
              payload = JSON.parse(payloadText) as Record<string, unknown>;
            } catch {
              alert('Invalid JSON payload');
              return;
            }
            onSave({ id: section.id, lesson_id: lessonId, position, section_key: key, title, payload });
          }}
        >
          Save
        </button>
        <button type="button" className="px-3 py-1.5 bg-red-900/50 text-red-200 rounded-lg text-sm" onClick={() => onDelete(section.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

function ItemsPanel({
  lessonId,
  items,
  onSave,
  onDelete,
}: {
  lessonId: string;
  items: import('../types/database').LessonItem[];
  onSave: (row: Partial<import('../types/database').LessonItem> & { lesson_id: string }) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <ItemRow key={it.id} lessonId={lessonId} item={it} onSave={onSave} onDelete={onDelete} />
      ))}
      <button
        type="button"
        className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm"
        onClick={() =>
          onSave({
            lesson_id: lessonId,
            position: (items[items.length - 1]?.position ?? 0) + 1,
            text: 'New phrase',
            item_type: 'phrase',
          })
        }
      >
        Add item
      </button>
    </div>
  );
}

function ItemRow({
  lessonId,
  item,
  onSave,
  onDelete,
}: {
  lessonId: string;
  item: import('../types/database').LessonItem;
  onSave: (row: Partial<import('../types/database').LessonItem> & { lesson_id: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState(item.text);
  const [translation, setTranslation] = useState(item.translation ?? '');
  const [hint, setHint] = useState(item.hint_text ?? '');
  const [audio, setAudio] = useState(item.audio_url ?? '');
  const [position, setPosition] = useState(item.position);
  const [itemType, setItemType] = useState<LessonItemType>(item.item_type);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <label className="text-sm text-slate-400 md:col-span-2">
        Text
        <input className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <label className="text-sm text-slate-400">
        Type
        <select
          className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
          value={itemType}
          onChange={(e) => setItemType(e.target.value as LessonItemType)}
        >
          {ITEM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-slate-400">
        Position
        <input type="number" className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={position} onChange={(e) => setPosition(Number(e.target.value))} />
      </label>
      <label className="text-sm text-slate-400 md:col-span-2">
        Translation
        <input className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={translation} onChange={(e) => setTranslation(e.target.value)} />
      </label>
      <label className="text-sm text-slate-400 md:col-span-2">
        Hint
        <input className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={hint} onChange={(e) => setHint(e.target.value)} />
      </label>
      <label className="text-sm text-slate-400 md:col-span-2">
        Audio URL
        <input className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={audio} onChange={(e) => setAudio(e.target.value)} />
      </label>
      <div className="flex gap-2 md:col-span-2">
        <button
          type="button"
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm"
          onClick={() =>
            onSave({
              id: item.id,
              lesson_id: lessonId,
              position,
              text,
              translation: translation || null,
              hint_text: hint || null,
              audio_url: audio || null,
              item_type: itemType,
            })
          }
        >
          Save
        </button>
        <button type="button" className="px-3 py-1.5 bg-red-900/50 text-red-200 rounded-lg text-sm" onClick={() => onDelete(item.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

function QuizPanel({
  lessonId,
  questions,
  onSave,
  onDelete,
}: {
  lessonId: string;
  questions: import('../types/database').LessonQuizQuestion[];
  onSave: (row: Partial<import('../types/database').LessonQuizQuestion> & { lesson_id: string }) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <QuizRow key={q.id} lessonId={lessonId} question={q} onSave={onSave} onDelete={onDelete} />
      ))}
      <button
        type="button"
        className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm"
        onClick={() =>
          onSave({
            lesson_id: lessonId,
            position: (questions[questions.length - 1]?.position ?? 0) + 1,
            question_type: 'meaning_choice',
            question_text: 'New question',
            correct_answer: 'a',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
          })
        }
      >
        Add question
      </button>
    </div>
  );
}

function QuizRow({
  lessonId,
  question,
  onSave,
  onDelete,
}: {
  lessonId: string;
  question: import('../types/database').LessonQuizQuestion;
  onSave: (row: Partial<import('../types/database').LessonQuizQuestion> & { lesson_id: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [questionText, setQuestionText] = useState(question.question_text);
  const [qType, setQType] = useState<LessonQuizQuestionType>(question.question_type);
  const [position, setPosition] = useState(question.position);
  const [correct, setCorrect] = useState(question.correct_answer);
  const [a, setA] = useState(question.option_a ?? '');
  const [b, setB] = useState(question.option_b ?? '');
  const [c, setC] = useState(question.option_c ?? '');
  const [d, setD] = useState(question.option_d ?? '');

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <label className="text-sm text-slate-400">
          Type
          <select
            className="mt-1 block px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            value={qType}
            onChange={(e) => setQType(e.target.value as LessonQuizQuestionType)}
          >
            {QUIZ_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-400">
          Position
          <input type="number" className="mt-1 block px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 w-24" value={position} onChange={(e) => setPosition(Number(e.target.value))} />
        </label>
        <label className="text-sm text-slate-400 flex-1 min-w-[200px]">
          Correct answer (text; often a/b/c/d for multiple choice)
          <input className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={correct} onChange={(e) => setCorrect(e.target.value)} />
        </label>
      </div>
      <label className="block text-sm text-slate-400">
        Question
        <textarea className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 min-h-[60px]" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input placeholder="Option A" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={a} onChange={(e) => setA(e.target.value)} />
        <input placeholder="Option B" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={b} onChange={(e) => setB(e.target.value)} />
        <input placeholder="Option C" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={c} onChange={(e) => setC(e.target.value)} />
        <input placeholder="Option D" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" value={d} onChange={(e) => setD(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm"
          onClick={() =>
            onSave({
              id: question.id,
              lesson_id: lessonId,
              position,
              question_type: qType,
              question_text: questionText,
              correct_answer: correct,
              option_a: a || null,
              option_b: b || null,
              option_c: c || null,
              option_d: d || null,
            })
          }
        >
          Save
        </button>
        <button type="button" className="px-3 py-1.5 bg-red-900/50 text-red-200 rounded-lg text-sm" onClick={() => onDelete(question.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}
