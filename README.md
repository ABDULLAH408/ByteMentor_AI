# ByteMentor AI — Autonomous Serverless AI Coach

ByteMentor AI is an autonomous, always-on AI learning coach designed for the AWS Builder Center "Build an Always-On Agent Weekend Challenge." 

Instead of waiting for you to ask "What should I learn today?", the application automatically pre-generates a personalized software engineering micro-lesson every morning at 7:00 AM using AWS Lambda and Amazon Bedrock Nova Lite, storing it in DynamoDB so it is ready the moment you open the app.

---

## 🏗️ Architecture

```
EventBridge Scheduler (Daily 7 AM)
       ↓
  AWS Lambda (Node.js) ──[Queries/Invokes]──> Amazon Bedrock Nova Lite
       │
       ├─[Stores Lesson JSON]─> Amazon DynamoDB (Single Table: ByteMentorLessons)
       ├─[Sends Email]────────> Amazon SES (Optional)
       └─[API Function URL]───> React Vite Frontend (Amplify Hosted)
```

1. **Automation**: Amazon EventBridge Scheduler triggers our Lambda function daily at 7:00 AM UTC.
2. **AI Synthesis**: The Lambda queries Bedrock Nova Lite (`us.amazon.nova-lite-v1:0`) using the Converse API to synthesize a strictly structured JSON micro-lesson.
3. **Persistance**: The lesson is written into Amazon DynamoDB with the partition key `lessonDate` (e.g. `2026-07-17`).
4. **Notification**: If configured, AWS SES emails the lesson summary to the user.
5. **Consumption**: A high-end dark-themed React + Vite website displays today's lesson, tracks code syntax, hosts interactive quizzes, and allows marking lessons as completed.

---

## 📂 Project Structure

```
├── backend/
│   ├── index.ts          # Single Lambda handler for both cron generation & HTTP API
│   ├── test-local.ts     # Simulator script to execute function locally
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json      # Backend SDK client dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArchitectureDiagram.tsx  # Interactive SVG AWS architecture visual
│   │   │   ├── LandingPage.tsx          # Modern Linear-inspired SaaS landing page
│   │   │   ├── Dashboard.tsx            # Interactive learning workspace
│   │   │   └── HistoryPage.tsx          # Historical list of lessons with details
│   │   ├── App.tsx       # State coordinator and client routing
│   │   └── index.css     # Global styles and design system base
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json      # React, Tailwind, Framer Motion dependencies
├── infra/
│   ├── template.yaml     # CloudFormation / SAM infrastructure template
│   └── deploy.ps1        # Compile and deploy automation PowerShell script
└── README.md
```

---

## 🛠️ Prerequisites

- **Node.js** (v18 or higher) and **npm**
- An **AWS Account** with access key credentials set up locally (`aws configure`)
- **AWS SAM CLI** (recommended for infrastructure deployment)
- **Amazon Bedrock Nova Lite** access enabled in your AWS console (typically in `us-east-1` or `us-west-2` regions)

---

## 🚀 Quick Start (Local Mock Mode)

You can run the entire frontend application in mock/preview mode **without deploying to AWS**.

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser. The app will detect the absence of an API URL and load rich mock data automatically.

---

## ⚡ Deployment Guide (AWS Serverless Stack)

### Option A: Automated Deploy via AWS SAM CLI (Recommended)

1. Open PowerShell and navigate to the `infra/` folder:
   ```powershell
   cd infra
   ```
2. Execute the deploy script:
   ```powershell
   ./deploy.ps1
   ```
3. Follow the guided prompt. The script will:
   - Compile the TypeScript Lambda code into single-file JavaScript.
   - Run `sam deploy --guided` to launch the CloudFormation stack.
4. Copy the output **ByteMentorApiUrl** from the console when the deployment finishes.

---

### Option B: Manual Console Setup (No CLI Required)

If you prefer to set up resources manually using the AWS Console:

#### 1. Create the DynamoDB Table
- Go to the **DynamoDB Console** -> click **Create Table**.
- Table Name: `ByteMentorLessons`
- Partition Key: `lessonDate` (Type: String)
- Keep billing as **Default (Pay-Per-Request)**.

