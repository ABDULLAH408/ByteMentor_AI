#!/bin/bash

# ByteMentor AI - AWS Serverless Deployment Script (Bash)
# This script packages and deploys the backend Lambda stack using AWS SAM CLI.

set -e

# Make sure we run from the script directory
cd "$(dirname "$0")"

echo -e "\033[0;36m=============================================\033[0m"
echo -e "\033[0;36m   ByteMentor AI - AWS Serverless Deployer   \033[0m"
echo -e "\033[0;36m=============================================\033[0m"

# 1. Compile and Bundle Lambda Function
echo -e "\n\033[0;33m[1/3] Compiling and bundling Lambda backend...\033[0m"
cd ../backend
npm run build
cd ../infra

echo -e "\033[0;32mBackend compiled successfully!\033[0m"

# 2. Check for AWS SAM CLI
echo -e "\n\033[0;33m[2/3] Checking requirements...\033[0m"
if ! command -v sam &> /dev/null
then
    echo -e "\033[0;31mError: AWS SAM CLI not found.\033[0m"
    echo -e "\033[0;33mPlease install the AWS SAM CLI (https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)\033[0m"
    exit 1
fi
echo -e "\033[0;32mAWS SAM CLI detected.\033[0m"

# 3. Deploy via SAM CLI
echo -e "\n\033[0;33m[3/3] Deploying stack via AWS SAM CLI...\033[0m"
echo -e "\033[0;90mThis will create the DynamoDB table, Lambda Function (with public URL), and EventBridge Scheduler rule.\033[0m"
read -p "Press Enter when ready to launch 'sam deploy --guided'..."

sam deploy --guided
