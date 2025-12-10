// // app/api/agent/route.ts
// import { getAuthenticatedUser } from "@/app/lib/jwt";
// import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
// import { NextResponse } from "next/server";
// import Project from "@/app/models/ProjectModel";
// import ProjectUser from "@/app/models/ProjectUserModel";

// // Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// // JSON Schema for 2–5 tasks
// const schema: any = {
//   description: "A list of 2–5 actionable project tasks.",
//   type: SchemaType.ARRAY,
//   minItems: 2,
//   maxItems: 5,
//   items: {
//     type: SchemaType.OBJECT,
//     properties: {
//       title: { type: SchemaType.STRING, description: "A short, clear task title." },
//       content: { type: SchemaType.STRING, description: "Detailed markdown instructions." },
//       dueDate: { type: SchemaType.STRING, description: "Suggested due date in ISO format (YYYY-MM-DD)." },
//     },
//     required: ["title", "content", "dueDate"],
//   },
// };

// export async function POST(req: Request) {
//   try {
//     const projectId = req.headers.get("x-project-id"); // get project ID from header
//     if (!projectId) {
//       return NextResponse.json({ error: "Project ID header missing" }, { status: 400 });
//     }

//     const currentUser = await getAuthenticatedUser();
//     if (!currentUser) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const loggedInUserId = currentUser.id;

//     // Ensure project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     // Check that logged-in user is manager of the project
//     const projectUser = await ProjectUser.findOne({ userId: loggedInUserId, projectId });
//     if (!projectUser || projectUser.role !== "manager") {
//       return NextResponse.json({ error: "You are not the manager of this project" }, { status: 403 });
//     }

//     const { userPrompt } = await req.json();
//     if (!userPrompt) {
//       return NextResponse.json({ error: "A project description is required." }, { status: 400 });
//     }

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.0-flash",
//       generationConfig: {
//         responseMimeType: "application/json",
//         responseSchema: schema,
//       },
//     });

//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: userPrompt }] }],
//       systemInstruction: `
//         You are a project task generator.
//         Generate BETWEEN 2 AND 5 actionable development tasks.
//         Each task MUST include a title, detailed markdown content, and dueDate.
//         - If the task seems short (< 2 hours), due date is tomorrow.
//         - For every additional few hours, add a day.
//         - If a task depends on another, place the dueDate after the dependent task’s dueDate.
//         - Return dates in ISO format (YYYY-MM-DD).
//         The project starts on ${project.createdAt.toISOString().split("T")[0]}. Use this date as the reference for calculating due dates.
//         Return ONLY JSON following the provided schema.
//         Language rules:
//         - Use English by default.
//         - Only switch to another language if the user's prompt is **entirely in that language** or clearly predominantly in it.
//         - Do NOT mix languages.

//       `,
//     });

//     const jsonString = result.response.text();
//     let tasks = JSON.parse(jsonString);

//     // Ensure all tasks have valid ISO dueDates
//     tasks = tasks.map((task: any) => ({
//       title: task.title || "(No title)",
//       content: task.content || "",
//       dueDate: !task.dueDate || isNaN(Date.parse(task.dueDate))
//         ? new Date(project.createdAt.getTime() + 24*60*60*1000) // fallback: tomorrow
//             .toISOString()
//             .split("T")[0]
//         : task.dueDate,
//     }));

//     return NextResponse.json(tasks);
//   } catch (error) {
//     console.error("AI Task Generation Error:", error);
//     return NextResponse.json(
//       { error: "Failed to generate tasks. Check your API key, schema, or model." },
//       { status: 500 }
//     );
//   }
// }
// app/api/agent/route.ts
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import Project from "@/app/models/ProjectModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { GoogleGenAI } from "@google/genai";

// Initialize GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Helper: extract first JSON block from AI output
function extractJSON(raw: string): string | null {
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return match ? match[0] : null;
}

export async function POST(req: Request) {
  try {
    const projectId = req.headers.get("x-project-id");
    if (!projectId)
      return NextResponse.json({ error: "Project ID header missing" }, { status: 400 });

    const currentUser = await getAuthenticatedUser();
    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userPrompt } = await req.json();
    if (!userPrompt)
      return NextResponse.json({ error: "A project description is required." }, { status: 400 });

    const project = await Project.findById(projectId);
    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const projectUser = await ProjectUser.findOne({
      userId: currentUser.id,
      projectId,
    });

    if (!projectUser || projectUser.role !== "manager")
      return NextResponse.json({ error: "You are not the manager of this project" }, { status: 403 });

    const startDate = project.createdAt.toISOString().split("T")[0];

    // ---------------------------
    // Generate tasks using GenAI
    // ---------------------------
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"; // easily switch 2.0 <-> 2.5

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          text: ` You are a project task generator.
Generate BETWEEN 2 AND 5 actionable development tasks.
Each task MUST include:
- title
- content (short, concise description, 1–3 sentences; do NOT add step-by-step instructions)
- dueDate (ISO format YYYY-MM-DD)

Due date rules:
- Short tasks (< 2 hours) → due tomorrow.
- Longer tasks → add days based on task length.
- If a task depends on another, its dueDate must be after the dependent task’s dueDate.

The project starts on ${startDate}. Use this date to calculate due dates.
Language: Use English by default unless the user's prompt is entirely in another language.
Return ONLY valid JSON — an array of tasks. Do not add any explanations.

Example output:
[
  { "title": "Task 1", "content": "Short description", "dueDate": "2025-12-09" }
]
Prompt: ${userPrompt}
`,

        },
      ],
    });

    // ---------------------------
    // Parse AI output safely
    // ---------------------------
    const raw = response.text?.trim();
    if (!raw) {
      console.error("AI returned empty response", response);
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    const jsonString = extractJSON(raw);
    if (!jsonString) {
      console.error("Could not extract JSON from AI output:", raw);
      return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }

    let tasks: any[];
    try {
      tasks = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", jsonString);
      return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }

    // ---------------------------
    // Normalize tasks
    // ---------------------------
    const normalized = tasks.map((t: any) => ({
      title: t.title || "Untitled Task",
      content: t.content || "",
      dueDate:
        t.dueDate && !isNaN(Date.parse(t.dueDate))
          ? t.dueDate
          : new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
    }));

    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error("AI Task Generation Error:", err);
    return NextResponse.json(
      { error: err?.message || "AI generation failed" },
      { status: 500 }
    );
  }
}
