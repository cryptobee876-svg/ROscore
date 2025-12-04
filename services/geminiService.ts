import { GoogleGenAI, Schema, Type, Chat } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    candidateProfile: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        type: { type: Type.STRING, enum: ["Fresher", "Experienced"] },
        targetRole: { type: Type.STRING },
        detectedYoE: { type: Type.NUMBER },
      },
      required: ["name", "type", "targetRole", "detectedYoE"],
    },
    overallScore: { type: Type.NUMBER, description: "Total score out of 100" },
    percentile: { type: Type.NUMBER, description: "Percentile against Indian tech candidates" },
    modules: {
      type: Type.OBJECT,
      properties: {
        academics: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
            feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
            positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "maxScore", "status", "feedback", "positivePoints"],
        },
        techSkills: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
            feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
            positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "maxScore", "status", "feedback", "positivePoints"],
        },
        projects: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
            feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
            positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "maxScore", "status", "feedback", "positivePoints"],
        },
        experience: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
            feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
            positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "maxScore", "status", "feedback", "positivePoints"],
        },
        professionalism: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
            feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
            positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "maxScore", "status", "feedback", "positivePoints"],
        },
        formatting: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
            feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
            positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "maxScore", "status", "feedback", "positivePoints"],
        },
      },
      required: ["academics", "techSkills", "projects", "experience", "professionalism", "formatting"],
    },
    criticalRedFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
    topLeverageFixes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          fix: { type: Type.STRING },
          example: { type: Type.STRING },
        },
        required: ["category", "fix", "example"],
      },
    },
  },
  required: ["candidateProfile", "overallScore", "percentile", "modules", "criticalRedFlags", "topLeverageFixes"],
};

const SYSTEM_INSTRUCTION = `
You are a DETERMINISTIC SCORING ENGINE for Indian Tech Resumes (TCS, Infosys, Product Companies).
You must act as a calculator, not a creative writer.
You must strictly follow the SCORING RUBRIC below to calculate points.
If a criteria is met, award the points. If not, 0.
Do not hallucinate. Only use data present in the text.

**CANDIDATE CLASSIFICATION:**
- IF Experience > 0 years (excluding internships): Type = "Experienced"
- ELSE: Type = "Fresher"

**SCORING RUBRIC (TOTAL 100 POINTS)**

**1. ACADEMIC & ELIGIBILITY (Max 20 Points)**
- [5 pts] Mention of 10th Standard/SSC with % or CGPA.
- [5 pts] Mention of 12th Standard/HSC/Diploma with % or CGPA.
- [5 pts] Mention of Degree (B.Tech/B.E/BCA/MCA) with % or CGPA.
- [5 pts] No educational gaps > 1 year OR gaps are explained.
- **PENALTY:** If any score < 60% or < 6.0 CGPA -> SUBTRACT 20 POINTS (Status: RED).
- **BONUS:** If Degree CGPA > 8.0 -> ADD 2 POINTS (Max cap 20).

**2. TECH STACK & SKILLS (Max 15 Points)**
- [5 pts] Has a dedicated "Skills" or "Technical Skills" section.
- [5 pts] Skills match the Target Role (e.g., Java/Spring for Backend, React/JS for Frontend, Python/SQL for Data).
- [5 pts] Tools listed are modern (e.g., Git, Docker, AWS, VS Code).
- **PENALTY:** Listing outdated tools (Turbo C++, Windows XP, MS Office 2007) -> SUBTRACT 5 POINTS.

**3. PROJECTS (Max 25 Points)**
- [5 pts] Has "Projects" section.
- [10 pts] Contains 2 or more detailed projects. (If only 1 -> 5 pts).
- [5 pts] Includes Live Link (Vercel/Netlify) OR GitHub Repo Link.
- [5 pts] Project description contains "Action Verbs" (Implemented, Developed) AND "Tech Stack" used.
- **PENALTY:** Generic projects ("Library Management", "ToDo List", "Tic Tac Toe", "Calculator") -> SUBTRACT 10 POINTS per occurrence.

**4. EXPERIENCE / INTERNSHIPS (Max 20 Points)**
*If Fresher:*
- [10 pts] Has at least 1 Internship or Freelance work.
- [10 pts] Has extra-curriculars/Hackathons/Open Source contributions.
*If Experienced:*
- [5 pts] Job Role & Company Name clearly listed.
- [5 pts] Key responsibilities listed in bullet points (not paragraphs).
- [10 pts] Impact metrics used (e.g., "Reduced latency by 20%", "Handled 1k users").
- **PENALTY:** "Responsible for..." language instead of "Achieved..." -> SUBTRACT 5 POINTS.

**5. PROFESSIONALISM & LANGUAGE (Indian Norms) (Max 15 Points)**
*Start with 15 Points. Subtract for violations.*
- [-2 pts] **Photo:** Profile picture included (Discouraged in modern tech).
- [-2 pts] **Declaration:** "I hereby declare..." section present (Outdated).
- [-2 pts] **Personal Details:** Father's Name, Religion, Caste, Marital Status present.
- [-2 pts] **Address:** Full home address (House No, Street) listed instead of just City/State.
- [-2 pts] **Missing LinkedIn:** No LinkedIn profile link provided.
- [-2 pts] **First Person:** Use of "I", "Me", "My" (e.g., "I developed...").
- [-2 pts] **Errors:** Spelling or Grammar mistakes found.
- [-1 pt] **Generic Objective:** "To work in a challenging environment..." (Buzzword soup).

**6. FORMATTING (Max 5 Points)**
*Start with 5 Points. Subtract for violations.*
- [-2 pts] **Inconsistency:** Mixed font sizes, bullet styles, or date formats (e.g., using "Jan 2023" and "01/23" mixed).
- [-3 pts] **Density:** Paragraphs longer than 3 lines (Hard to read).
- [-2 pts] **Length:** Resume > 1 page (for Fresher) OR > 2 pages (for <5 years exp).

**CALCULATION LOGIC:**
1. Sum the points from sections 1-6.
2. Max possible score is 100.
3. Calculate Percentile: If Score > 80: Top 5%, > 60: Top 20%, > 40: Top 50%, Else: Bottom 30%.

**OUTPUT REQUIREMENTS:**
- Be blunt.
- If score is low, explain exactly which criteria failed based on the rubric.
- Generate "Top Leverage Fixes" based on the biggest lost points.
`;

