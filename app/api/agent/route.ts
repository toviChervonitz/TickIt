import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import Project from "@/app/models/ProjectModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

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

    const model =  "gemini-2.5-flash"; 

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          text: ` You are a project task generator.

Determine response language ONLY from the user’s actual content values 
(after labels such as "project name:" or "description:").
Ignore English structural words like "project", "name", "description".

Language rule:
- If the user's content is mostly Hebrew → answer in Hebrew.
- If the user's content is mostly English → answer in English.
- If mixed → pick the dominant language.
- If unclear → use English.

Generate BETWEEN 2 AND 5 actionable development tasks.
Each task MUST include:
- title
- content (short, concise description, 1–3 sentences; no step-by-step instructions)
- dueDate (ISO format YYYY-MM-DD)

Due date rules:
- Short tasks (< 2 hours) → due tomorrow.
- Longer tasks → add days accordingly.
- If a task depends on another → its dueDate must come after.

The project starts on ${startDate}. Use this date to calculate due dates.

Return ONLY valid JSON — an array of tasks.

Prompt content:
${userPrompt}

                `,

        },
      ],
    });

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
