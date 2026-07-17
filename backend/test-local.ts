// Set up default environment variables for local testing before imports execute
process.env.AWS_REGION = process.env.AWS_REGION || "us-east-1";
process.env.TABLE_NAME = process.env.TABLE_NAME || "ByteMentorLessons";
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || "";

import { handler } from "./index";

// A local runner to simulate the Lambda function
async function runTest() {
  console.log("=== Testing EventBridge Scheduled Trigger ===");
  
  // 1. Simulate Scheduled Event
  const scheduledEvent = { scheduled: true };
  try {
    console.log("Invoking handler with scheduled event...");
    const result = await handler(scheduledEvent);
    console.log("Scheduled Event Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Scheduled Event Error:", error);
  }

  console.log("\n=== Testing API GET /lesson/today Trigger ===");
  // 2. Simulate GET /lesson/today HTTP event
  const httpGetEvent = {
    httpMethod: "GET",
    path: "/lesson/today",
    queryStringParameters: {
      date: new Date().toISOString().split("T")[0] // today's date
    }
  };
  try {
    console.log("Invoking handler with HTTP GET event...");
    const result = await handler(httpGetEvent);
    console.log("HTTP GET Event Result Status:", result.statusCode);
    if (result.body) {
      const parsedBody = JSON.parse(result.body);
      console.log("Topic generated:", parsedBody.topic);
      console.log("Quiz count:", parsedBody.quiz?.length);
    }
  } catch (error) {
    console.error("HTTP GET Event Error:", error);
  }
}

// Check if credentials are set, warn if not
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn("WARNING: AWS credentials are not set in the environment.");
  console.warn("To run this test successfully, please make sure you have run 'aws configure' or set AWS environment variables.");
}

runTest();
