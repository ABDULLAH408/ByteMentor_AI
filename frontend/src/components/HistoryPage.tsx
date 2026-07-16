import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Calendar, ChevronRight, X, BookOpen, Cpu, Award } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface Lesson {
  lessonDate: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  learningObjective: string;
  explanation: string;
  lectureNotes?: string;
  realWorldExample: string;
  codeExample: string;
  quiz: QuizQuestion[];
  exercise: string;
  productivityTip: string;
  motivationalQuote: string;
  completed: boolean;
  generatedAt: string;
  moduleTitle?: string;
  moduleIndex?: number;
}

interface HistoryPageProps {
  lessons: Lesson[];
  loading: boolean;
  onSelectLesson: (lesson: Lesson) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ lessons, loading, onSelectLesson }) => {
  const [selectedDetailLesson, setSelectedDetailLesson] = useState<Lesson | null>(null);

  const completedLessons = lessons.filter(l => l.completed);

  // Group completed lessons by moduleTitle
  const groupedModules: Record<string, Lesson[]> = {};
  completedLessons.forEach(lesson => {
    const key = lesson.moduleTitle || "General Concepts";
    if (!groupedModules[key]) {
      groupedModules[key] = [];
    }
    groupedModules[key].push(lesson);
  });

  // Loading skeleton in light theme
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold font-outfit text-zinc-900 mb-6">Lesson History</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="light-panel p-5 rounded-xl flex items-center justify-between bg-white border border-zinc-200">
              <div className="space-y-2 w-2/3">
                <div className="h-4 w-28 skeleton-shimmer rounded"></div>
                <div className="h-6 w-full skeleton-shimmer rounded"></div>
              </div>
              <div className="h-8 w-24 skeleton-shimmer rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="mb-8">
        <span className="text-sm font-semibold text-brandIndigo tracking-wide uppercase">Archive</span>
        <h2 className="text-3xl font-extrabold font-outfit text-zinc-900 mt-1">Lesson History</h2>
        <p className="text-sm text-zinc-600 mt-1">Review all your previous daily tech lessons & completion milestones.</p>
      </div>

      {completedLessons.length === 0 ? (
        <div className="light-panel p-12 rounded-2xl text-center border border-zinc-200 bg-white">
          <Calendar className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900 mb-1">No completed lessons found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
            As you study and mark lessons as completed, they will appear here organized by roadmap modules.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedModules).map(([moduleName, moduleLessons]) => (
            <div key={moduleName} className="light-panel rounded-2xl p-6 bg-white border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <BookOpen className="w-4.5 h-4.5 text-brandIndigo" />
                <h3 className="font-outfit font-extrabold text-base md:text-lg text-zinc-900">{moduleName}</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-brandIndigo font-bold ml-auto">
                  {moduleLessons.length} {moduleLessons.length === 1 ? 'Lesson' : 'Lessons'}
                </span>
              </div>
              
              <div className="relative border-l border-zinc-200 ml-4 pl-6 md:pl-8 space-y-4 pt-1">
                {moduleLessons.map((lesson, idx) => (
                  <motion.div
                    key={lesson.lessonDate}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[30px] md:-left-[38px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-brandTeal shadow-[0_0_6px_rgba(13,148,136,0.3)] z-10" />

                    <div 
                      onClick={() => setSelectedDetailLesson(lesson)}
                      className="p-4 rounded-xl cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border border-zinc-150 bg-zinc-50/40 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-zinc-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lesson.lessonDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${
                            lesson.difficulty === 'Beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                            lesson.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {lesson.difficulty}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900 group-hover:text-brandIndigo transition-colors leading-snug">
                          {lesson.topic}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-brandIndigo self-end md:self-center">
                        <span>Review</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lesson Detail Overlay Modal */}
      <AnimatePresence>
        {selectedDetailLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailLesson(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto light-panel rounded-2xl border border-zinc-200 bg-white shadow-2xl z-10 text-zinc-800"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDetailLesson(null)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-800 rounded-lg bg-zinc-50 border border-zinc-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 md:p-8">
                {/* Header info */}
                <div className="mb-6 pb-6 border-b border-zinc-200">
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs text-brandIndigo font-mono font-semibold">
                      {selectedDetailLesson.lessonDate}
                    </span>
                    <span className="text-xs text-zinc-400">&middot;</span>
                    <span className="text-xs text-zinc-500">
                      {selectedDetailLesson.estimatedTime} study
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-950 font-outfit">{selectedDetailLesson.topic}</h3>
                </div>

                <div className="space-y-6">
                  {/* Objective */}
                  <div className="flex gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                    <BookOpen className="w-5 h-5 text-brandIndigo flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-zinc-900 mb-0.5">Objective</h5>
                      <p className="text-sm text-zinc-700">{selectedDetailLesson.learningObjective}</p>
                    </div>
                  </div>

                  {/* Core Explanation */}
                  <div>
                    <h5 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Concept</h5>
                    <div className="prose prose-zinc max-w-none text-zinc-700 text-sm leading-relaxed">
                      <ReactMarkdown>{selectedDetailLesson.explanation}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Real World */}
                  {selectedDetailLesson.realWorldExample && (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                      <h5 className="text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-brandIndigo" />
                        Real-world Scenario
                      </h5>
                      <p className="text-xs text-zinc-600 leading-relaxed">{selectedDetailLesson.realWorldExample}</p>
                    </div>
                  )}

                  {/* Code */}
                  {selectedDetailLesson.codeExample && (
                    <div>
                      <h5 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Implementation</h5>
                      <div className="rounded-xl overflow-hidden border border-zinc-200 bg-[#151515]">
                        <SyntaxHighlighter
                          language="typescript"
                          style={atomDark}
                          customStyle={{
                            margin: 0,
                            padding: '1rem',
                            fontSize: '0.8rem',
                            background: 'transparent',
                          }}
                        >
                          {selectedDetailLesson.codeExample}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  )}

                  {/* Hands-on Exercise */}
                  {selectedDetailLesson.exercise && (
                    <div className="p-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50">
                      <h5 className="text-xs font-bold text-zinc-800 mb-1 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                        Challenge Exercise
                      </h5>
                      <p className="text-xs text-zinc-600 font-mono leading-relaxed">{selectedDetailLesson.exercise}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-200 flex justify-end">
                  <button
                    onClick={() => {
                      onSelectLesson(selectedDetailLesson);
                      setSelectedDetailLesson(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-brandIndigo text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                  >
                    Open in Dashboard
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
