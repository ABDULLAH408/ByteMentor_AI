import React from 'react';
import { motion } from 'framer-motion';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { Sparkles, Brain, ArrowRight, Compass, RefreshCw, Layers, Award, ListTodo } from 'lucide-react';

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

interface LandingPageProps {
  profile: Profile | null;
  onContinueJourney: () => void;
  onStartNewJourney: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ profile, onContinueJourney, onStartNewJourney }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  const onboarded = profile && profile.onboarded;

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-50 text-zinc-800 flex flex-col font-sans">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e780_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e780_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brandIndigo flex items-center justify-center shadow-md">
            <span className="font-outfit font-bold text-white text-base">BM</span>
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight text-zinc-900">
            ByteMentor <span className="text-brandIndigo font-medium text-sm ml-1 px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md">AI</span>
          </span>
        </div>

        {onboarded ? (
          <button 
            onClick={onContinueJourney}
            className="text-sm font-medium text-brandIndigo px-4 py-2 rounded-lg border border-indigo-200 hover:border-indigo-350 bg-indigo-50/20 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            Go to Dashboard
          </button>
        ) : (
          <button 
            onClick={onStartNewJourney}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white transition-all shadow-sm"
          >
            Enter App
          </button>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-16 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Tag */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50 text-xs text-brandIndigo font-semibold mb-6 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Personalized AI Learning Coach
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold font-outfit tracking-tight text-zinc-950 mb-6 leading-[1.15]"
          >
            Your Personalized <br />
            <span className="text-brandIndigo">
              AI Learning Coach.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg text-zinc-650 font-light mb-10 max-w-xl mx-auto leading-relaxed"
          >
            ByteMentor AI structures custom curriculum roadmaps, prepares detailed lectures, provides quick reference summaries, and tracks quiz performance automatically.
          </motion.p>

          {/* CTA Buttons & Profile status */}
          {onboarded ? (
            <motion.div 
              variants={itemVariants}
              className="space-y-6 max-w-md mx-auto"
            >
              {/* Active Path Info Card */}
              <div className="p-5 rounded-2xl border border-indigo-150 bg-indigo-50/30 text-left shadow-sm">
                <span className="text-[10px] font-bold text-brandIndigo uppercase tracking-wider">Active Learning Journey</span>
                <h3 className="font-outfit font-extrabold text-lg text-zinc-900 mt-1">{profile.topic}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Level: <strong>{profile.difficulty}</strong> &middot; Goal: <strong>{profile.goal}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={onContinueJourney}
                  className="w-full sm:w-auto px-8 py-4 bg-brandIndigo hover:bg-indigo-700 text-white rounded-xl font-bold text-xs tracking-wide shadow-lg hover:shadow-indigo-700/10 transition-all flex items-center justify-center gap-2 group"
                >
                  Continue Your Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onStartNewJourney}
                  className="w-full sm:w-auto px-6 py-4 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600 rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start a New Journey
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={onStartNewJourney}
                className="w-full sm:w-auto px-8 py-4 bg-brandIndigo hover:bg-indigo-700 text-white rounded-xl font-bold text-xs tracking-wide shadow-lg hover:shadow-indigo-700/10 transition-all flex items-center justify-center gap-2 group animate-bounce"
              >
                Start Learning Journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Core Product Experience Highlights */}
        <section className="mt-24 border-t border-zinc-200 pt-16">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-brandIndigo font-semibold">Features</span>
            <h2 className="text-3xl font-bold font-outfit text-zinc-900 mt-1">What ByteMentor AI Does</h2>
            <p className="text-sm text-zinc-550 max-w-lg mx-auto mt-2">
              A comprehensive system built to adapt to your schedule, explain concept architectures, and verify your comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="light-panel p-6 rounded-2xl bg-white border border-zinc-200/60 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brandIndigo">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-outfit text-zinc-900">1. Personalized Roadmap</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Creates a custom curriculum containing 6 to 10 sequential roadmap modules targeted directly at your topic, level, and career goals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="light-panel p-6 rounded-2xl bg-white border border-zinc-200/60 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-outfit text-zinc-900">2. In-Depth Lectures & Notes</h3>
              <p className="text-xs text-zinc-650 leading-relaxed">
                Generates a detailed academic concept lecture accompanied by a dedicated, bullet-pointed "Quick Notes Cheat-Sheet" for quick references.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="light-panel p-6 rounded-2xl bg-white border border-zinc-200/60 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-outfit text-zinc-900">3. 5-Question Knowledge Check</h3>
              <p className="text-xs text-zinc-650 leading-relaxed">
                Includes exactly 5 high-quality MCQs with immediate feedback, detailed question explanations, and a progress results percentage card.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="light-panel p-6 rounded-2xl bg-white border border-zinc-200/60 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <ListTodo className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-outfit text-zinc-900">4. Interactive Progression</h3>
              <p className="text-xs text-zinc-650 leading-relaxed">
                Displays progress on a vertical timeline stepper. Mark your lesson as completed to automatically unlock the next roadmap module.
              </p>
            </div>
          </div>
        </section>

        {/* AWS Architecture Diagram Integration */}
        <section className="mt-24">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-widest text-brandIndigo font-semibold">Architecture</span>
            <h2 className="text-2xl font-bold font-outfit text-zinc-900 mt-1">Under the Hood: Serverless Stack</h2>
          </div>
          <ArchitectureDiagram />
        </section>

        {/* How It Works Section */}
        <section className="mt-20 border-t border-zinc-200 pt-16">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-brandIndigo font-semibold font-outfit">Pipeline</span>
            <h2 className="text-2xl font-bold font-outfit text-zinc-900 mt-1">Always-On Workflow</h2>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-brandIndigo font-bold flex-shrink-0 shadow-sm">1</div>
              <div>
                <h4 className="font-semibold text-zinc-900 text-sm mb-1.5">7:00 AM Cron Event</h4>
                <p className="text-xs text-zinc-550 leading-relaxed">EventBridge Scheduler kicks off Lambda. No human input is needed.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-brandPurple font-bold flex-shrink-0 shadow-sm">2</div>
              <div>
                <h4 className="font-semibold text-zinc-900 text-sm mb-1.5">Bedrock Synthesizes</h4>
                <p className="text-xs text-zinc-550 leading-relaxed">Nova Lite generates today's module lesson, formatting code, summaries, and 5 MCQs.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-brandTeal font-bold flex-shrink-0 shadow-sm">3</div>
              <div>
                <h4 className="font-semibold text-zinc-900 text-sm mb-1.5">Delivered Fresh</h4>
                <p className="text-xs text-zinc-550 leading-relaxed">DynamoDB stores the lesson state, making it instant to load on your dashboard.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-brandIndigo flex items-center justify-center text-white font-bold font-outfit text-xs">BM</div>
            <span className="text-zinc-500 text-xs">ByteMentor AI &copy; 2026. AWS Builder Challenge.</span>
          </div>

          <div className="flex gap-6 text-xs text-zinc-500 font-medium">
            <span className="hover:text-zinc-700 cursor-pointer">AWS Free Tier Stack</span>
            <span>&middot;</span>
            <span className="hover:text-zinc-700 cursor-pointer">Light Theme Only</span>
            <span>&middot;</span>
            <span className="hover:text-zinc-700 cursor-pointer">Bedrock Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
