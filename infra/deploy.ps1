# ByteMentor AI - AWS Serverless Deployment Script
# This PowerShell script packages and deploys the backend Lambda stack using AWS SAM CLI.

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   ByteMentor AI - AWS Serverless Deployer   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Compile and Bundle Lambda Function
Write-Host "`n[1/3] Compiling and bundling Lambda backend..." -ForegroundColor Yellow
Push-Location ../backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Backend build failed. Exiting." -ForegroundColor Red
    Pop-Location
    Exit 1
}
Pop-Location
Write-Host "Backend compiled successfully!" -ForegroundColor Green

# 2. Check for AWS SAM CLI
Write-Host "`n[2/3] Checking requirements..." -ForegroundColor Yellow
$samInstalled = Get-Command sam -ErrorAction SilentlyContinue
if (-not $samInstalled) {
    Write-Host "AWS SAM CLI not found." -ForegroundColor Yellow
    Write-Host "Please install the AWS SAM CLI (https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)" -ForegroundColor DarkYellow
    Write-Host "Alternatively, you can manually zip the 'backend/dist' directory and deploy via the AWS Lambda Web Console." -ForegroundColor Gray
    Exit 1
}
Write-Host "AWS SAM CLI detected." -ForegroundColor Green

# 3. Deploy via SAM CLI
Write-Host "`n[3/3] Deploying stack via AWS SAM CLI..." -ForegroundColor Yellow
Write-Host "This will create the DynamoDB table, Lambda Function (with public URL), and EventBridge Scheduler rule." -ForegroundColor Gray
Write-Host "Please follow the interactive prompts for S3 bucket creation and region selections." -ForegroundColor Gray
Write-Host "Press enter when ready to launch 'sam deploy --guided'..." -ForegroundColor DarkGray
Read-Host

sam deploy --guided

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=============================================" -ForegroundColor Green
    Write-Host "   Deployment Initiated Successfully!        " -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "Make sure to copy the 'ByteMentorApiUrl' from the outputs."
    Write-Host "Paste it in your frontend '.env' file: VITE_API_URL=<YourApiUrl>"
} else {
    Write-Host "`nDeployment failed. Please check the logs above." -ForegroundColor Red
}
