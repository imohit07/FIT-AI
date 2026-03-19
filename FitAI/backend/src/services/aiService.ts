import axios from "axios";
import { env } from "../config/env";
import { IUser } from "../models/User";
import { IFoodLog } from "../models/FoodLog";
import { IWorkoutLog } from "../models/WorkoutLog";

// Groq API configuration (free, fast inference)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

async function callGroq(prompt: string) {
  if (!env.groqApiKey) {
    throw new Error("Groq API key not configured. Please add GROQ_API_KEY to .env file.");
  }

  try {
    const res = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.groqApiKey}`
        },
        timeout: 15000
      }
    );

    const text = res.data.choices?.[0]?.message?.content ?? "";
    return text;
  } catch (err: any) {
    if (err.response?.status === 401) {
      throw new Error("Invalid Groq API key. Please check your GROQ_API_KEY in .env file.");
    }
    if (err.response?.status === 429) {
      throw new Error("Groq API rate limit exceeded. Please try again later.");
    }
    throw err;
  }
}

// Keep Gemini as fallback
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt: string) {
  if (!env.geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const res = await axios.post(
      `${GEMINI_API_URL}?key=${env.geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000
      }
    );

    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return text;
  } catch (err: any) {
    if (err.response?.status === 429) {
      throw new Error("AI service quota exceeded. Please try again later or check your Google AI plan.");
    }
    if (err.response?.status === 404) {
      throw new Error("AI model not found. Please contact support.");
    }
    throw err;
  }
}

// Use Groq by default, fallback to Gemini
async function callAI(prompt: string) {
  if (env.groqApiKey) {
    return callGroq(prompt);
  }
  return callGemini(prompt);
}

export function extractFirstJsonObject(text: string): unknown {
  // Clean up the text - remove markdown code blocks if present
  let cleaned = text.trim();
  
  // Remove markdown code blocks (```json or ```)
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf('\n');
    const lastTripleBacktick = cleaned.lastIndexOf("```");
    if (firstNewline !== -1 && lastTripleBacktick !== -1 && lastTripleBacktick > firstNewline) {
      cleaned = cleaned.slice(firstNewline + 1, lastTripleBacktick).trim();
    }
  }
  
  // Find the first { and last } to extract JSON
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI did not return valid JSON");
  }
  
  // Extract JSON
  const jsonText = cleaned.slice(start, end + 1);
  return JSON.parse(jsonText);
}

export async function getFoodRecommendation(params: {
  user: IUser;
  goal: string;
  todayFood?: IFoodLog | null;
}): Promise<string> {
  const { user, goal, todayFood } = params;

  const totalCalories = todayFood?.totalCalories ?? 0;
  const protein = todayFood?.totalProtein ?? 0;

  const prompt = `Response must be ONLY valid JSON. No text before or after. No markdown. No code blocks.

You are a fitness nutrition coach.
User profile:
- Goal: ${goal}
- Age: ${user.age ?? "unknown"}
- Height: ${user.height ?? "unknown"} cm
- Weight: ${user.weight ?? "unknown"} kg
- Activity level: ${user.activityLevel ?? "unknown"}
- Target calories: ${user.targetCalories ?? "unknown"}

Today's intake so far:
- Calories: ${totalCalories}
- Protein: ${protein} g

Based on this, suggest a one-day meal plan (breakfast, lunch, dinner, snacks) with approximate calories and protein per meal to align with the goal. Respond ONLY with this exact JSON structure (no other text):
{"meals":[{"name":"meal name","mealType":"breakfast","description":"brief description","calories":0,"protein":0}],"notes":"optional note"}`;

  return callAI(prompt);
}

export type ParsedFoodItem = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
};

export async function parseFoodFromText(params: {
  text: string;
  defaultMealType: ParsedFoodItem["mealType"];
}): Promise<{ items: ParsedFoodItem[]; confidence: "low" | "medium" | "high"; notes?: string }> {
  const prompt = `Response must be ONLY valid JSON. No text before or after. No markdown. No code blocks.

You are a nutritional expert. Estimate the calories, protein, carbs, and fats for the food mentioned. If the food quantity is not specified, assume a standard serving size. Provide REAL estimated values, NOT zero.

Convert "${params.text}" to JSON with this exact structure:
{"confidence":"low|medium|high","notes":"optional note","items":[{"name":"food name","calories":200,"protein":10,"carbs":20,"fats":8,"mealType":"${params.defaultMealType}"}]}`;

  const raw = await callAI(prompt);
  const parsed = extractFirstJsonObject(raw) as any;

  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  const normalized: ParsedFoodItem[] = items
    .map((it: any) => ({
      name: String(it?.name || "").trim(),
      calories: Number(it?.calories ?? 0),
      protein: Number(it?.protein ?? 0),
      carbs: Number(it?.carbs ?? 0),
      fats: Number(it?.fats ?? 0),
      mealType: (String(it?.mealType || params.defaultMealType) as ParsedFoodItem["mealType"]) || params.defaultMealType
    }))
    .filter((it: ParsedFoodItem) => it.name.length > 0 && Number.isFinite(it.calories));

  return {
    confidence: parsed?.confidence === "high" || parsed?.confidence === "medium" ? parsed.confidence : "low",
    notes: typeof parsed?.notes === "string" ? parsed.notes : undefined,
    items: normalized
  };
}

export async function getWorkoutRecommendation(params: {
  user: IUser;
  goal: string;
  recentWorkouts: IWorkoutLog[];
}): Promise<string> {
  const { user, goal, recentWorkouts } = params;

  // Helper to convert any date-like object to ISO string
  const toDateString = (dateVal: any): string => {
    if (!dateVal) return "";
    // If it's a string already
    if (typeof dateVal === 'string') return dateVal.substring(0, 10);
    // If it has a toDate method (Firestore Timestamp)
    if (typeof dateVal.toDate === 'function') return dateVal.toDate().toISOString().substring(0, 10);
    // If it's a Date object
    if (dateVal.toISOString) return dateVal.toISOString().substring(0, 10);
    // Fallback
    return String(dateVal).substring(0, 10);
  };

  const workoutSummary = recentWorkouts
    .slice(-7)
    .map((w) => ({
      date: toDateString(w.date),
      exercises: w.exercises.map((e) => e.muscleGroup)
    }))
    .map((w) => `${w.date}: ${w.exercises.join(", ")}`)
    .join("\n");

  const prompt = `Response must be ONLY valid JSON. No text before or after. No markdown. No code blocks.

You are a strength and conditioning coach.
User profile:
- Goal: ${goal}
- Age: ${user.age ?? "unknown"}
- Height: ${user.height ?? "unknown"} cm
- Weight: ${user.weight ?? "unknown"} kg
- Activity level: ${user.activityLevel ?? "unknown"}

Recent workouts (last 7 sessions):
${workoutSummary || "No workouts logged yet."}

Design a 4-7 day weekly workout split considering recovery and muscle balance. Respond ONLY with this exact JSON structure (no other text):
{"days":[{"day":"Day 1","focus":"chest","exercises":[{"name":"bench press","muscleGroup":"chest","sets":3,"reps":10}]}],"notes":"optional note"}`;

  return callAI(prompt);
}

export async function getChatAdvice(promptText: string): Promise<string> {
  const prompt = `
You are a friendly fitness assistant. Answer the following question with practical fitness and nutrition advice, in less than 200 words.
Question: ${promptText}
`;
  return callAI(prompt);
}
