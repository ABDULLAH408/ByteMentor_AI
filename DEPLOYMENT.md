# ByteMentor AI - Production Deployment Guide

This guide details the step-by-step instructions for deploying the **ByteMentor AI** serverless backend and React frontend to AWS.

---

## 1. Required AWS Services
The application runs entirely on standard AWS serverless services, fitting fully within the **AWS Free Tier**:
* **AWS Lambda**: Hosts the backend logic and Function URL endpoint.
* **Amazon DynamoDB**: Stores the student profile roadmaps and daily lessons.
* **Amazon Bedrock (Nova Lite)**: Generates domain-specific daily learning lessons.
* **Amazon EventBridge Scheduler**: Triggers the daily lesson generator at a set cron time.
* **AWS Systems Manager (SSM) / IAM**: Configures access rules and stack security parameters.
* **AWS Amplify (Hosting)**: Builds and hosts the React frontend directly from GitHub.
* **Amazon SES (Optional)**: Automatically emails the daily generated lesson.

---

## 2. Required IAM Permissions
To deploy the backend stack via AWS SAM, your IAM User/Role must have permissions to manage the following resources:
* **CloudFormation**: Create, update, and delete the stack.
* **IAM**: Create the EventBridge execution role (`SchedulerToLambdaRole`).
* **Lambda**: Create, update, and manage execution code and Function URLs.
* **DynamoDB**: Create and configure tables.
* **Scheduler (EventBridge)**: Create schedules.
* **S3**: Store SAM packaging artifacts.

---

## 3. How to Deploy the Backend
Ensure you have the [AWS CLI](https://aws.amazon.com/cli/) and [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed.

### Step 1: Backend TypeScript Compilation
Navigate to the `backend/` directory and compile the bundle:
```bash
cd backend
npm install
npm run build
```

### Step 2: SAM Stack Deployment
You can use the deployment helper scripts in `infra/` or run the commands manually:
* **Windows (PowerShell)**:
  ```powershell
  cd infra
  ./deploy.ps1
  ```
* **macOS / Linux (Bash)**:
  ```bash
  cd infra
  chmod +x deploy.sh
  ./deploy.sh
  ```
* **Manual CLI Command**:
  ```bash
  cd infra
  sam deploy --guided
  ```

Follow the interactive prompts:
1. **Stack Name**: `bytementor-ai-backend`
2. **AWS Region**: `us-east-1` (recommended region supporting Nova Lite model)
3. **Parameter BedrockRegion**: `us-east-1`
4. **Parameter SESEmailSender**: Enter a verified SES email (leave empty to disable email)
5. **Parameter SESEmailRecipient**: Enter your email (leave empty to disable email)
6. Accept defaults for confirmation and IAM role creation.
7. Allow SAM to deploy the resources.

Save the output URL: **`ByteMentorApiUrl`** (e.g. `https://xxxxxxxxxxxxxx.lambda-url.us-east-1.on.aws/`).

---

## 4. How to Configure Bedrock
1. Log in to the [AWS Console](https://console.aws.amazon.com/).
2. Navigate to **Amazon Bedrock**.
3. Under **Model access** in the left sidebar, click **Manage model access**.
4. Request access to **Amazon Nova Lite** (under the Amazon models section).
5. Ensure access is **Granted** before launching the app.

---

## 5. How to Deploy the Frontend
We use AWS Amplify to deploy the frontend. This matches the Always-On challenge MVP guidelines.

### Step 1: Commit and Push to GitHub
If you haven't already:
```bash
git add .
git commit -m "Configure production deployment settings"
git push origin main
```

### Step 2: Configure Amplify Console
1. Navigate to the **AWS Amplify Console**.
2. Click **Create new app** / **Host web app**.
3. Select **GitHub** and authorize AWS Amplify.
4. Choose the `ByteMentor_AI` repository and the `main` branch.
5. In **Build Settings**, Amplify will detect the monorepo structure. It will automatically use the `amplify.yml` configuration present in your root directory:
   * It builds from `frontend/` subdirectory and serves from `frontend/dist`.
6. Under **Advanced Settings** / **Environment variables**, add the following variable:
   * **`VITE_API_URL`**: Set this to the `ByteMentorApiUrl` output you copied from the SAM backend deployment.
7. Click **Save and deploy**. Amplify will build and host your React app at a public HTTPS URL (e.g. `https://main.xxxxxxx.amplifyapp.com`).

---

## 6. Required Environment Variables
Check the `.env.example` file in the root workspace directory:
```env
TABLE_NAME=ByteMentorLessons
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=us.amazon.nova-lite-v1:0
SES_EMAIL_SENDER=
SES_EMAIL_RECIPIENT=
VITE_API_URL=https://your-lambda-function-url.lambda-url.us-east-1.on.aws/
```

---

## 7. Common Deployment Issues & Troubleshooting
* **Error: `ModelNotAssociatedException`**:
  * **Cause**: Model access to Amazon Nova Lite is not enabled in Bedrock.
  * **Fix**: Navigate to Bedrock Console -> Model Access -> Request access to Nova Lite.
* **CORS Blocked Errors**:
  * **Cause**: Backend function URL or API Gateway is not configured to accept requests from the frontend domain.
  * **Fix**: Ensure CORS settings in `template.yaml` (lines 55-64) permit `*` or your Amplify domain.
* **Email Not Sent**:
  * **Cause**: AWS SES is in Sandbox mode and either the sender or recipient email address is not verified.
  * **Fix**: Verify both email addresses in the SES Console under Identity Management.

---

## 8. Verification Checklist
- [ ] Backend bundles successfully via `esbuild`.
- [ ] Frontend builds successfully via `vite build`.
- [ ] Bedrock Nova Lite has granted status in target region.
- [ ] SAM backend stack deployed successfully.
- [ ] Amplify app status is green and environment variable `VITE_API_URL` is set.
