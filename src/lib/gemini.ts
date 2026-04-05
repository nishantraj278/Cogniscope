import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined, will use fallback questions");
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Debug logging
console.log(
  "🔑 Gemini API Key status:",
  GEMINI_API_KEY ? "✅ LOADED" : "❌ MISSING",
);
console.log("🔑 First 10 chars:", GEMINI_API_KEY?.substring(0, 10) || "N/A");

// Initialize Gemini AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL?.trim(),
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b",
].filter((model): model is string => Boolean(model));

console.log("🤖 Gemini AI initialized:", genAI ? "✅ YES" : "❌ NO");
console.log("🤖 Gemini model candidates:", MODEL_CANDIDATES.join(", "));

async function generateContentWithModelFallback(
  prompt: string,
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini client not initialized");
  }

  let lastError: unknown;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      console.log(`Calling Gemini with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      console.warn(
        `Gemini model failed (${modelName}):`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  throw lastError ?? new Error("All Gemini model candidates failed");
}

// Types for Gemini responses
export interface GeneratedQuestion {
  questionType: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: string;
  explanation?: string;
}

export interface TestEvaluation {
  overallScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  cognitiveAge?: number;
  categoryScores: {
    memoryScore: number;
    attentionScore: number;
    executiveFunctionScore: number;
    languageScore: number;
    visualSpatialScore: number;
  };
  summary: string;
  strengths: string[];
  concernAreas: string[];
  recommendations: string[];
  clinicalIndicators: string[];
  preventiveSteps: string[];
}

/**
 * Generate cognitive test questions using Gemini AI
 */
export async function generateCognitiveTest(
  numberOfQuestions: number = 20,
  testType: "MCQ" | "VOICE" = "MCQ",
): Promise<GeneratedQuestion[]> {
  const questionTypeInstruction =
    testType === "VOICE"
      ? `ALL questions MUST be questionType: "VOICE_ANSWER". This is a voice-only test where users will speak their answers.`
      : `Use questionType: "MULTIPLE_CHOICE", "TRUE_FALSE", "SEQUENCE", or "PATTERN_RECOGNITION". Do NOT include VOICE_ANSWER questions.`;

  const optionsInstruction =
    testType === "VOICE"
      ? `- options: Empty array [] (voice questions don't have options)`
      : `- options: Array of 4 answer choices (for multiple choice)`;

  const prompt = `You are a cognitive assessment expert. Generate ${numberOfQuestions} scientifically-validated cognitive test questions for early dementia detection.

TEST TYPE: ${testType === "VOICE" ? "VOICE-BASED TEST" : "MULTIPLE CHOICE TEST"}
${questionTypeInstruction}

The test should cover these cognitive domains:
1. Memory Recall (episodic and working memory)
2. Attention (sustained and divided attention)
3. Executive Function (problem-solving, planning)
4. Language Comprehension (vocabulary, verbal fluency)
5. Visual-Spatial Skills (pattern recognition, spatial reasoning)
6. Processing Speed

For each question, provide:
- questionType: ${testType === "VOICE" ? `"VOICE_ANSWER" (required for all questions)` : `"MULTIPLE_CHOICE", "TRUE_FALSE", "SEQUENCE", or "PATTERN_RECOGNITION"`}
- questionText: Clear, professional question text
${optionsInstruction}
- correctAnswer: ${testType === "VOICE" ? "Expected answer keywords or elements" : "The correct answer"}
- category: One of the cognitive domains above (use snake_case: MEMORY_RECALL, ATTENTION, EXECUTIVE_FUNCTION, LANGUAGE_COMPREHENSION, VISUAL_SPATIAL, PROCESSING_SPEED)
- difficulty: "EASY", "MEDIUM", or "HARD"

${
  testType === "VOICE"
    ? `VOICE TEST REQUIREMENTS:
- Focus on verbal fluency, language expression, memory recall, and comprehension
- Questions should prompt spoken responses (e.g., "Describe...", "Name...", "Explain...", "Tell me about...")
- Set correctAnswer to keywords or expected elements for evaluation
- Examples: "Describe your morning routine", "Name as many animals as you can", "Explain a proverb"`
    : `MCQ TEST REQUIREMENTS:
- Questions should have clear, distinct answer choices
- Ensure correctAnswer exactly matches one of the options
- Mix question types evenly
- Do NOT include VOICE_ANSWER questions`
}

Distribute questions evenly across categories and difficulty levels.

Return ONLY a valid JSON array of questions, no additional text.

Example format:
[
  {
    "questionType": "MULTIPLE_CHOICE",
    "questionText": "Remember these three words: Apple, Table, Penny. What were the three words?",
    "options": ["Apple, Table, Penny", "Apple, Chair, Nickel", "Orange, Table, Penny", "Apple, Desk, Penny"],
    "correctAnswer": "Apple, Table, Penny",
    "category": "MEMORY_RECALL",
    "difficulty": "EASY"
  },
  {
    "questionType": "VOICE_ANSWER",
    "questionText": "Please describe what you did this morning in as much detail as possible.",
    "options": [],
    "correctAnswer": "coherent narrative, sequential events, temporal awareness",
    "category": "MEMORY_RECALL",
    "difficulty": "MEDIUM"
  }
]`;

  try {
    if (!genAI) {
      console.log("No Gemini API key, using fallback questions");
      return getFallbackQuestions(numberOfQuestions, testType);
    }

    console.log("Calling Gemini API to generate questions...");
    const text = await generateContentWithModelFallback(prompt);
    console.log("Gemini API response received, length:", text.length);

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in response");
      console.error("Response text:", text.substring(0, 500));
      throw new Error("No JSON array found in response");
    }

    const questions = JSON.parse(jsonMatch[0]);
    console.log("Successfully parsed", questions.length, "questions");
    return questions;
  } catch (error) {
    console.error("Error generating cognitive test:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }

    // Fallback to hardcoded questions if API fails
    console.log("Using fallback questions due to API error");
    return getFallbackQuestions(numberOfQuestions, testType);
  }
}

/**
 * Fallback questions when Gemini API is unavailable
 */
function getFallbackQuestions(
  count: number,
  testType: "MCQ" | "VOICE" = "MCQ",
): GeneratedQuestion[] {
  const allQuestions: GeneratedQuestion[] = [
    {
      questionType: "MULTIPLE_CHOICE",
      questionText:
        "Remember these three words: Apple, Table, Penny. What were the three words?",
      options: [
        "Apple, Table, Penny",
        "Apple, Chair, Nickel",
        "Orange, Table, Penny",
        "Apple, Desk, Penny",
      ],
      correctAnswer: "Apple, Table, Penny",
      category: "MEMORY_RECALL",
      difficulty: "EASY",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "What day of the week is today?",
      options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      correctAnswer: new Date().toLocaleDateString("en-US", {
        weekday: "long",
      }),
      category: "ATTENTION",
      difficulty: "EASY",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText:
        "If you have 15 dollars and spend 8 dollars, how much do you have left?",
      options: ["5 dollars", "6 dollars", "7 dollars", "8 dollars"],
      correctAnswer: "7 dollars",
      category: "EXECUTIVE_FUNCTION",
      difficulty: "MEDIUM",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "Which word is the opposite of 'hot'?",
      options: ["Cold", "Warm", "Cool", "Freezing"],
      correctAnswer: "Cold",
      category: "LANGUAGE_COMPREHENSION",
      difficulty: "EASY",
    },
    {
      questionType: "PATTERN_RECOGNITION",
      questionText: "Complete the sequence: 2, 4, 6, 8, ?",
      options: ["9", "10", "12", "14"],
      correctAnswer: "10",
      category: "VISUAL_SPATIAL",
      difficulty: "MEDIUM",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "How many minutes are in one hour?",
      options: ["30", "45", "60", "90"],
      correctAnswer: "60",
      category: "PROCESSING_SPEED",
      difficulty: "EASY",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "Spell the word 'WORLD' backwards.",
      options: ["DLROW", "DLORW", "WRODL", "WROLD"],
      correctAnswer: "DLROW",
      category: "ATTENTION",
      difficulty: "MEDIUM",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "What is 100 minus 7?",
      options: ["91", "92", "93", "94"],
      correctAnswer: "93",
      category: "EXECUTIVE_FUNCTION",
      difficulty: "MEDIUM",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "Which of these is a type of fruit?",
      options: ["Carrot", "Banana", "Potato", "Lettuce"],
      correctAnswer: "Banana",
      category: "LANGUAGE_COMPREHENSION",
      difficulty: "EASY",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "What shape has three sides?",
      options: ["Square", "Circle", "Triangle", "Rectangle"],
      correctAnswer: "Triangle",
      category: "VISUAL_SPATIAL",
      difficulty: "EASY",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "Remember: The cat is under the table. Where is the cat?",
      options: [
        "On the table",
        "Under the table",
        "Next to the table",
        "Behind the table",
      ],
      correctAnswer: "Under the table",
      category: "MEMORY_RECALL",
      difficulty: "EASY",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText:
        "Count backwards from 20 to 15. What number comes after 17?",
      options: ["18", "16", "15", "19"],
      correctAnswer: "16",
      category: "PROCESSING_SPEED",
      difficulty: "MEDIUM",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "If today is Wednesday, what day was it yesterday?",
      options: ["Monday", "Tuesday", "Thursday", "Friday"],
      correctAnswer: "Tuesday",
      category: "EXECUTIVE_FUNCTION",
      difficulty: "MEDIUM",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "Which word rhymes with 'cat'?",
      options: ["Dog", "Hat", "Mouse", "Bird"],
      correctAnswer: "Hat",
      category: "LANGUAGE_COMPREHENSION",
      difficulty: "EASY",
    },
    {
      questionType: "PATTERN_RECOGNITION",
      questionText:
        "Which object doesn't belong: Apple, Orange, Carrot, Banana?",
      options: ["Apple", "Orange", "Carrot", "Banana"],
      correctAnswer: "Carrot",
      category: "VISUAL_SPATIAL",
      difficulty: "MEDIUM",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "What is 5 multiplied by 3?",
      options: ["12", "13", "14", "15"],
      correctAnswer: "15",
      category: "PROCESSING_SPEED",
      difficulty: "MEDIUM",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "What season comes after summer?",
      options: ["Spring", "Winter", "Fall", "Summer"],
      correctAnswer: "Fall",
      category: "ATTENTION",
      difficulty: "EASY",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText:
        "If you arrange these in order (smallest to largest): 5, 2, 8, 1, what comes second?",
      options: ["1", "2", "5", "8"],
      correctAnswer: "2",
      category: "EXECUTIVE_FUNCTION",
      difficulty: "HARD",
    },
    {
      questionType: "MULTIPLE_CHOICE",
      questionText: "A synonym for 'happy' is:",
      options: ["Sad", "Joyful", "Angry", "Tired"],
      correctAnswer: "Joyful",
      category: "LANGUAGE_COMPREHENSION",
      difficulty: "MEDIUM",
    },
    {
      questionType: "PATTERN_RECOGNITION",
      questionText: "Complete the pattern: Circle, Square, Circle, Square, ?",
      options: ["Triangle", "Circle", "Rectangle", "Square"],
      correctAnswer: "Circle",
      category: "VISUAL_SPATIAL",
      difficulty: "EASY",
    },
    {
      questionType: "VOICE_ANSWER",
      questionText:
        "Please describe what you did this morning in as much detail as possible. Speak for at least 30 seconds.",
      options: [],
      correctAnswer:
        "coherent narrative, sequential events, temporal awareness",
      category: "MEMORY_RECALL",
      difficulty: "MEDIUM",
    },
    {
      questionType: "VOICE_ANSWER",
      questionText: "Name as many animals as you can think of in one minute.",
      options: [],
      correctAnswer: "verbal fluency, category generation",
      category: "LANGUAGE_COMPREHENSION",
      difficulty: "MEDIUM",
    },
    {
      questionType: "VOICE_ANSWER",
      questionText:
        "Describe the room you are currently in. Include details about objects, colors, and layout.",
      options: [],
      correctAnswer:
        "spatial awareness, descriptive language, observation skills",
      category: "VISUAL_SPATIAL",
      difficulty: "MEDIUM",
    },
    {
      questionType: "VOICE_ANSWER",
      questionText:
        "Explain in your own words what the saying 'Don't count your chickens before they hatch' means.",
      options: [],
      correctAnswer:
        "abstract thinking, language comprehension, explanation ability",
      category: "EXECUTIVE_FUNCTION",
      difficulty: "HARD",
    },
  ];

  // Filter questions based on test type
  const filteredQuestions =
    testType === "VOICE"
      ? allQuestions.filter((q) => q.questionType === "VOICE_ANSWER")
      : allQuestions.filter((q) => q.questionType !== "VOICE_ANSWER");

  return filteredQuestions.slice(0, Math.min(count, filteredQuestions.length));
}

/**
 * Evaluate test answers and generate comprehensive report using Gemini AI
 */
export async function evaluateTestAnswers(
  questions: Array<{
    questionText: string;
    category: string;
    difficulty: string;
    correctAnswer: string;
  }>,
  answers: Array<{
    questionText: string;
    userAnswer: string;
    isCorrect: boolean;
    responseTime?: number;
  }>,
  userAge?: number,
): Promise<TestEvaluation> {
  const totalQuestions = questions.length;
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const accuracy = (correctAnswers / totalQuestions) * 100;

  // Calculate category-wise performance
  const categoryPerformance = questions.reduce(
    (acc, q, idx) => {
      const answer = answers[idx];
      if (!acc[q.category]) {
        acc[q.category] = { correct: 0, total: 0 };
      }
      acc[q.category].total++;
      if (answer?.isCorrect) {
        acc[q.category].correct++;
      }
      return acc;
    },
    {} as Record<string, { correct: number; total: number }>,
  );

  const prompt = `You are a cognitive health specialist analyzing results from a dementia screening test.

Test Results:
- Total Questions: ${totalQuestions}
- Correct Answers: ${correctAnswers}
- Overall Accuracy: ${accuracy.toFixed(1)}%
${userAge ? `- Patient Age: ${userAge}` : ""}

Category Performance:
${Object.entries(categoryPerformance)
  .map(
    ([category, data]) =>
      `- ${category}: ${data.correct}/${data.total} (${(
        (data.correct / data.total) *
        100
      ).toFixed(1)}%)`,
  )
  .join("\n")}

Sample Questions and Answers:
${answers
  .slice(0, 5)
  .map(
    (a, i) =>
      `Q${i + 1}: ${questions[i]?.questionText}\nUser Answer: ${
        a.userAnswer
      }\nCorrect: ${a.isCorrect ? "Yes" : "No"}\n`,
  )
  .join("\n")}

Based on this cognitive assessment, provide a comprehensive evaluation in the following JSON format:

{
  "overallScore": <0-100 number>,
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "cognitiveAge": <estimated cognitive age based on performance>,
  "categoryScores": {
    "memoryScore": <0-100>,
    "attentionScore": <0-100>,
    "executiveFunctionScore": <0-100>,
    "languageScore": <0-100>,
    "visualSpatialScore": <0-100>
  },
  "summary": "<2-3 sentence professional summary of cognitive health status>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concernAreas": ["<concern 1>", "<concern 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "clinicalIndicators": ["<indicator 1>", "<indicator 2>", ...],
  "preventiveSteps": ["<prevention step 1>", "<prevention step 2>", ...]
}

Risk Level Guidelines:
- LOW: 85-100% accuracy, all domains strong
- MODERATE: 70-84% accuracy, some domain weaknesses
- HIGH: 50-69% accuracy, multiple domain concerns
- CRITICAL: <50% accuracy, significant impairment

Provide practical, actionable recommendations and be specific about clinical indicators that warrant medical consultation.

Return ONLY valid JSON, no additional text.`;

  try {
    if (!genAI) {
      console.log("No Gemini API key, using fallback evaluation");
      return generateFallbackEvaluation(accuracy, categoryPerformance);
    }

    console.log("Calling Gemini API to evaluate test...");
    const text = await generateContentWithModelFallback(prompt);

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }

    const evaluation = JSON.parse(jsonMatch[0]);
    return evaluation;
  } catch (error) {
    console.error("Error evaluating test answers:", error);

    // Fallback evaluation
    return generateFallbackEvaluation(accuracy, categoryPerformance);
  }
}

