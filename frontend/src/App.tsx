import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { HistoryPage } from './components/HistoryPage';
import { Calendar, Cpu, HelpCircle } from 'lucide-react';

import { OnboardingWizard } from './components/OnboardingWizard';

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

type Page = 'landing' | 'onboarding' | 'dashboard' | 'history';

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

// Read API URL from Vite env variables (fallback to empty string or local mock for safe operations)
const API_URL = import.meta.env.VITE_API_URL || "";

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [todayLesson, setTodayLesson] = useState<Lesson | null>(null);
  const [historyLessons, setHistoryLessons] = useState<Lesson[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorToday, setErrorToday] = useState<string | null>(null);

  // Helper: Format local date to YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    return d.getFullYear() + '-' + 
      String(d.getMonth() + 1).padStart(2, '0') + '-' + 
      String(d.getDate()).padStart(2, '0');
  };

  // Fetch user profile
  const fetchProfile = async (): Promise<Profile | null> => {
    setLoadingProfile(true);
    try {
      const response = await fetch(`${API_URL}/lesson/profile`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.onboarded) {
          setProfile(data);
          setLoadingProfile(false);
          return data;
        }
      }
      setProfile(null);
      setLoadingProfile(false);
      return null;
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setProfile(null);
      setLoadingProfile(false);
      return null;
    }
  };

  // Fetch today's lesson (or on-the-fly generated lesson)
  const fetchTodayLesson = async (activeProfile?: Profile | null) => {
    const currentProfile = activeProfile !== undefined ? activeProfile : profile;
    if (!currentProfile || !currentProfile.onboarded) {
      return;
    }

    setLoadingToday(true);
    setErrorToday(null);
    const localDate = getLocalDateString();
    
    try {
      const response = await fetch(`${API_URL}/lesson/today?date=${localDate}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch today's lesson (HTTP ${response.status})`);
      }
      const data = await response.json();
      setTodayLesson(data);
    } catch (err: any) {
      console.error(err);
      setErrorToday(err.message || "An unexpected error occurred while fetching today's lesson.");
    } finally {
      setLoadingToday(false);
    }
  };

  // Fetch lesson history
  const fetchLessonHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_URL}/lesson/history`);
      if (!response.ok) {
        throw new Error(`Failed to fetch lesson history (HTTP ${response.status})`);
      }
      const data = await response.json();
      setHistoryLessons(data.lessons || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Mark a lesson as completed
  const handleMarkCompleted = async (date: string) => {
    try {
      const response = await fetch(`${API_URL}/lesson/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonDate: date })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update completion status (HTTP ${response.status})`);
      }
      
      // Fetch updated profile and today's lesson
      await fetchProfile();
      if (todayLesson && todayLesson.lessonDate === date) {
        setTodayLesson(prev => prev ? { ...prev, completed: true } : null);
      }
      await fetchLessonHistory();
    } catch (err) {
      console.error("Failed to complete lesson:", err);
      alert("Error marking lesson as completed. Please check connection and try again.");
    }
  };

  // Reset/Modify learning path
  const handleResetProfile = () => {
    setProfile(null);
    setTodayLesson(null);
    setCurrentPage('onboarding');
  };

  // On onboarding finished
  const handleCompleteOnboarding = (completedProfile: Profile) => {
    setProfile(completedProfile);
    fetchTodayLesson(completedProfile);
    setCurrentPage('dashboard');
  };

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      const loadedProfile = await fetchProfile();
      if (loadedProfile) {
        await fetchTodayLesson(loadedProfile);
        await fetchLessonHistory();
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('onboarding');
      }
    };
    initializeData();
  }, []);

  // Handle opening a lesson from the History timeline inside the dashboard
  const handleOpenFromHistory = (selectedLesson: Lesson) => {
    setTodayLesson(selectedLesson);
    setCurrentPage('dashboard');
  };

  // If on the Landing Page, render the landing component directly
  if (currentPage === 'landing') {
    return (
      <LandingPage 
        profile={profile}
        onContinueJourney={() => setCurrentPage('dashboard')}
        onStartNewJourney={handleResetProfile}
      />
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-brandIndigo rounded-full animate-spin" />
          <span className="text-zinc-500 font-semibold text-xs tracking-wider">Loading ByteMentor Coach...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-50 text-zinc-800 flex flex-col font-sans">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e780_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e780_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Main App Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between relative z-20 border-b border-zinc-200 bg-white/85 backdrop-blur-md sticky top-0">
        <div 
          onClick={() => {
            if (profile && profile.onboarded) {
              setCurrentPage('dashboard');
            } else {
              setCurrentPage('landing');
            }
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-brandIndigo flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="font-outfit font-bold text-white text-xs">BM</span>
          </div>
          <span className="font-outfit font-bold text-lg text-zinc-900 group-hover:text-zinc-750 transition-colors">
            ByteMentor <span className="text-brandIndigo font-semibold text-xs ml-0.5 px-1 py-0.5 bg-indigo-50 border border-indigo-100 rounded">AI</span>
          </span>
        </div>

        {/* Tab-based Routing Menu */}
        {profile && profile.onboarded && (
          <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentPage === 'dashboard'
                  ? "bg-white border border-zinc-200 text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Dashboard
            </button>
            
            <button
              onClick={() => {
                fetchLessonHistory(); // Refresh history
                setCurrentPage('history');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentPage === 'history'
                  ? "bg-white border border-zinc-200 text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              History
            </button>
          </nav>
        )}
      </header>

      {/* Inner Page View */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 relative z-10">
        {currentPage === 'onboarding' && (
          <OnboardingWizard
            onComplete={handleCompleteOnboarding}
            apiUrl={API_URL}
          />
        )}

        {currentPage === 'dashboard' && (
          <Dashboard
            lesson={todayLesson}
            loading={loadingToday}
            error={errorToday}
            onMarkCompleted={handleMarkCompleted}
            onRetryFetch={() => fetchTodayLesson()}
            profile={profile}
            onResetProfile={handleResetProfile}
          />
        )}

        {currentPage === 'history' && (
          <HistoryPage
            lessons={historyLessons}
            loading={loadingHistory}
            onSelectLesson={handleOpenFromHistory}
          />
        )}
      </main>

      {/* Simple Indicator of Local Mode */}
      {!API_URL && (
        <div className="fixed bottom-4 right-4 z-40 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2 max-w-xs shadow-md backdrop-blur-md">
          <HelpCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
          <span className="text-[10px] text-amber-800 font-semibold leading-snug">
            Running in Preview Mode. Configure <code className="bg-amber-100/60 px-1 py-0.5 rounded text-amber-950 font-bold">VITE_API_URL</code> to connect your AWS Lambda backend.
          </span>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 py-6 mt-auto bg-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
          <span>ByteMentor AI &copy; 2026. AWS Always-On Agent Challenge.</span>
          <div className="flex gap-4">
            <span className="hover:text-zinc-800 cursor-pointer" onClick={() => {
              if (profile && profile.onboarded) {
                setCurrentPage('dashboard');
              } else {
                setCurrentPage('landing');
              }
            }}>Landing Page</span>
            <span>&middot;</span>
            <span>AWS Serverless Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
