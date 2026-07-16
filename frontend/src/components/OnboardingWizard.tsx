import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, GraduationCap, Code2, Trophy, Clock, Check } from 'lucide-react';

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

interface OnboardingWizardProps {
  onComplete: (profile: Profile) => void;
  apiUrl: string;
}

const TOPICS = [
  "Data Science", "Machine Learning", "Artificial Intelligence",
  "Python", "JavaScript", "React", "Next.js", "Node.js",
  "DevOps", "AWS Cloud", "Docker", "Kubernetes", "Cyber Security",
  "UI/UX Design", "System Design", "DSA", "Mobile Development", "Game Development"
];

const EXPERIENCES = ["Beginner", "Intermediate", "Advanced"];

const GOALS = [
  "Get a Job", "Build Projects", "Interview Preparation",
  "Learn for Fun", "College Studies", "Career Switch"
];

const STUDY_TIMES = ["15 min", "30 min", "45 min", "1 hour", "2 hours"];

const LOADING_PHRASES = [
  "Consulting ByteMentor AI...",
  "Creating your personalized curriculum...",
  "Structuring learning modules...",
  "Tailoring difficulty parameters...",
  "Formatting hands-on exercises...",
  "Finalizing your learning journey..."
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, apiUrl }) => {
  const [step, setStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [experience, setExperience] = useState('');
  const [goal, setGoal] = useState('');
  const [studyTime, setStudyTime] = useState('');
  
  // Roadmap generation states
  const [loading, setLoading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<RoadmapModule[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cycling through loading text phrases
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else if (step === 4) {
      // Trigger roadmap generation
      setStep(5);
      generatePath();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const getActiveTopic = () => {
    return customTopic.trim() !== '' ? customTopic.trim() : selectedTopic;
  };  const generatePath = async () => {
    setLoading(true);
    setError(null);
    const topic = getActiveTopic();

    if (!apiUrl) {
      setError("API URL is not configured. Please set VITE_API_URL in your environment variables.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/lesson/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty: experience,
          goal,
          studyTime
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate roadmap (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (data && data.roadmap) {
        setGeneratedRoadmap(data.roadmap);
      } else {
        throw new Error("Invalid roadmap response schema received from API");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during roadmap generation.");
    } finally {
      setLoading(false);
    }
  };
  const handleFinish = () => {
    const finalProfile: Profile = {
      lessonDate: "profile",
      topic: getActiveTopic(),
      difficulty: experience as any,
      goal,
      studyTime,
      roadmap: generatedRoadmap,
      onboarded: true,
      updatedAt: new Date().toISOString()
    };
    onComplete(finalProfile);
  };

  // Step validation
  const isStepValid = () => {
    if (step === 1) return selectedTopic !== '' || customTopic.trim() !== '';
    if (step === 2) return experience !== '';
    if (step === 3) return goal !== '';
    if (step === 4) return studyTime !== '';
    return true;
  };

  // Slide animations
  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.15 } }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="light-panel rounded-2xl overflow-hidden relative shadow-lg bg-white border border-zinc-200 min-h-[550px] flex flex-col justify-between p-6 md:p-10">
        
        {/* Top Stepper Indicator (only for steps 1 to 4) */}
        {step <= 4 && (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brandIndigo" />
              <span className="font-outfit font-bold text-sm text-zinc-900">Personalize AI Coach</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map(idx => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === step ? 'w-8 bg-brandIndigo' :
                    idx < step ? 'w-2.5 bg-indigo-200' : 'w-2.5 bg-zinc-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: What do you want to learn? */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-extrabold font-outfit text-zinc-950">What do you want to learn?</h2>
                  <p className="text-sm text-zinc-500 mt-1.5">Select a predefined core technical domain or type your own custom topic below.</p>
                </div>

                {/* Selectable Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[260px] overflow-y-auto pr-1">
                  {TOPICS.map((topic) => {
                    const isSelected = selectedTopic === topic && customTopic === '';
                    return (
                      <button
                        key={topic}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setCustomTopic('');
                        }}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all hover:scale-[1.02] flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-50 border-brandIndigo text-brandIndigo ring-1 ring-brandIndigo'
                            : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700'
                        }`}
                      >
                        <span>{topic}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brandIndigo flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Input */}
                <div className="pt-2 border-t border-zinc-100 space-y-2">
                  <label htmlFor="custom-topic-input" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Or learn something else:
                  </label>
                  <input
                    id="custom-topic-input"
                    type="text"
                    placeholder="e.g. Flutter, Rust, Go, C++, Kubernetes security..."
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                      setSelectedTopic('');
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-brandIndigo text-sm font-medium transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: Experience level */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-extrabold font-outfit text-zinc-950">Select your experience level</h2>
                  <p className="text-sm text-zinc-500 mt-1.5">This helps your AI coach scope code explanations and challenge exercises.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {EXPERIENCES.map((level) => {
                    const isSelected = experience === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setExperience(level)}
                        className={`p-6 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-50 border-brandIndigo text-brandIndigo ring-2 ring-brandIndigo/20 scale-[1.02]'
                            : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:scale-[1.01]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isSelected ? 'bg-indigo-100 text-brandIndigo' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          <Code2 className="w-5 h-5" />
                        </div>
                        <div className="font-outfit font-extrabold text-base">{level}</div>
                        <div className="text-zinc-400 text-[10px] leading-snug">
                          {level === 'Beginner' && 'Starts with basic building blocks & simple syntax explanations.'}
                          {level === 'Intermediate' && 'Focuses on application architectures, tools, & pattern designs.'}
                          {level === 'Advanced' && 'Focuses on optimization, scale architectures, & advanced optimizations.'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Goal */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-extrabold font-outfit text-zinc-950">What is your learning goal?</h2>
                  <p className="text-sm text-zinc-500 mt-1.5">ByteMentor AI will align real-world scenarios and projects with your target outcome.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {GOALS.map((g) => {
                    const isSelected = goal === g;
                    return (
                      <button
                        key={g}
                        onClick={() => setGoal(g)}
                        className={`p-4 rounded-xl border text-left font-semibold text-xs transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-50 border-brandIndigo text-brandIndigo ring-1 ring-brandIndigo'
                            : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-indigo-100 text-brandIndigo' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          <Trophy className="w-4 h-4" />
                        </div>
                        <span>{g}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Study time */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-extrabold font-outfit text-zinc-950">How much time can you study every day?</h2>
                  <p className="text-sm text-zinc-500 mt-1.5">Micro-lessons and reading lengths will adjust to your daily time limit.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {STUDY_TIMES.map((time) => {
                    const isSelected = studyTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setStudyTime(time)}
                        className={`p-5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-indigo-50 border-brandIndigo text-brandIndigo ring-2 ring-brandIndigo/20 scale-[1.02]'
                            : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700'
                        }`}
                      >
                        <Clock className={`w-5 h-5 ${isSelected ? 'text-brandIndigo' : 'text-zinc-400'}`} />
                        <span className="font-outfit font-extrabold text-sm">{time}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Generating roadmap / preview */}
            {step === 5 && (
              <motion.div
                key="step5"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 flex-grow flex flex-col justify-center"
              >
                {loading ? (
                  /* Loading State */
                  <div className="text-center py-12 space-y-6 flex flex-col items-center">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-brandIndigo animate-spin" />
                      <Sparkles className="w-6 h-6 text-brandIndigo absolute animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold font-outfit text-zinc-950">Generating Learning Roadmap</h3>
                      <p className="text-sm text-zinc-500 animate-pulse">{LOADING_PHRASES[phraseIndex]}</p>
                    </div>
                  </div>
                ) : error ? (
                  /* Error State */
                  <div className="text-center py-8 space-y-4">
                    <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl">✗</div>
                    <h3 className="text-lg font-bold font-outfit text-zinc-900">Failed to construct roadmap</h3>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto">{error}</p>
                    <button
                      onClick={generatePath}
                      className="px-6 py-2 bg-zinc-950 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors"
                    >
                      Retry Generation
                    </button>
                  </div>
                ) : (
                  /* Roadmap Preview list */
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <div className="inline-flex items-center gap-1 text-xs text-brandIndigo bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold mb-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Roadmap Created Successfully
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold font-outfit text-zinc-950">Your Learning Path is Ready!</h2>
                      <p className="text-xs text-zinc-500 mt-1">Here is the customized study progression designed for your goal: <strong>{goal}</strong>.</p>
                    </div>

                    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50 p-4 max-h-[280px] overflow-y-auto space-y-3">
                      {generatedRoadmap.map((mod, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-zinc-150">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-brandIndigo flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-xs font-semibold text-zinc-800">{mod.title}</span>
                          {index === 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold ml-auto uppercase tracking-wide">
                              Unlock First
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom Actions Toolbar */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-150 relative z-10">
          {step > 1 && step < 5 && (
            <button
              onClick={handleBack}
              className="px-5 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-semibold text-xs tracking-wide transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step === 1 && <div />} {/* Spacer */}

          {step < 5 ? (
            <button
              disabled={!isStepValid()}
              onClick={handleNext}
              className={`ml-auto px-6 py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center gap-1.5 shadow ${
                isStepValid() 
                  ? 'bg-brandIndigo text-white hover:bg-indigo-700' 
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            !loading && !error && (
              <button
                onClick={handleFinish}
                className="w-full py-4 bg-brandIndigo hover:bg-indigo-700 text-white rounded-xl font-bold font-outfit text-sm tracking-wide shadow-md transition-colors flex items-center justify-center gap-2"
              >
                Start Learning Journey
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>

      </div>
    </div>
  );
};
export default OnboardingWizard;
