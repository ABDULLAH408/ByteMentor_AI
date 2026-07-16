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
    if (!API_URL) {
      const saved = localStorage.getItem("bytementor_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Profile;
          setProfile(parsed);
          setLoadingProfile(false);
          return parsed;
        } catch (e) {
          console.error("Failed to parse local profile:", e);
        }
      }
      setProfile(null);
      setLoadingProfile(false);
      return null;
    }

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

  // Generate local mock lesson based on profile
  const generateMockTodayLesson = (activeProfile: Profile) => {
    const currentModuleIndex = activeProfile.roadmap.findIndex(m => m.status === 'Current');
    const currentModuleTitle = activeProfile.roadmap[currentModuleIndex]?.title || "Fundamentals";
    const localDate = getLocalDateString();
    
    const getDynamicMockContent = (topic: string, moduleTitle: string, _difficulty: string, goal: string, _studyTime: string) => {
      const t = topic.toLowerCase();
      
      if (t.includes("machine learning") || t.includes("data science") || t.includes("artificial intelligence")) {
        return {
          lectureNotes: `### 📌 Key Concepts: ${moduleTitle}
* **Core Goal**: Extract patterns from datasets to solve the goal: ${goal}.
* **Key Step**: Perform Exploratory Data Analysis (EDA) and data cleansing before modeling.
* **Evaluation**: Track performance using appropriate metric matrices (e.g., F1-Score, RMSE).
* **Next Steps**: Validate model generalization on unseen test splits.`,
          explanation: `Welcome to the **${topic}** journey! This lesson focuses on **${moduleTitle}** to help you achieve: *${goal}*.\n\n### Detailed Lecture on ${moduleTitle}\n\nIn this module, we dive deep into how **${moduleTitle}** enables intelligent data analysis and predictive capability. In modern pipelines, this concept is central to identifying features, fitting models, and deploying production-grade AI systems.\n\n#### Why it matters:\nHigh-quality model performance relies heavily on understanding the underlying distribution of features. If we skip these core foundations, our models will suffer from overfitting or underfitting.\n\n#### Core Principles:\n1. **Data Integrity**: Clean and structure datasets properly.\n2. **Feature Engineering**: Select relevant variables to improve predictive signals.\n3. **Validation Strategy**: Use cross-validation to assess true model generalization.`,
          realWorldExample: `An e-commerce company uses ${moduleTitle} to cluster customers and recommend personalized items, increasing revenue by 18%.`,
          codeExample: `import numpy as np\nimport pandas as pd\n# Load and clean dataset for ${moduleTitle}\ndef prepare_data(df):\n    print("Cleaning dataset...")\n    df = df.dropna()\n    return df\n\n# Initialize learning parameter for: ${goal}\nlearning_rate = 0.01\nprint(f"Loaded {moduleTitle} model template with LR={learning_rate}")`,
          quiz: [
            {
              question: `What is the primary objective of "${moduleTitle}" in this path?`,
              options: [
                "Setting up software architecture boundaries",
                `Enabling patterns extraction and predictive capability for ${topic}`,
                "Managing SQL indices and server clusters",
                "Configuring local serverless firewalls"
              ],
              answerIndex: 1,
              explanation: `The focus of today's lesson is to construct core baseline skills for "${moduleTitle}" under the broader topic of "${topic}".`
            },
            {
              question: "Which term describes a model that performs well on training data but poorly on unseen test data?",
              options: [
                "Underfitting",
                "Overfitting",
                "Linear Convergence",
                "Gradient Descent"
              ],
              answerIndex: 1,
              explanation: "Overfitting occurs when a model learns noise in the training data, leading to poor generalization on new datasets."
            },
            {
              question: "Why is Exploratory Data Analysis (EDA) crucial in Data Science?",
              options: [
                "To write production Javascript wrappers",
                "To understand the distribution and relationships within the dataset before modeling",
                "To reduce database hosting costs",
                "To compile binary executables faster"
              ],
              answerIndex: 1,
              explanation: "EDA allows scientists to summarize data characteristics, identify outliers, and form hypotheses before building models."
            },
            {
              question: "What is the training/testing split ratio typically used in practice?",
              options: [
                "50/50",
                "100/0",
                "80/20 or 70/30",
                "10/90"
              ],
              answerIndex: 2,
              explanation: "An 80/20 or 70/30 split is commonly used to ensure adequate training data while holding out a robust validation set."
            },
            {
              question: `How does ByteMentor AI help you learn ${topic}?`,
              options: [
                "By running standard random lessons on AWS",
                "By designing a tailored module roadmap focused on ${goal}",
                "By writing production code automatically",
                "By hosting live classroom webinars"
              ],
              answerIndex: 1,
              explanation: "ByteMentor AI serves as a personalized AI coach, creating a structured curriculum roadmap tailored specifically to your goal and experience."
            }
          ],
          exercise: `1. Run the sample script with a mock pandas DataFrame.\n2. Write a function to split features and labels for: ${moduleTitle}.`
        };
      }
      
      if (t.includes("cyber security") || t.includes("security")) {
        return {
          lectureNotes: `### 📌 Key Concepts: ${moduleTitle}
* **Core Goal**: Protect systems, networks, and data assets for: ${goal}.
* **Key Step**: Implement defensive controls and execute standard threat modeling.
* **Principles**: Maintain Confidentiality, Integrity, and Availability (CIA Triad).
* **Next Steps**: Conduct regular penetration checks and secure configurations.`,
          explanation: `Welcome to the **${topic}** journey! This lesson focuses on **${moduleTitle}** to help you achieve: *${goal}*.\n\n### Detailed Lecture on ${moduleTitle}\n\nIn this module, we dive deep into how **${moduleTitle}** helps safeguard data, manage system permissions, and identify active vulnerabilities. Securing interfaces and infrastructure is vital to defense against cyber threats.\n\n#### Why it matters:\nWithout understanding these foundations, software and networks remain exposed to severe vulnerabilities, data breaches, and service interruptions.\n\n#### Core Principles:\n1. **Least Privilege**: Grant only the minimum permissions required to perform a task.\n2. **Defense in Depth**: Use layered security controls to protect assets.\n3. **Assume Breach**: Design systems under the assumption that components might be compromised.`,
          realWorldExample: `A bank utilizes ${moduleTitle} practices to identify an open port configuration, preventing a database exfiltration attack.`,
          codeExample: `# Sample Security Audit Script for ${moduleTitle}\nimport socket\n\ndef scan_target(host, ports):\n    print(f"Initiating scan for {moduleTitle} audit on {host}...")\n    for port in ports:\n        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n        s.settimeout(0.5)\n        if s.connect_ex((host, port)) == 0:\n            print(f"Vulnerability Alert: Port {port} is OPEN.")\n        s.close()\n\nscan_target("127.0.0.1", [22, 80, 443])`,
          quiz: [
            {
              question: `What is the primary objective of "${moduleTitle}" in this path?`,
              options: [
                "Building custom database index tables",
                `Identifying threats and defending assets under the ${topic} domain`,
                "Compiling optimized React components",
                "Creating responsive layout grid cards"
              ],
              answerIndex: 1,
              explanation: `The focus of today's lesson is to construct core baseline skills for "${moduleTitle}" under the broader topic of "${topic}".`
            },
            {
              question: "What does the 'CIA Triad' stand for in Cyber Security?",
              options: [
                "Central Intelligence Agency",
                "Confidentiality, Integrity, and Availability",
                "Control, Inspection, and Audit",
                "Connectivity, Internet, and Access"
              ],
              answerIndex: 1,
              explanation: "The CIA Triad stands for Confidentiality, Integrity, and Availability, which forms the foundation of all security policies."
            },
            {
              question: "What is the principle of 'Least Privilege'?",
              options: [
                "Giving users access to all resources to save configuration time",
                "Restricting user permissions to only what is strictly necessary for their role",
                "Forcing users to use weak passwords",
                "Encrypting all files with the same private key"
              ],
              answerIndex: 1,
              explanation: "Least Privilege dictates that users, processes, and systems should only have the access rights required to perform their specific duties."
            },
            {
              question: "Which of the following is a common hashing algorithm used for file integrity checks?",
              options: [
                "AES-256",
                "RSA",
                "SHA-256",
                "Diffie-Hellman"
              ],
              answerIndex: 2,
              explanation: "SHA-256 is a popular cryptographic hash function used to verify that files have not been modified (integrity)."
            },
            {
              question: `How does ByteMentor AI help you learn ${topic}?`,
              options: [
                "By running standard random lessons on AWS",
                "By designing a tailored module roadmap focused on ${goal}",
                "By writing production code automatically",
                "By hosting live classroom webinars"
              ],
              answerIndex: 1,
              explanation: "ByteMentor AI serves as a personalized AI coach, creating a structured curriculum roadmap tailored specifically to your goal and experience."
            }
          ],
          exercise: `1. Run the scanning sample script.\n2. Write a script that checks if a password meets complexity rules for ${moduleTitle}.`
        };
      }
      
      if (t.includes("ui/ux") || t.includes("ui ux") || t.includes("design")) {
        return {
          lectureNotes: `### 📌 Key Concepts: ${moduleTitle}
* **Core Goal**: Enhance user satisfaction by improving usability and accessibility for: ${goal}.
* **Key Step**: Conduct user testing and construct clean wireframes.
* **Layouts**: Use grids, consistent typography, and visual hierarchy.
* **Next Steps**: Validate designs with clickable prototypes.`,
          explanation: `Welcome to the **${topic}** journey! This lesson focuses on **${moduleTitle}** to help you achieve: *${goal}*.\n\n### Detailed Lecture on ${moduleTitle}\n\nIn this module, we study how **${moduleTitle}** shapes user experiences and interactive interfaces. A premium design system relies on color harmony, grids, accessibility, and visual flows to keep customers engaged.\n\n#### Why it matters:\nEven the most powerful backend code fails if users struggle to navigate the interface or if the layout feels cluttered and unpolished.\n\n#### Core Principles:\n1. **Visual Hierarchy**: Guide the user's eye to the most important elements first.\n2. **Consistency**: Use standardized padding, colors, and typography across screens.\n3. **Feedback**: Always provide visual states (e.g. active, hover) for interactive nodes.`,
          realWorldExample: `A mobile app redesigns its checkout flow using ${moduleTitle} concepts, reducing shopping cart abandonment by 35%.`,
          codeExample: `<!-- Wireframe Structure for ${moduleTitle} -->
[Header: logo | nav menu | profile]
------------------------------------
[Hero Section: Title text | Call-to-action button]
------------------------------------
[Feature Cards Grid: 3 columns, 16px gap]
  - Card 1: Icon (24px) + Subtitle (14px) + Body (12px)
  - Card 2: Icon (24px) + Subtitle (14px) + Body (12px)
  - Card 3: Icon (24px) + Subtitle (14px) + Body (12px)
------------------------------------
[Footer: legal text | copyright information]`,
          quiz: [
            {
              question: `What is the primary focus of today's module: "${moduleTitle}"?`,
              options: [
                "Optimizing backend server configuration settings",
                `Designing user-centered structures and layout grids under the ${topic} domain`,
                "Building advanced SQL joins",
                "None of the above"
              ],
              answerIndex: 1,
              explanation: `The focus of today's lesson is to construct core baseline design skills for "${moduleTitle}" under the broader topic of "${topic}".`
            },
            {
              question: "What is 'Visual Hierarchy' in design?",
              options: [
                "The order in which the user's eye perceives and processes information on a page",
                "The complexity of the folder structure in Figma",
                "The loading speed of images",
                "The number of layers in a Photoshop file"
              ],
              answerIndex: 0,
              explanation: "Visual hierarchy is the arrangement of elements in a way that implies importance, guiding the user's navigation flow."
            },
            {
              question: "Which of the following describes standard WCAG accessibility guidelines?",
              options: [
                "Using small, light gray fonts on white backgrounds",
                "Ensuring text contrast, descriptive alt tags, and keyboard navigability",
                "Limiting screens to mobile devices only",
                "Creating complex animations that loop indefinitely"
              ],
              answerIndex: 1,
              explanation: "WCAG outlines principles to make web content accessible to people with disabilities, emphasizing text contrast, layout readability, and structure."
            },
            {
              question: "What is a 'User Persona'?",
              options: [
                "A fictional character representing a key segment of your target users",
                "The programmer writing the codebase",
                "A security credential used for API authentication",
                "The CEO of the company"
              ],
              answerIndex: 0,
              explanation: "A User Persona is a semi-fictional representation of your ideal customer based on user research and data."
            },
            {
              question: `How does ByteMentor AI help you learn ${topic}?`,
              options: [
                "By running standard random lessons on AWS",
                "By designing a tailored module roadmap focused on ${goal}",
                "By writing production code automatically",
                "By hosting live classroom webinars"
              ],
              answerIndex: 1,
              explanation: "ByteMentor AI serves as a personalized AI coach, creating a structured curriculum roadmap tailored specifically to your goal and experience."
            }
          ],
          exercise: `1. Sketch a rough wireframe for ${moduleTitle} on paper.\n2. Detail the spacing and typography hierarchy chosen for the main dashboard header.`
        };
      }
      
      if (t.includes("project management") || t.includes("agile") || t.includes("management")) {
        return {
          lectureNotes: `### 📌 Key Concepts: ${moduleTitle}
* **Core Goal**: Coordinate resources, schedules, and deliverables to achieve: ${goal}.
* **Key Step**: Formulate the project charter, outline milestones, and define scopes.
* **Methodologies**: Agile, Scrum, Kanban, and Waterfall.
* **Next Steps**: Conduct sprint planning and standup reviews daily.`,
          explanation: `Welcome to the **${topic}** journey! This lesson focuses on **${moduleTitle}** to help you achieve: *${goal}*.\n\n### Detailed Lecture on ${moduleTitle}\n\nIn this module, we examine how **${moduleTitle}** drives productivity and successful delivery in modern organizations. Effective scoping, timeline management, and stakeholder alignment are critical to project success.\n\n#### Why it matters:\nWithout clear milestones, defined scopes, and structured communication, projects face scope creep, budget overruns, and missed deadlines.\n\n#### Core Principles:\n1. **Scope Definition**: Define what is included (and excluded) from project deliverables.\n2. **Agile Iteration**: Review progress in short cycles to allow quick adaptation.\n3. **Transparent Metrics**: Track progress using clear visual boards (Kanban) and metrics (Velocity).`,
          realWorldExample: `A software development team adopts ${moduleTitle} principles, reducing time-to-market by 40% and eliminating scope creep.`,
          codeExample: `<!-- User Story Template for ${moduleTitle} -->
As a [User Role],
I want to [Specific Action/Goal],
So that [Desired Benefit/Outcome].

Acceptance Criteria:
1. Scenario: Verify success when...
   - Given: A pre-condition
   - When: An event occurs
   - Then: The outcome matches expectations`,
          quiz: [
            {
              question: `What is the primary focus of today's module: "${moduleTitle}"?`,
              options: [
                "Writing low-level hardware drivers",
                `Managing timelines, resources, and delivery methods under the ${topic} domain`,
                "Compiling CSS variables in Vite",
                "None of the above"
              ],
              answerIndex: 1,
              explanation: `The focus of today's lesson is to construct core baseline skills for "${moduleTitle}" under the broader topic of "${topic}".`
            },
            {
              question: "What is 'Scope Creep' in project management?",
              options: [
                "Moving the project files to a new repository",
                "The uncontrolled expansion of project scope without adjustments to time, cost, or resources",
                "The speed at which developers write features",
                "A security threat where credentials are leaked"
              ],
              answerIndex: 1,
              explanation: "Scope creep refers to changes or continuous growth in a project's scope after the project begins, leading to delays and budget issues."
            },
            {
              question: "In Scrum, what is the role of the 'Product Owner'?",
              options: [
                "Writing source code and running test cases",
                "Defining user stories, prioritizing the backlog, and representing stakeholders",
                "Managing server deployments",
                "Designing marketing campaigns"
              ],
              answerIndex: 1,
              explanation: "The Product Owner is responsible for maximizing the value of the product resulting from work of the Scrum Team, managing the product backlog."
            },
            {
              question: "What is a 'Sprint Retro'?",
              options: [
                "A planning meeting to estimate new user stories",
                "A meeting held at the end of a sprint to reflect on the process and identify improvements",
                "A test run of the application build",
                "A deployment check"
              ],
              answerIndex: 1,
              explanation: "The Sprint Retrospective is an opportunity for the Scrum Team to inspect itself and create a plan for improvements to be enacted during the next Sprint."
            },
            {
              question: `How does ByteMentor AI help you learn ${topic}?`,
              options: [
                "By running standard random lessons on AWS",
                "By designing a tailored module roadmap focused on ${goal}",
                "By writing production code automatically",
                "By hosting live classroom webinars"
              ],
              answerIndex: 1,
              explanation: "ByteMentor AI serves as a personalized AI coach, creating a structured curriculum roadmap tailored specifically to your goal and experience."
            }
          ],
          exercise: `1. Draft a complete User Story and acceptance criteria for ${moduleTitle}.\n2. Outline a milestone timeline for your goal: "${goal}".`
        };
      }
      
      // Fallback for general tech/programming topics (Python, JS, React, Go, etc.)
      return {
        lectureNotes: `### 📌 Key Concepts: ${moduleTitle}
* **Core Goal**: Understand syntax, execution flow, and application for: ${goal}.
* **Key Step**: Implement basic functions, verify variable scopes, and debug errors.
* **Architecture**: Follow modular patterns and clear design layouts.
* **Next Steps**: Integrate APIs and persist state logic.`,
        explanation: `Welcome to the **${topic}** journey! This lesson focuses on **${moduleTitle}** to help you achieve: *${goal}*.\n\n### Detailed Lecture on ${moduleTitle}\n\nIn this module, we examine how **${moduleTitle}** is used to construct features, control logic flow, and build robust software in **${topic}**.\n\n#### Why it matters:\nMastering these fundamentals ensures that your applications run efficiently, are easy to debug, and scale properly as you add complexity.\n\n#### Core Principles:\n1. **Readability**: Write self-explanatory code with clear variable and function names.\n2. **Modularity**: Break down complex structures into small, isolated functions.\n3. **Robustness**: Implement proper error boundaries and validate parameters.`,
        realWorldExample: `A production system leverages ${moduleTitle} to process API queries, handling thousands of concurrent requests with low latency.`,
        codeExample: `// Sample implementation of ${moduleTitle} in ${topic}\nfunction runLesson() {\n  const currentModule = "${moduleTitle}";\n  const studyGoal = "${goal}";\n  console.log(\`Active Lesson: \${currentModule} for goal: \${studyGoal}\`);\n}\nrunLesson();`,
        quiz: [
          {
            question: `What is the primary focus of today's module: "${moduleTitle}"?`,
            options: [
              "Configuring multi-region cloud servers",
              `Mastering core constructs and syntax of ${moduleTitle} under the ${topic} domain`,
              "Writing UX wireframes on paper",
              "None of the above"
            ],
            answerIndex: 1,
            explanation: `The focus of today's lesson is to construct core baseline skills for "${moduleTitle}" under the broader topic of "${topic}".`
          },
          {
            question: "Why is modularity important in programming?",
            options: [
              "It forces the compiler to run slower for extra safety checks",
              "It divides the code into distinct, independent sections that are easier to test and reuse",
              "It decreases the number of lines of code",
              "It encrypts the output files automatically"
            ],
            answerIndex: 1,
            explanation: "Modularity separates the functionality of a program into independent, interchangeable modules, enhancing readability, testing, and reuse."
          },
          {
            question: "What is a variable scope?",
            options: [
              "The context/region of the code where a variable is defined and accessible",
              "The maximum size of a variable in bytes",
              "The memory address of a global constant",
              "The compiler type validation checklist"
            ],
            answerIndex: 0,
            explanation: "Scope determines the visibility or accessibility of variables in different parts of your code."
          },
          {
            question: "What is the best way to handle potential runtime errors in code?",
            options: [
              "Ignore them and let the program crash",
              "Implement try-catch error blocks or error boundaries to gracefully handle exceptions",
              "Delete the lines of code causing the error",
              "Hardcode mock values directly into the main database"
            ],
            answerIndex: 1,
            explanation: "Try-catch blocks allow the application to handle exceptions gracefully, logging details and showing friendly messages instead of crashing."
          },
          {
            question: `How does ByteMentor AI help you learn ${topic}?`,
            options: [
              "By running standard random lessons on AWS",
              "By designing a tailored module roadmap focused on ${goal}",
              "By writing production code automatically",
              "By hosting live classroom webinars"
            ],
            answerIndex: 1,
            explanation: "ByteMentor AI serves as a personalized AI coach, creating a structured curriculum roadmap tailored specifically to your goal and experience."
          }
        ],
        exercise: `1. Run the sample script in your local environment.\n2. Extend it to print a welcome message for learning: ${topic}.`
      };
    };

    const dynamicContent = getDynamicMockContent(
      activeProfile.topic,
      currentModuleTitle,
      activeProfile.difficulty,
      activeProfile.goal,
      activeProfile.studyTime
    );

    const mockLesson: Lesson = {
      lessonDate: localDate,
      topic: `Mastering ${currentModuleTitle}`,
      difficulty: activeProfile.difficulty,
      estimatedTime: "15 mins",
      learningObjective: `Explain key concepts of ${currentModuleTitle} and how it fits into ${activeProfile.topic}.`,
      lectureNotes: dynamicContent.lectureNotes,
      explanation: dynamicContent.explanation,
      realWorldExample: dynamicContent.realWorldExample,
      codeExample: dynamicContent.codeExample,
      quiz: dynamicContent.quiz,
      exercise: dynamicContent.exercise,
      productivityTip: `Allocate a fixed slot in your calendar (e.g. 8:00 AM) to read your daily micro-lessons without distractions.`,
      motivationalQuote: "The secret of getting ahead is getting started. - Mark Twain",
      completed: false,
      generatedAt: new Date().toISOString(),
      moduleTitle: currentModuleTitle,
      moduleIndex: currentModuleIndex
    };
    
    setTodayLesson(mockLesson);
    localStorage.setItem(`bytementor_lesson_${localDate}`, JSON.stringify(mockLesson));
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
    
    // Check if API_URL is configured
    if (!API_URL) {
      const savedLesson = localStorage.getItem(`bytementor_lesson_${localDate}`);
      if (savedLesson) {
        setTodayLesson(JSON.parse(savedLesson));
      } else {
        generateMockTodayLesson(currentProfile);
      }
      setLoadingToday(false);
      return;
    }

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

    if (!API_URL) {
      // Mock history in local storage
      const lessons: Lesson[] = [];
      const profileData = localStorage.getItem("bytementor_profile");
      if (profileData) {
        const parsedProfile = JSON.parse(profileData) as Profile;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        // Let's check if we have a cached completed lesson for yesterday
        const savedYesterday = localStorage.getItem(`bytementor_lesson_${yesterdayStr}`);
        if (savedYesterday) {
          lessons.push(JSON.parse(savedYesterday));
        } else if (parsedProfile.roadmap.length > 0) {
          // Push a mock completed lesson for history
          lessons.push({
            lessonDate: yesterdayStr,
            topic: `Basics of ${parsedProfile.roadmap[0].title}`,
            difficulty: parsedProfile.difficulty,
            estimatedTime: "12 mins",
            learningObjective: "Understand core constructs.",
            explanation: "Core concepts explanation for learning history review.",
            realWorldExample: "A real-world example.",
            codeExample: "console.log('History Lesson Code Example');",
            quiz: [],
            exercise: "Review yesterday's notes.",
            productivityTip: "Review history regularly.",
            motivationalQuote: "Knowledge accumulates slowly. - Anonymous",
            completed: true,
            generatedAt: yesterday.toISOString(),
            moduleTitle: parsedProfile.roadmap[0].title,
            moduleIndex: 0
          });
        }
      }

      // Check if today's lesson is completed and add to history if it is
      const todayStr = getLocalDateString();
      const savedToday = localStorage.getItem(`bytementor_lesson_${todayStr}`);
      if (savedToday) {
        const parsedToday = JSON.parse(savedToday) as Lesson;
        if (parsedToday.completed) {
          lessons.push(parsedToday);
        }
      }

      setHistoryLessons(lessons);
      setLoadingHistory(false);
      return;
    }

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
    // If not configured, update local mock states
    if (!API_URL) {
      if (todayLesson && todayLesson.lessonDate === date) {
        const updatedLesson = { ...todayLesson, completed: true };
        setTodayLesson(updatedLesson);
        localStorage.setItem(`bytementor_lesson_${date}`, JSON.stringify(updatedLesson));
        
        // Progress roadmap
        if (profile && todayLesson.moduleIndex !== undefined) {
          const index = todayLesson.moduleIndex;
          const updatedRoadmap = [...profile.roadmap];
          updatedRoadmap[index] = { ...updatedRoadmap[index], status: 'Completed' };
          if (updatedRoadmap[index + 1]) {
            updatedRoadmap[index + 1] = { ...updatedRoadmap[index + 1], status: 'Current' };
          }
          const updatedProfile = { ...profile, roadmap: updatedRoadmap };
          setProfile(updatedProfile);
          localStorage.setItem("bytementor_profile", JSON.stringify(updatedProfile));
        }
      }
      return;
    }

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
    if (!API_URL) {
      localStorage.removeItem("bytementor_profile");
      const localKeys = Object.keys(localStorage);
      localKeys.forEach(k => {
        if (k.startsWith("bytementor_lesson_")) {
          localStorage.removeItem(k);
        }
      });
    }
    setCurrentPage('onboarding');
  };

  // On onboarding finished
  const handleCompleteOnboarding = (completedProfile: Profile) => {
    setProfile(completedProfile);
    if (!API_URL) {
      localStorage.setItem("bytementor_profile", JSON.stringify(completedProfile));
      generateMockTodayLesson(completedProfile);
    } else {
      fetchTodayLesson(completedProfile);
    }
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
