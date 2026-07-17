import Groq from "groq-sdk";
import { DynamoDBClient, PutItemCommand, GetItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize AWS Clients
const ddbClient = new DynamoDBClient({});
const sesClient = new SESClient({});

const TABLE_NAME = process.env.TABLE_NAME || "ByteMentorLessons";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant"
];
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  console.log("Groq key exists:", !!process.env.GROQ_API_KEY);

  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey
    });
  }

  return groqClient;
}

const PREDEFINED_ROADMAPS: Record<string, { title: string; modules: string[] }> = {
  "machine-learning": {
    title: "Machine Learning",
    modules: [
      "Python Basics",
      "NumPy",
      "Pandas",
      "Statistics",
      "Linear Algebra",
      "Data Visualization",
      "Regression",
      "Classification",
      "Decision Trees",
      "Random Forest",
      "Neural Networks",
      "Deep Learning",
      "Model Deployment"
    ]
  },
  "cyber-security": {
    title: "Cyber Security",
    modules: [
      "Networking Fundamentals",
      "Linux",
      "Operating Systems",
      "TCP/IP",
      "Cryptography",
      "OWASP Top 10",
      "Web Security",
      "Burp Suite",
      "Privilege Escalation",
      "Active Directory",
      "Penetration Testing"
    ]
  },
  "react": {
    title: "React",
    modules: [
      "JavaScript Refresher",
      "Components & JSX",
      "Props & State",
      "Event Handling",
      "Hooks (useState, useEffect)",
      "Custom Hooks",
      "Context API",
      "React Router",
      "API Integration",
      "Form Handling",
      "State Management (Redux/Zustand)",
      "Performance Optimization"
    ]
  },
  "python": {
    title: "Python",
    modules: [
      "Setup & Basic Syntax",
      "Data Types & Variables",
      "Control Flow (If, Loops)",
      "Functions & Modules",
      "Data Structures (Lists, Dicts)",
      "File I/O",
      "Object-Oriented Programming (OOP)",
      "Error Handling",
      "Virtual Environments",
      "Standard Library",
      "Database Integration",
      "Basics of Web Scraping"
    ]
  },
  "javascript": {
    title: "JavaScript",
    modules: [
      "Variables & Operators",
      "Control Flow",
      "Functions & Scope",
      "Arrays & Objects",
      "DOM Manipulation",
      "Event Listeners",
      "Asynchronous JS (Promises, Async/Await)",
      "Fetch API & JSON",
      "ES6+ Features",
      "Error Handling",
      "LocalStorage & SessionStorage",
      "Modular JavaScript"
    ]
  },
  "nodejs": {
    title: "Node.js",
    modules: [
      "Node.js Runtime Basics",
      "Event Loop & Asynchronous Architecture",
      "File System Module",
      "HTTP Module",
      "NPM & Package Management",
      "Express.js Framework",
      "Routing & Middleware",
      "REST API Design",
      "Authentication & JWT",
      "Database Connection (Mongoose/Sequelize)",
      "Error Handling Middlewares",
      "Deployment & PM2"
    ]
  },
  "aws": {
    title: "AWS Cloud",
    modules: [
      "Cloud Computing Basics",
      "AWS Global Infrastructure",
      "IAM (Identity & Access Management)",
      "EC2 (Virtual Servers)",
      "VPC (Virtual Private Cloud)",
      "S3 (Simple Storage Service)",
      "RDS & DynamoDB (Databases)",
      "Serverless (Lambda & API Gateway)",
      "Route 53 & CloudFront",
      "CloudWatch & CloudTrail",
      "Auto Scaling & Load Balancing",
      "AWS Certified Cloud Practitioner prep"
    ]
  },
  "devops": {
    title: "DevOps",
    modules: [
      "Introduction to DevOps",
      "Linux Administration",
      "Bash Scripting",
      "Git & Version Control",
      "CI/CD Pipelines (GitHub Actions/Jenkins)",
      "Infrastructure as Code (Terraform)",
      "Containerization (Docker)",
      "Container Orchestration (Kubernetes)",
      "Monitoring & Logging (Prometheus/Grafana)",
      "Configuration Management (Ansible)",
      "Cloud Provider Integration",
      "Security in DevOps (DevSecOps)"
    ]
  },
  "docker": {
    title: "Docker",
    modules: [
      "Containerization Basics",
      "Installing Docker",
      "Docker Images & Containers",
      "Dockerfile Creation",
      "Docker Commands Reference",
      "Docker Volumes (Data Persistence)",
      "Docker Networking",
      "Docker Compose (Multi-container apps)",
      "Port Mapping & Environments",
      "Image Optimization",
      "Registry & Docker Hub",
      "Docker Security Practices"
    ]
  },
  "kubernetes": {
    title: "Kubernetes",
    modules: [
      "Container Orchestration Basics",
      "Kubernetes Architecture (Control Plane vs Nodes)",
      "kubectl CLI tool",
      "Pods Lifecycle",
      "Deployments & ReplicaSets",
      "Services (ClusterIP, NodePort, LoadBalancer)",
      "ConfigMaps & Secrets",
      "Persistent Volumes & Claims",
      "Ingress Controllers",
      "Namespaces & Resource Quotas",
      "Helm Package Manager",
      "Monitoring K8s Clusters"
    ]
  },
  "system-design": {
    title: "System Design",
    modules: [
      "Vertical vs Horizontal Scaling",
      "Load Balancers",
      "Caching Strategies (Redis/Memcached)",
      "Database Sharding & Replication",
      "Monoliths vs Microservices",
      "Message Queues (Kafka/RabbitMQ)",
      "Consistency (CAP Theorem)",
      "CDNs (Content Delivery Networks)",
      "Rate Limiters",
      "Logging & Metrics",
      "Designing a URL Shortener",
      "Designing a Chat Application"
    ]
  },
  "uiux": {
    title: "UI/UX Design",
    modules: [
      "Design Thinking Process",
      "User Research & Personas",
      "Information Architecture",
      "Wireframing Basics",
      "Prototyping (Figma/Adobe XD)",
      "Typography & Color Theory",
      "Layouts & Grids",
      "Interactive Design Principles",
      "Usability Testing",
      "Accessibility (WCAG guidelines)",
      "Responsive Web UI Design",
      "Design Systems & Component Libraries"
    ]
  },
  "project-management": {
    title: "Project Management",
    modules: [
      "Project Lifecycle Phases",
      "Waterfall vs Agile Methodologies",
      "Scrum Framework & Sprints",
      "Kanban Board Management",
      "Writing User Stories",
      "Project Scope & Estimation",
      "Risk Management & Mitigation",
      "Team Collaboration Tools (Jira/Trello)",
      "Stakeholder Communication",
      "KPIs & Project Metrics",
      "Budgeting & Resource Allocation",
      "Project Retro & Closeout"
    ]
  },
  "data-science": {
    title: "Data Science",
    modules: [
      "Data Science Lifecycle",
      "Python for Data Analysis",
      "Data Cleaning & Preprocessing",
      "Exploratory Data Analysis (EDA)",
      "Descriptive & Inferential Statistics",
      "SQL for Data Retrievals",
      "Data Visualization (Matplotlib/Seaborn)",
      "Feature Engineering",
      "Introduction to Machine Learning",
      "Time Series Analysis",
      "Big Data Basics (Spark)",
      "Data Science Ethics"
    ]
  },
  "artificial-intelligence": {
    title: "Artificial Intelligence",
    modules: [
      "History & Types of AI",
      "Search Algorithms",
      "Knowledge Representation",
      "Machine Learning Foundations",
      "Natural Language Processing (NLP)",
      "Computer Vision Basics",
      "Neural Networks Architecture",
      "Generative AI & Large Language Models",
      "Reinforcement Learning",
      "AI Ethics & Bias",
      "Robotics Foundations",
      "AI Application Deployments"
    ]
  },
  "flutter": {
    title: "Flutter",
    modules: [
      "Intro to Dart Programming",
      "Flutter SDK Setup",
      "Widgets (Stateless vs Stateful)",
      "Layouts (Row, Column, Stack)",
      "Navigation & Routing",
      "Form Validation",
      "State Management (Provider/Bloc)",
      "HTTP requests & JSON parsing",
      "Local Persistence (SharedPreferences)",
      "Animations & Micro-interactions",
      "Integrating Native Code",
      "App Store & Play Store deployment"
    ]
  },
  "go": {
    title: "Go",
    modules: [
      "Go Basics & Workspace",
      "Variables, Types & Constants",
      "Control Structures (For, Switch)",
      "Slices, Arrays & Maps",
      "Functions & Defer",
      "Structs & Methods",
      "Interfaces & Polymorphism",
      "Pointers in Go",
      "Concurrency (Goroutines & Channels)",
      "Standard Library Modules (net/http, io)",
      "Writing Unit Tests in Go",
      "Building Web Servers & APIs"
    ]
  },
  "rust": {
    title: "Rust",
    modules: [
      "Getting Started with Cargo",
      "Variables, Mutability & Types",
      "Memory Management (Ownership & Borrowing)",
      "Lifetimes Concept",
      "Structs & Enums",
      "Pattern Matching",
      "Error Handling (Result & Option)",
      "Generics & Traits",
      "Concurrency Models",
      "Smart Pointers (Box, Rc, Arc)",
      "Writing Tests & Documentation",
      "Performance Profiling"
    ]
  },
  "cplusplus": {
    title: "C++",
    modules: [
      "C++ Syntax & Structure",
      "Control Flows & Loops",
      "Functions & Overloading",
      "Pointers & References",
      "Memory Management (Stack vs Heap)",
      "OOP (Classes, Inheritance, Polymorphism)",
      "Templates & Generics",
      "Standard Template Library (STL)",
      "File Streams & I/O",
      "Smart Pointers (C++11+)",
      "Concurrency & Threads",
      "Performance Tuning & Profiling"
    ]
  }
};

