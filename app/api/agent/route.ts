// app/api/agent/route.ts
import { getAuthenticatedUser } from "@/app/lib/jwt";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";
import Project from "@/app/models/ProjectModel";
import ProjectUser from "@/app/models/ProjectUserModel";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// JSON Schema for 2–5 tasks
const schema: any = {
  description: "A list of 2–5 actionable project tasks.",
  type: SchemaType.ARRAY,
  minItems: 2,
  maxItems: 5,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: "A short, clear task title." },
      content: { type: SchemaType.STRING, description: "Detailed markdown instructions." },
      dueDate: { type: SchemaType.STRING, description: "Suggested due date in ISO format (YYYY-MM-DD)." },
    },
    required: ["title", "content", "dueDate"],
  },
};

export async function POST(req: Request) {
  try {
    const projectId = req.headers.get("x-project-id"); // get project ID from header
    if (!projectId) {
      return NextResponse.json({ error: "Project ID header missing" }, { status: 400 });
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loggedInUserId = currentUser.id;

    // Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check that logged-in user is manager of the project
    const projectUser = await ProjectUser.findOne({ userId: loggedInUserId, projectId });
    if (!projectUser || projectUser.role !== "manager") {
      return NextResponse.json({ error: "You are not the manager of this project" }, { status: 403 });
    }

    const { userPrompt } = await req.json();
    if (!userPrompt) {
      return NextResponse.json({ error: "A project description is required." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: `
        You are a project task generator.
        Generate BETWEEN 2 AND 5 actionable development tasks.
        Each task MUST include a title, detailed markdown content, and dueDate.
        - If the task seems short (< 2 hours), due date is tomorrow.
        - For every additional few hours, add a day.
        - If a task depends on another, place the dueDate after the dependent task’s dueDate.
        - Return dates in ISO format (YYYY-MM-DD).
        The project starts on ${project.createdAt.toISOString().split("T")[0]}. Use this date as the reference for calculating due dates.
        Return ONLY JSON following the provided schema.
        Use the same language as the user's prompt. 
        If the prompt includes multiple languages, choose the language used for most of the text.

      `,
    });

    const jsonString = result.response.text();
    let tasks = JSON.parse(jsonString);

    // Ensure all tasks have valid ISO dueDates
    tasks = tasks.map((task: any) => ({
      title: task.title || "(No title)",
      content: task.content || "",
      dueDate: !task.dueDate || isNaN(Date.parse(task.dueDate))
        ? new Date(project.createdAt.getTime() + 24*60*60*1000) // fallback: tomorrow
            .toISOString()
            .split("T")[0]
        : task.dueDate,
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("AI Task Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate tasks. Check your API key, schema, or model." },
      { status: 500 }
    );
  }
}