export const analyzeResume = async (fileBase64: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: fileBase64,
                mimeType: mimeType,
              },
            },
            {
              text: "Analyze this resume based on the DETERMINISTIC SCORING RUBRIC provided. Be mathematically precise. Return the JSON response."
            }
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.0, // FORCE DETERMINISTIC OUTPUT
      },
    });

    const jsonText = result.text;
    if (!jsonText) {
      throw new Error("No text returned from Gemini API");
    }
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

// Chat Functionality
export const createChatSession = (analysisResult: AnalysisResult): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are 'RO', an elite AI Career Coach specialized in the Indian Tech job market. You have deep knowledge of what recruiters at TCS, Infosys, Wipro, and high-growth startups (like Cred, Zepto) look for.

      **CANDIDATE'S RESUME ANALYSIS CONTEXT:**
      ${JSON.stringify(analysisResult)}

      **YOUR MISSION:**
      Help this candidate get shortlisted. Be engaging, high-energy, and structured.

      **STRICT INTERACTION RULES:**
      1.  **STRUCTURED ANSWERS:** Never give a wall of text. ALWAYS use:
          - **Headings** (Bold/Capitalized)
          - **Bullet Points** for list items.
          - **Step-by-Step Plans** for complex advice.
      
      2.  **CONTEXTUAL AWARENESS:**
          - If the user asks about a specific section (e.g., "Projects"), LOOK at the JSON analysis for that module.
          - If their project score is low, suggest specific tech-heavy projects (e.g., "MERN Stack E-commerce") instead of generic advice.
          - If the user asks about "Education", do not talk about "Skills". Stay focused on the requested section.

      3.  **PROBLEM-SOLUTION FORMAT:**
          When correcting mistakes or suggesting fixes, use this format:
          ❌ **Issue:** [Explain what's wrong based on their resume]
          ✅ **Fix:** [Specific actionable instruction]
          💡 **Example:** [Draft the bullet point/content for them]

      4.  **TONE:**
          - Professional but Motivational.
          - Use emojis (🚀, 💡, ⚡, 🎯) to keep it engaging.
          - Be direct like a senior mentor.

      5.  **NO GENERIC ADVICE:**
          - Bad: "Improve your formatting."
          - Good: "Your resume is 3 pages long. Cut it to 1 page by removing the 'Declaration' and 'Hobbies' sections."

      Answer the user's questions based on these rules.`,
    }
  });
};

export const sendChatMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};