#### 2. Create the Lambda Function
- Go to the **Lambda Console** -> click **Create Function**.
- Function Name: `ByteMentorFunction`
- Runtime: `Node.js 18.x` or `Node.js 20.x`.
- Under Execution Role, create a role with basic Lambda permissions.
- In **Configuration -> Function URL**, click **Create Function URL**:
  - Auth Type: `NONE` (Public)
  - Configure CORS: Set `Allow Origin` to `*` (or your frontend domain) and allow methods `GET, POST, OPTIONS`.
- In **Configuration -> Environment Variables**, add:
  - `TABLE_NAME` = `ByteMentorLessons`
  - `BEDROCK_REGION` = `us-east-1` (or your chosen region)
- In **Configuration -> Permissions**, click the role link to go to IAM, and attach policies to allow:
  - `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:Scan` on the `ByteMentorLessons` table.
  - `bedrock:InvokeModel` on `arn:aws:bedrock:*::foundation-model/us.amazon.nova-lite-v1:0`.
  - (Optional) `ses:SendEmail` on `*` if using SES.

#### 3. Upload the Code
- Run `npm run build` in the `backend/` folder.
- Zip the contents of the `backend/dist` directory (not the directory itself, zip the `index.js` file inside it).
- Upload the `.zip` file in the Lambda Code tab.

#### 4. Configure EventBridge Scheduler
- Go to **Amazon EventBridge** -> **Scheduler -> Schedules**.
- Click **Create Schedule**.
- Schedule expression: `cron(0 7 * * ? *)` (Daily at 7:00 AM UTC).
- Target: **AWS Lambda** -> Select your `ByteMentorFunction`.
- Payload Input: Constant JSON `{"scheduled": true}`.
- Create or select an IAM role that allows Scheduler to execute `lambda:InvokeFunction`.

---

## 🌐 Frontend Configuration & Hosting

### 1. Connect React to your AWS API
Create a `.env` file inside the `frontend/` directory:
```env
VITE_API_URL=https://<your-lambda-function-url-id>.lambda-url.us-east-1.on.aws
```
*Note: Make sure there is no trailing slash.*

### 2. Run Local Development with Live API
```bash
cd frontend
npm run dev
```

### 3. Deploy Frontend via AWS Amplify
1. Push your code repository to GitHub, GitLab, or Bitbucket.
2. Open the **AWS Amplify Console** -> Click **Create New App**.
3. Choose your Git repository provider and authorize.
4. Select the repository and the branch (e.g. `main`).
5. Amplify will auto-detect the Vite build configurations. Make sure to set the **Environment Variables** in the Amplify console:
   - Key: `VITE_API_URL`
   - Value: `https://<your-lambda-url-id>.lambda-url.us-east-1.on.aws`
6. Click **Save and Deploy**. Your website will be live in a few minutes!

---

## 📬 Optional: Amazon SES Email Configuration
To receive today's lesson directly in your inbox:
1. Open the **Amazon SES Console** -> Verify the email address you want to use.
2. In the Lambda Environment Variables, add:
   - `SES_EMAIL_SENDER` = `your-verified-email@example.com`
   - `SES_EMAIL_RECIPIENT` = `your-verified-email@example.com`
3. The cron schedule (or initial load fallback) will now automatically send a formatted summary of today's lesson. If these variables are left empty, email sending is skipped, and the app functions fully without email.

---

## 🚀 Bedrock Output Format Reference
The Bedrock integration requests and parses responses conforming strictly to this format:
```json
{
  "topic": "Understanding CSS Grid",
  "difficulty": "Intermediate",
  "estimatedTime": "10 mins",
  "learningObjective": "Build flexible, responsive layouts without media queries.",
  "explanation": "Detailed explanation in Markdown...",
  "realWorldExample": "Dashboard widgets rearranging dynamically...",
  "codeExample": ".container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }",
  "quiz": [
    {
      "question": "What is the result of using auto-fit?",
      "options": ["...", "..."],
      "answerIndex": 0,
      "explanation": "..."
    }
  ],
  "exercise": "Create a layout with 3 rows...",
  "productivityTip": "Use devtools grid inspector...",
  "motivationalQuote": "..."
}
```
