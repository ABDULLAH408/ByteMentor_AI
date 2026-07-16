import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Clock, BarChart, CheckCircle2, AlertTriangle, BookOpen, Cpu, Award, Zap, Quote, RefreshCw, Check, Lock } from 'lucide-react';

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
}

interface RoadmapModule {
  title: string;
  status: 'Completed' | 'Current' | 'Locked';
}

interface Profile {
  lessonDate: "profile";
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  goal: string;
  studyTime: string;
  roadmap: RoadmapModule[];
  onboarded: boolean;
  updatedAt: string;
}

interface DashboardProps {
  lesson: Lesson | null;
  loading: boolean;
  error: string | null;
  onMarkCompleted: (date: string) => Promise<void>;
  onRetryFetch: () => void;
  profile: Profile | null;
  onResetProfile: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  lesson,
  loading,
  error,
  onMarkCompleted,
  onRetryFetch,
  profile,
  onResetProfile
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizExplanations, setShowQuizExplanations] = useState<Record<number, boolean>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 👋";
    if (hour < 18) return "Good Afternoon 👋";
    return "Good Evening 👋";
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (selectedAnswers[questionIndex] !== undefined) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
    setShowQuizExplanations(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  const handleMarkCompleteClick = async () => {
    if (!lesson || lesson.completed || isCompleting) return;
    setIsCompleting(true);
    try {
      await onMarkCompleted(lesson.lessonDate);
    } finally {
      setIsCompleting(false);
    }
  };

  // Loading skeleton in light theme
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-48 skeleton-shimmer rounded mb-4"></div>
        <div className="h-6 w-72 skeleton-shimmer rounded mb-10"></div>

        <div className="light-panel rounded-2xl p-6 md:p-8 space-y-6 bg-white">
          <div className="flex gap-4">
            <div className="h-6 w-20 skeleton-shimmer rounded"></div>
            <div className="h-6 w-24 skeleton-shimmer rounded"></div>
          </div>
          <div className="h-10 w-3/4 skeleton-shimmer rounded"></div>
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full skeleton-shimmer rounded"></div>
            <div className="h-4 w-full skeleton-shimmer rounded"></div>
            <div className="h-4 w-5/6 skeleton-shimmer rounded"></div>
          </div>
          <div className="h-48 w-full skeleton-shimmer rounded-xl mt-6"></div>
        </div>
      </div>
    );
  }

  // Error state in light theme
  if (error || !lesson) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6 text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-outfit text-zinc-900 mb-2">Failed to load today's lesson</h3>
        <p className="text-zinc-600 text-sm mb-8 leading-relaxed">
          {error || "No lesson could be retrieved. Make sure your backend API is running and configured."}
        </p>
        <button
          onClick={onRetryFetch}
          className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 mx-auto font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Retry / Generate Lesson
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans">
      {/* Top Greeting Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-brandIndigo tracking-wide uppercase">{getGreeting()}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-outfit text-zinc-950 mt-1">Today's Lesson is Ready</h2>
        </div>

        {/* Completion Tag */}
        {lesson.completed ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-brandTeal rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Lesson Completed
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-brandIndigo rounded-full text-xs font-semibold">
            <Cpu className="w-4 h-4" />
            Ready to Study
          </div>
        )}
      </div>

      {/* Learning Journey Roadmap Section */}
      {profile && profile.onboarded && (
        <div className="light-panel rounded-2xl p-6 md:p-8 bg-white border border-zinc-200 mb-8 relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold text-brandIndigo uppercase tracking-widest">Active Path</span>
              <h3 className="text-xl font-extrabold font-outfit text-zinc-950 mt-0.5">
                Learning Journey: <span className="text-brandIndigo font-semibold">{profile.topic}</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Level: <strong>{profile.difficulty}</strong> &middot; Goal: <strong>{profile.goal}</strong> &middot; Speed: <strong>{profile.studyTime}/day</strong>
              </p>
            </div>
            
            <button
              onClick={onResetProfile}
              className="px-3.5 py-1.5 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm shrink-0 self-start sm:self-center"
            >
              Modify Goal
            </button>
          </div>

          {/* Stepper (Vertical timeline) */}
          <div className="relative pl-6 border-l border-zinc-200 space-y-4 ml-3 pt-1">
            {profile.roadmap.map((mod, idx) => {
              const isCompleted = mod.status === 'Completed';
              const isCurrent = mod.status === 'Current';

              let statusIcon = null;
              let itemStyle = "";
              let dotStyle = "";

              if (isCompleted) {
                statusIcon = <Check className="w-3.5 h-3.5 text-brandTeal animate-fade-in" />;
                itemStyle = "text-zinc-700 font-medium";
                dotStyle = "bg-teal-50 border-brandTeal text-brandTeal shadow-[0_0_8px_rgba(13,148,136,0.15)]";
              } else if (isCurrent) {
                statusIcon = <div className="w-2.5 h-2.5 rounded-full bg-brandIndigo animate-pulse" />;
                itemStyle = "text-brandIndigo font-bold text-sm ring-1 ring-brandIndigo/5 bg-indigo-50/20 p-3.5 rounded-xl border border-indigo-100/40 shadow-sm";
                dotStyle = "bg-indigo-50 border-brandIndigo border-2 text-brandIndigo shadow-[0_0_12px_rgba(79,70,229,0.2)]";
              } else {
                statusIcon = <Lock className="w-3 h-3 text-zinc-400" />;
                itemStyle = "text-zinc-400 font-normal opacity-70";
                dotStyle = "bg-zinc-50 border-zinc-200 text-zinc-400";
              }

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[36px] top-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all z-10 ${dotStyle}`}>
                    {statusIcon}
                  </div>
                  
                  <div className={`flex-grow leading-snug ${itemStyle}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono">Module {idx + 1}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-brandIndigo font-bold uppercase tracking-wider animate-pulse">
                          Current Module
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs md:text-sm mt-0.5">{mod.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Lesson Card */}
      <div className="light-panel rounded-2xl overflow-hidden relative shadow-lg bg-white border border-zinc-200">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-200/80 bg-zinc-50/50">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 text-xs text-zinc-600 bg-white border border-zinc-200 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {lesson.estimatedTime}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border ${
              lesson.difficulty === 'Beginner' ? 'bg-green-50 text-green-700 border-green-200' :
              lesson.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}>
              <BarChart className="w-3.5 h-3.5" />
              {lesson.difficulty}
            </span>
            <span className="text-xs text-zinc-500 ml-auto">
              Generated: {new Date(lesson.generatedAt).toLocaleDateString()}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-zinc-950 leading-tight">
            {lesson.topic}
          </h3>
        </div>

        {/* Lesson Contents */}
        <div className="p-6 md:p-8 space-y-10">
          
          {/* Learning Objective */}
          <div className="flex gap-4 p-4 rounded-xl bg-indigo-50/40 border border-indigo-100">
            <BookOpen className="w-5 h-5 text-brandIndigo flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 mb-0.5">Learning Objective</h4>
              <p className="text-sm text-zinc-700">{lesson.learningObjective}</p>
            </div>
          </div>

          {/* Lecture Notes Section */}
          {lesson.lectureNotes && (
            <div className="p-5 rounded-xl border border-amber-200/80 bg-amber-50/30 animate-fade-in">
              <h4 className="text-sm font-extrabold text-amber-800 flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                Lecture Summary & Quick Notes
              </h4>
              <div className="prose prose-amber text-xs md:text-sm text-zinc-700 leading-relaxed font-sans space-y-2">
                <ReactMarkdown>{lesson.lectureNotes}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Explanation Section */}
          <div>
            <h4 className="text-lg font-bold font-outfit text-zinc-900 mb-4 border-l-2 border-brandIndigo pl-3">
              Core Concept
            </h4>
            <div className="prose prose-zinc max-w-none text-zinc-700 text-sm md:text-base leading-relaxed space-y-4">
              <ReactMarkdown>{lesson.explanation}</ReactMarkdown>
            </div>
          </div>

          {/* Real-World Example */}
          <div className="p-5 rounded-xl border border-zinc-200 bg-zinc-50">
            <h4 className="text-sm font-semibold text-zinc-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-brandIndigo" />
              Real-World Scenario
            </h4>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {lesson.realWorldExample}
            </p>
          </div>

          {/* Code Example (Syntax Highlighting) */}
          {lesson.codeExample && (
            <div>
              <h4 className="text-lg font-bold font-outfit text-zinc-900 mb-3 flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-brandIndigo" />
                Code Implementation
              </h4>
              <div className="rounded-xl overflow-hidden border border-zinc-200 bg-[#151515]">
                <SyntaxHighlighter
                  language="typescript"
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    padding: '1.25rem',
                    fontSize: '0.85rem',
                    background: 'transparent',
                  }}
                >
                  {lesson.codeExample}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* Mini Quiz */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <div className="border-t border-zinc-150 pt-8">
              <h4 className="text-lg font-bold font-outfit text-zinc-900 mb-4 flex items-center gap-2">
                <Zap className="w-4.5 h-4.5 text-brandIndigo" />
                Knowledge Check
              </h4>
              
              <div className="space-y-8">
                {lesson.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="p-5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                    <span className="text-xs text-brandIndigo font-semibold">Question {qIdx + 1} of {lesson.quiz.length}</span>
                    <p className="text-sm font-semibold text-zinc-900 mt-1 mb-4">{q.question}</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        const isCorrect = q.answerIndex === oIdx;
                        const hasAnswered = selectedAnswers[qIdx] !== undefined;
                        
                        let btnStyle = "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50";
                        if (hasAnswered) {
                          if (isCorrect) {
                            btnStyle = "border-emerald-300 bg-emerald-50 text-emerald-800";
                          } else if (isSelected) {
                            btnStyle = "border-red-300 bg-red-50 text-red-800";
                          } else {
                            btnStyle = "border-zinc-100 bg-zinc-50 text-zinc-400 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={hasAnswered}
                            onClick={() => handleSelectOption(qIdx, oIdx)}
                            className={`w-full text-left p-3.5 rounded-lg border text-sm font-medium transition-all ${btnStyle} flex items-center justify-between`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && isCorrect && <span className="text-emerald-600 font-bold">✓</span>}
                            {hasAnswered && isSelected && !isCorrect && <span className="text-red-600 font-bold">✗</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Show Quiz Explanation if Answered */}
                    <AnimatePresence>
                      {showQuizExplanations[qIdx] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-zinc-200"
                        >
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            <strong className="text-brandIndigo mr-1">Explanation:</strong>
                            {q.explanation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Quiz Results Card */}
              {lesson.quiz && Object.keys(selectedAnswers).length === lesson.quiz.length && (() => {
                const score = Object.entries(selectedAnswers).reduce((acc, [qIdx, oIdx]) => {
                  const question = lesson.quiz[Number(qIdx)];
                  return question.answerIndex === oIdx ? acc + 1 : acc;
                }, 0);
                const percentage = Math.round((score / lesson.quiz.length) * 100);
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 rounded-xl border border-indigo-150 bg-indigo-50/20 flex flex-col items-center text-center space-y-4 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
                      {percentage >= 80 ? "🏆" : percentage >= 50 ? "👍" : "📚"}
                    </div>
                    
                    <div>
                      <h5 className="font-outfit font-extrabold text-base text-zinc-900">Quiz Completion Results</h5>
                      <p className="text-xl font-extrabold font-outfit text-brandIndigo mt-1">
                        Score: {score} / {lesson.quiz.length} ({percentage}%)
                      </p>
                      <p className="text-xs text-zinc-500 mt-2 max-w-md leading-relaxed">
                        {percentage === 100 && "Perfect Score! You've completely mastered today's concepts. 🌟"}
                        {percentage >= 80 && percentage < 100 && "Great work! You have a solid grasp on this module. 🚀"}
                        {percentage >= 50 && percentage < 80 && "Good try! Consider reviewing the explanations below to patch any gaps. 📚"}
                        {percentage < 50 && "Keep practicing! Review the detailed lecture materials and try coding it out. 💪"}
                      </p>
                    </div>

                    <div className="w-full max-w-sm bg-zinc-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-brandIndigo h-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          )}

          {/* Hands-on Exercise */}
          <div className="border-t border-zinc-150 pt-8">
            <h4 className="text-lg font-bold font-outfit text-zinc-900 mb-3">Hands-on Challenge</h4>
            <div className="p-5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
              <p className="text-sm text-zinc-700 leading-relaxed font-mono">
                {lesson.exercise}
              </p>
            </div>
          </div>

          {/* Productivity Tip & Motivation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-150 pt-8">
            {/* Productivity Tip */}
            <div className="p-5 rounded-xl border border-zinc-200 bg-zinc-50 flex gap-4">
              <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-zinc-900 mb-1">Productivity Tip</h5>
                <p className="text-xs text-zinc-600 leading-relaxed">{lesson.productivityTip}</p>
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="p-5 rounded-xl border border-zinc-200 bg-zinc-50 flex gap-4">
              <Quote className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-zinc-900 mb-1">Coach's Reflection</h5>
                <p className="text-xs text-zinc-600 italic leading-relaxed">"{lesson.motivationalQuote}"</p>
              </div>
            </div>
          </div>

          {/* Mark as Completed Action */}
          <div className="border-t border-zinc-150 pt-8 flex justify-center">
            <button
              disabled={lesson.completed || isCompleting}
              onClick={handleMarkCompleteClick}
              className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2.5 ${
                lesson.completed
                  ? "bg-teal-50 border border-teal-200 text-teal-700 cursor-default"
                  : "bg-brandIndigo hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {lesson.completed ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Completed
                </>
              ) : (
                <>
                  {isCompleting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Mark Lesson as Completed
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