function getTemplateKey(topic: string): string {
  const t = topic.trim().toLowerCase();
  if (t.includes("machine learning")) return "machine-learning";
  if (t.includes("cyber security")) return "cyber-security";
  if (t.includes("react")) return "react";
  if (t.includes("python")) return "python";
  if (t.includes("javascript")) return "javascript";
  if (t.includes("node.js") || t.includes("nodejs")) return "nodejs";
  if (t.includes("aws") || t.includes("amazon web services")) return "aws";
  if (t.includes("devops")) return "devops";
  if (t.includes("docker")) return "docker";
  if (t.includes("kubernetes")) return "kubernetes";
  if (t.includes("system design")) return "system-design";
  if (t.includes("ui/ux") || t.includes("ui ux")) return "uiux";
  if (t.includes("project management")) return "project-management";
  if (t.includes("data science")) return "data-science";
  if (t.includes("artificial intelligence") || t.includes(" ai ")) return "artificial-intelligence";
  if (t.includes("flutter")) return "flutter";
  if (t.includes("go ") || t === "go") return "go";
  if (t.includes("rust")) return "rust";
  if (t.includes("c++") || t.includes("cplusplus")) return "cplusplus";
  return "";
}

// Define the Lesson Interface
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
  quiz: Array<{
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }>;
  exercise: string;
  productivityTip: string;
  motivationalQuote: string;
  completed: boolean;
  generatedAt: string;
  moduleTitle?: string;
  moduleIndex?: number;
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

