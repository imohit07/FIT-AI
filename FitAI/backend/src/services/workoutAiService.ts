import axios from "axios";
import { env } from "../config/env";

// Groq API configuration (free, fast inference)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

function extractFirstJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("AI did not return JSON");
  return JSON.parse(text.slice(start, end + 1));
}

async function callGroq(prompt: string) {
  if (!env.groqApiKey) {
    throw new Error("Groq API key not configured. Please add GROQ_API_KEY to .env file.");
  }
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
  return res.data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(prompt: string) {
  if (!env.geminiApiKey) throw new Error("Gemini API key not configured");
  const res = await axios.post(
    `${GEMINI_API_URL}?key=${env.geminiApiKey}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { "Content-Type": "application/json" }, timeout: 10000 }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callAI(prompt: string) {
  if (env.groqApiKey) {
    return callGroq(prompt);
  }
  return callGemini(prompt);
}

export type ParsedExercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscleGroup: string;
  caloriesBurned: number;
  duration?: number;
};

export async function parseWorkoutFromText(params: {
  text: string;
}): Promise<{ items: ParsedExercise[]; confidence: "low" | "medium" | "high"; notes?: string }> {
  const prompt = `
You are a workout logger and calorie burn estimator for a fitness app.
Convert the user message into 1..N exercises with reasonable estimates.

Rules:
- Return ONLY valid JSON (no markdown, no code blocks).
- For cardio exercises (treadmill, running, cycling, walking), use sets=1, reps=1, and estimate calories based on duration.
- If sets/reps/weight aren't specified, assume sensible defaults and set confidence="low".
- caloriesBurned should be a REALISTIC estimate (e.g., 200-400 for 30 min cardio, 150-250 for 30 min moderate exercise).
- muscleGroup should be one of: chest, back, legs, shoulders, arms, core, full_body, cardio, other.
- duration should be in minutes if provided.

User message:
"""${params.text}"""

Return JSON exactly (provide REAL values, not zero):
{"confidence":"low","notes":"note","items":[{"name":"exercise name","sets":3,"reps":10,"weight":0,"muscleGroup":"chest","caloriesBurned":200,"duration":30}]}
`;

  const raw = await callAI(prompt);
  const parsed = extractFirstJsonObject(raw) as any;
  const items = Array.isArray(parsed?.items) ? parsed.items : [];

  const normalizeCalories = (exercise: ParsedExercise): number => {
    let cal = exercise.caloriesBurned;

    // Establish expected burn range
    const duration = exercise.duration ?? 0;
    const setsRepsEnergy = exercise.sets * exercise.reps * (exercise.weight || 1) * 0.06; // rough per-set baseline
    const durationEnergy = duration > 0 ? duration * 9 : 0;

    const expected = Math.max(50, durationEnergy, setsRepsEnergy, 60);

    // If calories are wildly high (e.g., > 5x expected), reduce by 10x as likely unit mismatch or overestimate.
    if (cal > expected * 5 && cal > 1000) {
      cal = Math.round(cal / 10);
    }

    // Clamp to a realistic high bound per exercise to avoid outliers
    const highClamp = Math.max(expected * 2.5, 1200);
    if (cal > highClamp) {
      cal = Math.round(highClamp);
    }

    return Math.max(1, cal);
  };

  const normalized: ParsedExercise[] = items
    .map((it: any) => {
      const raw = {
        name: String(it?.name || "").trim(),
        sets: Number(it?.sets ?? 0),
        reps: Number(it?.reps ?? 0),
        weight: Number(it?.weight ?? 0),
        muscleGroup: String(it?.muscleGroup || "other"),
        caloriesBurned: Number(it?.caloriesBurned ?? 0),
        duration: it?.duration != null ? Number(it.duration) : undefined
      };
      return { ...raw, caloriesBurned: normalizeCalories(raw) };
    })
    .filter((it: any) => it.name.length > 0 && Number.isFinite(it.caloriesBurned));

  return {
    confidence: parsed?.confidence === "high" || parsed?.confidence === "medium" ? parsed.confidence : "low",
    notes: typeof parsed?.notes === "string" ? parsed.notes : undefined,
    items: normalized
  };
}