/**
 * Fallback evaluation if Gemini API fails
 */
function generateFallbackEvaluation(
  accuracy: number,
  categoryPerformance: Record<string, { correct: number; total: number }>,
): TestEvaluation {
  let riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  if (accuracy >= 85) riskLevel = "LOW";
  else if (accuracy >= 70) riskLevel = "MODERATE";
  else if (accuracy >= 50) riskLevel = "HIGH";
  else riskLevel = "CRITICAL";

  const calculateScore = (category: string) => {
    const perf = categoryPerformance[category];
    return perf ? (perf.correct / perf.total) * 100 : 0;
  };

  return {
    overallScore: accuracy,
    riskLevel,
    cognitiveAge: Math.round(30 + (100 - accuracy) * 0.5),
    categoryScores: {
      memoryScore: calculateScore("MEMORY_RECALL"),
      attentionScore: calculateScore("ATTENTION"),
      executiveFunctionScore: calculateScore("EXECUTIVE_FUNCTION"),
      languageScore: calculateScore("LANGUAGE_COMPREHENSION"),
      visualSpatialScore: calculateScore("VISUAL_SPATIAL"),
    },
    summary: `Your cognitive assessment shows ${riskLevel.toLowerCase()} risk with ${accuracy.toFixed(
      1,
    )}% overall accuracy.`,
    strengths: ["Completed full assessment", "Active cognitive engagement"],
    concernAreas:
      accuracy < 70
        ? ["Below average performance", "Multiple domain weaknesses"]
        : [],
    recommendations: [
      "Regular cognitive exercises",
      "Maintain healthy sleep schedule",
      "Stay socially active",
      "Balanced diet with omega-3 fatty acids",
    ],
    clinicalIndicators:
      riskLevel === "HIGH" || riskLevel === "CRITICAL"
        ? [
            "Consider professional cognitive evaluation",
            "Discuss results with healthcare provider",
          ]
        : [],
    preventiveSteps: [
      "Daily mental stimulation activities",
      "Regular physical exercise (30 min/day)",
      "Mediterranean diet",
      "Social engagement",
      "Quality sleep (7-9 hours)",
    ],
  };
}
