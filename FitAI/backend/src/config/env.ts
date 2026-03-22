import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    databaseUrl: process.env.FIREBASE_DATABASE_URL || "",
  },
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  mlServiceUrl: process.env.ML_SERVICE_URL || "https://fit-ai-ml-service.onrender.com",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development"
};