function isTransientError(error: any): boolean {
  const status = error?.status || error?.statusCode || error?.response?.status;
  if (typeof status === "number") {
    return status === 429 || (status >= 500 && status < 600);
  }
  const message = (error?.message || String(error)).toLowerCase();
  const code = (error?.code || "").toLowerCase();
  return (
    message.includes("429") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("overloaded") ||
    code === "etimedout" ||
    code === "econnaborted" ||
    code === "econnrefused"
  );
}

async function generateWithGroq(systemPrompt: string, userPrompt: string, maxTokens: number, temperature: number): Promise<string> {
  const ai = getGroqClient();
  const failures: string[] = [];
  const models = [DEFAULT_GROQ_MODEL, ...FALLBACK_GROQ_MODELS];

  for (const model of models) {
    let attempts = 0;
    const maxAttempts = 2; // Initial try + 1 retry on transient error

    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`[DEBUG] Attempting generation with model: ${model} (attempt ${attempts}/${maxAttempts})`);
        const response = await ai.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model,
          max_tokens: maxTokens,
          temperature,
          response_format: { type: "json_object" }
        });

        const responseText = response.choices?.[0]?.message?.content?.trim() || "";
        if (!responseText) {
          throw new Error(`Empty response content from model ${model}`);
        }

        return responseText;
      } catch (error: any) {
        const isTransient = isTransientError(error);
        const errMsg = error?.message || String(error);
        console.error(`[ERROR] Model ${model} failed on attempt ${attempts}:`, error);

        if (isTransient && attempts < maxAttempts) {
          console.warn(`[WARNING] Transient error detected for model ${model}. Retrying once...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        console.error(`[CLOUD_WATCH_LOG] Provider error with model ${model}: ${errMsg}`);
        failures.push(`${model}: ${errMsg}`);
        break; // Break inner loop to move to the next model
      }
    }
  }

  // Never expose internal errors to the frontend
  throw new Error("Failed to generate content. Please try again later.");
}

/**
 * Generates a personalized learning roadmap using Gemini.
 */
async function generateRoadmap(topic: string, difficulty: string, goal: string, studyTime: string): Promise<Array<{ title: string }>> {
  console.log(`[DEBUG] generateRoadmap - Selected Topic: "${topic}"`);
  const systemPrompt = `You are ByteMentor AI, an elite autonomous personalized Learning Coach.
Your task is to generate a comprehensive, structured, and customized learning roadmap for a student.
Output ONLY a valid JSON object matching the schema below. Do not wrap the JSON in markdown code blocks. Do not add any text before or after the JSON.

Guidelines:
- The roadmap modules MUST be strictly relevant to learning the topic: "${topic}".
- NEVER include modules or references about AWS or cloud infrastructure unless the topic is explicitly "AWS Cloud" or "DevOps".
- Follow a logical progression from beginner foundations to advanced applications.

JSON Schema:
{
  "roadmap": [
    {
      "title": "Module Title (e.g. 'Introduction to Python')"
    }
  ]
}`;

  const userPrompt = `Generate a personalized learning roadmap with 6 to 10 sequential modules to learn the topic: "${topic}".
The user has experience level: "${difficulty}".
Their goal is: "${goal}".
They can study: "${studyTime}" per day.
Ensure the modules follow a clear, logical progression from foundational concepts to advanced topics suited for their experience level and goal.`;

  console.log(`[DEBUG] generateRoadmap - Prompt sent to Groq: "${userPrompt}"`);

  try {
    const responseText = await generateWithGroq(systemPrompt, userPrompt, 2000, 0.7);

    let cleanJsonText = responseText.trim();
    console.log(`[DEBUG] generateRoadmap - Response from Groq: "${cleanJsonText}"`);
    if (cleanJsonText.startsWith("```")) {
      cleanJsonText = cleanJsonText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsedJson = JSON.parse(cleanJsonText);
    return parsedJson.roadmap || [];
  } catch (error) {
    console.error("Roadmap generation failed:", error);
    throw error;
  }
}

/**
 * Generates a personalized lesson for a specific module under the roadmap.
 */
async function generateLessonForModule(date: string, profile: any, moduleTitle: string, moduleIndex: number): Promise<Lesson> {
  console.log(`[DEBUG] generateLessonForModule - Selected Topic: "${profile.topic}"`);
  console.log(`[DEBUG] generateLessonForModule - Current Module: "${moduleTitle}"`);

  const completedModules = profile.roadmap
    .filter((m: any, idx: number) => idx < moduleIndex)
    .map((m: any) => m.title);
  
  const roadmapTitles = profile.roadmap.map((m: any) => m.title);

  const systemPrompt = `You are a world-class university professor and elite instructor specializing ONLY in "${profile.topic}".
Your task is to generate a comprehensive, highly engaging, and structured daily micro-learning lesson for a user following a personalized roadmap.

User Context:
- Selected Topic / Domain: ${profile.topic}
- Roadmap Name: ${profile.topic} Roadmap
- Current Module: "${moduleTitle}" (Module Index: ${moduleIndex})
- Previously Completed Modules: ${JSON.stringify(completedModules)}
- Experience Level: ${profile.difficulty}
- Study Time: ${profile.studyTime} per day
- Learning Goal: ${profile.goal}

Strict Pedagogical Guidelines:
1. You are a world-class instructor specializing ONLY in "${profile.topic}".
2. You are currently teaching the module: "${moduleTitle}".
3. Do NOT teach general programming.
4. Do NOT teach software engineering unless it is directly and explicitly related to this module.
5. Do NOT reuse generic lesson templates or teach generic software design concepts (e.g. do NOT mention DRY, SOLID, OOP, or coupling unless they are the primary subject of the module).
6. Every explanation, key concept, real-world case study, quiz question, and exercise MUST belong strictly to the domain of "${profile.topic}" and the specific module "${moduleTitle}".
7. If the topic is non-technical/non-coding (such as UI/UX Design, Project Management, Product Management, Agile), the "codeExample" field MUST NOT contain programming code; instead, populate it with a structured Markdown layout (e.g., a wireframe layout description, user story specification, Figma design checklist, Kanban board setup, or template walkthrough).
8. Output ONLY a valid JSON object matching the schema below. Do not wrap the JSON in markdown code blocks. Do not add any text before or after the JSON.

JSON Schema:
{
  "topic": "Specific concept within ${moduleTitle} (e.g., 'NumPy Array Slicing')",
  "difficulty": "${profile.difficulty}",
  "estimatedTime": "Time based on daily limit of ${profile.studyTime} (e.g., '15 mins')",
  "learningObjective": "Learning objective specific to the current module.",
  "lectureNotes": "Key concepts and brief bullet-pointed reference notes for ${moduleTitle}.",
  "explanation": "A highly detailed, in-depth academic lecture explaining ${moduleTitle} thoroughly from the ground up, tailored to the level of ${profile.difficulty}.",
  "realWorldExample": "A practical real-world scenario/case study specific to this domain.",
  "codeExample": "A clean, functional code example or a structured Markdown layout description for non-coding topics.",
  "quiz": [
    {
      "question": "Domain-specific question covering this module",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ], // Provide exactly 5 high-quality MCQs covering this module.
  "exercise": "A practical hands-on task directly related to this lesson.",
  "productivityTip": "A domain-specific productivity tip or workflow optimization.",
  "motivationalQuote": "An inspiring tech/domain quote."
}`;

  const userPrompt = `Generate today's micro-learning lesson for the date ${date}. Focus exclusively on "${moduleTitle}" in the context of learning "${profile.topic}".`;
  console.log(`[DEBUG] generateLessonForModule - Prompt sent to Groq: "${userPrompt}"`);

  try {
    const responseText = await generateWithGroq(systemPrompt, userPrompt, 3000, 0.7);

    let cleanJsonText = responseText.trim();
    console.log(`[DEBUG] generateLessonForModule - Response from Groq: "${cleanJsonText}"`);
    if (cleanJsonText.startsWith("```")) {
      cleanJsonText = cleanJsonText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsedJson = JSON.parse(cleanJsonText);

    const lesson: Lesson = {
      lessonDate: date,
      topic: parsedJson.topic || `Study: ${moduleTitle}`,
      difficulty: parsedJson.difficulty || profile.difficulty || "Intermediate",
      estimatedTime: parsedJson.estimatedTime || "15 mins",
      learningObjective: parsedJson.learningObjective || `Learn about ${moduleTitle}.`,
      lectureNotes: parsedJson.lectureNotes || "No summary notes provided.",
      explanation: parsedJson.explanation || "No explanation provided.",
      realWorldExample: parsedJson.realWorldExample || "No real-world example provided.",
      codeExample: parsedJson.codeExample || "",
      quiz: parsedJson.quiz || [],
      exercise: parsedJson.exercise || "Try writing code using this concept.",
      productivityTip: parsedJson.productivityTip || "Keep learning daily.",
      motivationalQuote: parsedJson.motivationalQuote || "Keep pushing forward!",
      completed: false,
      generatedAt: new Date().toISOString(),
      moduleTitle: moduleTitle,
      moduleIndex: moduleIndex
    };

    return lesson;
  } catch (error) {
    console.error("Personalized lesson generation failed:", error);
    throw error;
  }
}

/**
 * Generates a legacy new lesson for a given date (fallback only) using Gemini.
 */
async function generateLesson(date: string): Promise<Lesson> {
  const systemPrompt = `You are ByteMentor AI, an elite autonomous Learning Coach.
Your task is to generate a comprehensive, highly engaging, and structured daily micro-learning lesson for software developers.
You must output ONLY a valid JSON object matching the schema below. Do not wrap the JSON in markdown code blocks. Do not add any text before or after the JSON.

Guidelines:
- Select general software development topics.
- NEVER generate content or reference AWS or cloud deployment in this fallback mode.

JSON Schema:
{
  "topic": "A specific technology concept (e.g. 'Understanding Git Rebase', 'React Server Components', 'CSS Flexbox vs Grid', 'Understanding SQL Joins')",
  "difficulty": "Beginner" or "Intermediate" or "Advanced",
  "estimatedTime": "Estimated time to study (e.g., '10 mins', '15 mins')",
  "learningObjective": "A clear, actionable sentence describing what the developer will learn.",
  "lectureNotes": "Brief, bullet-pointed summary sheet, reference notes, and key takeaways of the lecture concepts using clean Markdown.",
  "explanation": "A highly detailed, comprehensive, in-depth academic lecture explaining the topic thoroughly from the ground up. Include subtitles, structured sections, concepts, and detailed analysis. Use clean Markdown.",
  "realWorldExample": "A practical real-world scenario/case study illustrating why this concept matters and how it is used.",
  "codeExample": "A clean, functional code example demonstrating the concept in TypeScript, JavaScript, Python, or SQL. Provide only the code, comments, and structure.",
  "quiz": [
    {
      "question": "Clear multiple-choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ], // Provide exactly 5 high-quality quiz questions (MCQs) covering the concepts taught in the lecture.
  "exercise": "A hands-on coding exercise, task, or challenge that the reader can try on their own to test their understanding.",
  "productivityTip": "A developer productivity tip or trick (e.g., a CLI shortcut, IDE feature, or workflow optimization).",
  "motivationalQuote": "An inspiring, tech-related, or general motivational quote for developers."
}`;

  const userPrompt = `Generate a unique developer lesson for the date ${date}.
Select a relevant topic in software engineering (React patterns, Git workflows, CSS tips, JavaScript/TypeScript, SQL, performance optimization, design patterns).
Make sure the lesson is highly engaging, clean, and contains a practical, fully formed code example.`;

  try {
    const responseText = await generateWithGroq(systemPrompt, userPrompt, 3000, 0.7);

    // Clean up responseText if Groq wraps it in markdown code blocks
    let cleanJsonText = responseText.trim();
    if (cleanJsonText.startsWith("```")) {
      // Strip ```json or ``` if present
      cleanJsonText = cleanJsonText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsedJson = JSON.parse(cleanJsonText);

    // Build the full Lesson object
    const lesson: Lesson = {
      lessonDate: date,
      topic: parsedJson.topic || "Daily Tech Micro-learning",
      difficulty: parsedJson.difficulty || "Intermediate",
      estimatedTime: parsedJson.estimatedTime || "10 mins",
      learningObjective: parsedJson.learningObjective || "Understand key technical concepts.",
      lectureNotes: parsedJson.lectureNotes || "No summary notes provided.",
      explanation: parsedJson.explanation || "No explanation provided.",
      realWorldExample: parsedJson.realWorldExample || "No real-world example provided.",
      codeExample: parsedJson.codeExample || "",
      quiz: parsedJson.quiz || [],
      exercise: parsedJson.exercise || "Try implementing this concept in your local IDE.",
      productivityTip: parsedJson.productivityTip || "Keep learning every day.",
      motivationalQuote: parsedJson.motivationalQuote || "Code is like humor. When you have to explain it, it’s bad. - Cory House",
      completed: false,
      generatedAt: new Date().toISOString()
    };

    return lesson;
  } catch (error) {
    console.error("Groq generation failed:", error);
    throw error;
  }
}

/**
 * Sends a daily lesson email via SES if configured.
 */
async function sendLessonEmail(lesson: Lesson, sender: string, recipient: string) {
  const subject = `ByteMentor AI: Today's Lesson - ${lesson.topic}`;
  
  const textBody = `
Good Morning! Today's lesson is ready:

Topic: ${lesson.topic} (${lesson.difficulty})
Estimated Study Time: ${lesson.estimatedTime}
Learning Objective: ${lesson.learningObjective}

To view the explanation, code example, take the quiz, and mark it as completed, please visit the dashboard.

Quote of the Day:
"${lesson.motivationalQuote}"
`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff; color: #333333;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">ByteMentor AI</h2>
      <p style="font-size: 16px;">Good morning! Today's lesson is prepared and waiting for you.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #111827;">${lesson.topic}</h3>
        <p><strong>Difficulty:</strong> ${lesson.difficulty} | <strong>Estimated Time:</strong> ${lesson.estimatedTime}</p>
        <p><strong>Objective:</strong> ${lesson.learningObjective}</p>
      </div>

      <p>Visit your dashboard to view the explanation, interact with the code snippet, complete the hands-on exercise, and test your knowledge with today's mini quiz!</p>
      
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      
      <p style="font-style: italic; color: #6b7280;">"${lesson.motivationalQuote}"</p>
    </div>
  `;

  try {
    const command = new SendEmailCommand({
      Source: sender,
      Destination: {
        ToAddresses: [recipient]
      },
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Text: {
            Data: textBody
          },
          Html: {
            Data: htmlBody
          }
        }
      }
    });

    await sesClient.send(command);
    console.log(`Successfully sent daily lesson email to ${recipient}`);
  } catch (error) {
    // Log error but do not fail the Lambda execution
    console.error("Failed to send email via SES:", error);
  }
}

/**
 * Standard CORS response headers
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json"
};

// Helper to format API responses
const apiResponse = (statusCode: number, body: any) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});

/**
 * AWS Lambda Handler
 */
export const handler = async (event: any): Promise<any> => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  // 1. Check if trigger is EventBridge Scheduler (CRON)
  if (event.scheduled) {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    console.log(`Scheduler triggered. Generating daily lesson for UTC date: ${todayStr}`);

    try {
      // Check if lesson already generated to avoid duplicate generation costs
      const getCommand = new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ lessonDate: todayStr })
      });
      const getResult = await ddbClient.send(getCommand);
      
      let lesson: Lesson;
      if (getResult.Item) {
        console.log(`Lesson for ${todayStr} already exists. Skipping regeneration.`);
        lesson = unmarshall(getResult.Item) as Lesson;
      } else {
        // Read user profile
        const getProfileCommand = new GetItemCommand({
          TableName: TABLE_NAME,
          Key: marshall({ lessonDate: "profile" })
        });
        const profileResult = await ddbClient.send(getProfileCommand);

        if (profileResult.Item) {
          const profile = unmarshall(profileResult.Item);
          let currentModuleIndex = profile.roadmap.findIndex((m: any) => m.status === "Current");
          if (currentModuleIndex === -1) {
            currentModuleIndex = profile.roadmap.findIndex((m: any) => m.status !== "Completed");
          }
          if (currentModuleIndex === -1) {
            currentModuleIndex = profile.roadmap.length - 1;
          }
          const currentModule = profile.roadmap[currentModuleIndex];
          
          console.log(`Generating personalized lesson for module: ${currentModule.title}`);
          lesson = await generateLessonForModule(todayStr, profile, currentModule.title, currentModuleIndex);
        } else {
          // Fallback legacy lesson
          console.log("Profile not found. Generating default lesson.");
          lesson = await generateLesson(todayStr);
        }

        const putCommand = new PutItemCommand({
          TableName: TABLE_NAME,
          Item: marshall(lesson)
        });
        await ddbClient.send(putCommand);
        console.log(`Successfully generated and stored lesson for ${todayStr}`);
      }

      // Check SES config and send email
      const sender = process.env.SES_EMAIL_SENDER;
      const recipient = process.env.SES_EMAIL_RECIPIENT;
      if (sender && recipient) {
        await sendLessonEmail(lesson, sender, recipient);
      } else {
        console.log("SES Email not configured. Skipping email send.");
      }

      return { status: "success", date: todayStr };
    } catch (error: any) {
      console.error("Daily cron job failed:", error);
      return { status: "error", message: "Daily cron job failed" };
    }
  }

  // 2. Handle HTTP (Function URL or API Gateway) requests
  const httpMethod = event.httpMethod || event.requestContext?.http?.method || "";
  const rawPath = event.path || event.rawPath || "";

  // Handle CORS OPTIONS preflight
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    // Route: GET /lesson/profile (or /profile)
    if (httpMethod === "GET" && (rawPath.endsWith("/lesson/profile") || rawPath.endsWith("/profile"))) {
      console.log("Fetching user profile & roadmap");
      const getCommand = new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ lessonDate: "profile" })
      });
      const getResult = await ddbClient.send(getCommand);
      
      if (getResult.Item) {
        const profile = unmarshall(getResult.Item);
        return apiResponse(200, profile);
      }
      return apiResponse(200, { onboarded: false });
    }

    // Route: POST /lesson/profile (or /profile)
    if (httpMethod === "POST" && (rawPath.endsWith("/lesson/profile") || rawPath.endsWith("/profile"))) {
      console.log("Saving user profile & generating roadmap");
      if (!event.body) {
        return apiResponse(400, { error: "Missing body parameters" });
      }

      const body = JSON.parse(event.body);
      const { topic, difficulty, goal, studyTime } = body;

      if (!topic || !difficulty || !goal || !studyTime) {
        return apiResponse(400, { error: "Missing required profile fields: topic, difficulty, goal, studyTime" });
      }

      // Check if there is a predefined roadmap
      const templateKey = getTemplateKey(topic);
      let modules: string[] = [];

      if (templateKey && PREDEFINED_ROADMAPS[templateKey]) {
        console.log(`[DEBUG] Found predefined template for "${topic}": key "${templateKey}"`);
        modules = PREDEFINED_ROADMAPS[templateKey].modules;
      } else {
        console.log(`[DEBUG] No predefined template for "${topic}". Invoking Groq for custom roadmap.`);
        // Generate roadmap modules using Groq
        const roadmapModules = await generateRoadmap(topic, difficulty, goal, studyTime);
        modules = roadmapModules.map((m: any) => m.title);
      }
      
      const roadmap: RoadmapModule[] = modules.map((title: string, idx: number) => ({
        title,
        status: (idx === 0 ? "Current" : "Locked") as "Completed" | "Current" | "Locked"
      }));

      const profile: Profile = {
        lessonDate: "profile",
        topic,
        difficulty,
        goal,
        studyTime,
        roadmap,
        onboarded: true,
        updatedAt: new Date().toISOString()
      };

      const putCommand = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: marshall(profile)
      });
      await ddbClient.send(putCommand);
      console.log("Saved profile successfully");

      // Generate and save the first lesson of the roadmap for today (overwriting any previous today's lesson)
      const todayStr = new Date().toISOString().split("T")[0];
      const firstModuleTitle = roadmap[0].title;
      console.log(`[DEBUG] Generating first lesson on-the-fly for new profile. Topic: "${topic}", Module: "${firstModuleTitle}"`);
      
      try {
        const firstLesson = await generateLessonForModule(todayStr, profile, firstModuleTitle, 0);
        const putLessonCommand = new PutItemCommand({
          TableName: TABLE_NAME,
          Item: marshall(firstLesson)
        });
        await ddbClient.send(putLessonCommand);
        console.log("Generated and saved first lesson for today successfully");
      } catch (lessonGenError) {
        console.error("Failed to pre-generate first lesson for today during profile save:", lessonGenError);
      }

      return apiResponse(200, profile);
    }

    // Route: GET /lesson/today (or /today)
    if (httpMethod === "GET" && (rawPath.endsWith("/lesson/today") || rawPath.endsWith("/today"))) {
      // Determine date requested. Client can send date query param like ?date=YYYY-MM-DD
      const dateParam = event.queryStringParameters?.date;
      const targetDate = dateParam || new Date().toISOString().split("T")[0];
      
      console.log(`Fetching lesson for date: ${targetDate}`);

      const getCommand = new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ lessonDate: targetDate })
      });
      
      const getResult = await ddbClient.send(getCommand);
      
      if (getResult.Item) {
        const lesson = unmarshall(getResult.Item) as Lesson;
        return apiResponse(200, lesson);
      }

      // Fallback: If not generated yet, generate on-the-fly to ensure flawless UI experience
      console.log(`Lesson for ${targetDate} not found. Generating on-the-fly.`);
      
      // Read user profile
      const getProfileCommand = new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ lessonDate: "profile" })
      });
      const profileResult = await ddbClient.send(getProfileCommand);

      let lesson: Lesson;
      if (profileResult.Item) {
        const profile = unmarshall(profileResult.Item);
        let currentModuleIndex = profile.roadmap.findIndex((m: any) => m.status === "Current");
        if (currentModuleIndex === -1) {
          currentModuleIndex = profile.roadmap.findIndex((m: any) => m.status !== "Completed");
        }
        if (currentModuleIndex === -1) {
          currentModuleIndex = profile.roadmap.length - 1;
        }
        const currentModule = profile.roadmap[currentModuleIndex];
        
        console.log(`Generating personalized lesson on-the-fly for module: ${currentModule.title}`);
        lesson = await generateLessonForModule(targetDate, profile, currentModule.title, currentModuleIndex);
      } else {
        // Fallback default lesson
        console.log("Profile not found. Generating default lesson on-the-fly.");
        lesson = await generateLesson(targetDate);
      }
      
      const putCommand = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: marshall(lesson)
      });
      await ddbClient.send(putCommand);
      console.log(`Stored on-the-fly generated lesson for ${targetDate}`);

      // Try sending email if configured (on-the-fly fallback)
      const sender = process.env.SES_EMAIL_SENDER;
      const recipient = process.env.SES_EMAIL_RECIPIENT;
      if (sender && recipient) {
        await sendLessonEmail(lesson, sender, recipient);
      }

      return apiResponse(200, lesson);
    }

    // Route: POST /lesson/complete
    if (httpMethod === "POST" && (rawPath.endsWith("/lesson/complete") || rawPath.endsWith("/complete"))) {
      if (!event.body) {
        return apiResponse(400, { error: "Missing body parameters" });
      }

      const body = JSON.parse(event.body);
      const { lessonDate } = body;

      if (!lessonDate) {
        return apiResponse(400, { error: "Missing lessonDate in body" });
      }

      console.log(`Marking lesson for date ${lessonDate} as completed.`);

      const updateCommand = new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ lessonDate }),
        UpdateExpression: "SET completed = :c",
        ExpressionAttributeValues: marshall({ ":c": true }),
        ReturnValues: "ALL_NEW"
      });

      const updateResult = await ddbClient.send(updateCommand);
      const updatedLesson = unmarshall(updateResult.Attributes || {}) as Lesson;

      // Update Roadmap progress in profile
      if (updatedLesson.moduleIndex !== undefined) {
        try {
          const getProfileCommand = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ lessonDate: "profile" })
          });
          const profileResult = await ddbClient.send(getProfileCommand);
          
          if (profileResult.Item) {
            const profile = unmarshall(profileResult.Item);
            const index = updatedLesson.moduleIndex;
            
            if (profile.roadmap && profile.roadmap[index]) {
              profile.roadmap[index].status = "Completed";
              
              // Automatically unlock the next module
              if (profile.roadmap[index + 1]) {
                profile.roadmap[index + 1].status = "Current";
              }
              
              // Save updated profile
              const putCommand = new PutItemCommand({
                TableName: TABLE_NAME,
                Item: marshall(profile)
              });
              await ddbClient.send(putCommand);
              console.log(`Successfully completed module index ${index} and updated profile`);
            }
          }
        } catch (profileError) {
          console.error("Failed to update profile roadmap progress:", profileError);
        }
      }

      return apiResponse(200, { success: true, lesson: updatedLesson });
    }

    // Route: GET /lesson/history (or /history)
    if (httpMethod === "GET" && (rawPath.endsWith("/lesson/history") || rawPath.endsWith("/history"))) {
      console.log("Fetching lesson history.");
      
      const scanCommand = new ScanCommand({
        TableName: TABLE_NAME
      });

      const scanResult = await ddbClient.send(scanCommand);
      let lessons = (scanResult.Items || []).map(item => unmarshall(item) as Lesson);
      
      // Filter out the profile record
      lessons = lessons.filter(l => l.lessonDate !== "profile");

      // Sort lessons by date descending (latest first)
      lessons.sort((a, b) => b.lessonDate.localeCompare(a.lessonDate));

      return apiResponse(200, { lessons });
    }

    // Route Not Found
    return apiResponse(404, { error: `Route not found: ${httpMethod} ${rawPath}` });

  } catch (error: any) {
    console.error("API handler failed:", error);
    const message = error?.message === "Failed to generate content. Please try again later."
      ? error.message
      : "Internal Server Error";
    return apiResponse(500, { error: message });
  }
};
