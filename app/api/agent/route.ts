// // app/api/agent/route.ts

// import { getAuthenticatedUser } from "@/app/lib/jwt";
// import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
// import { NextResponse } from "next/server";
// import Project from "@/app/models/ProjectModel";
// import ProjectUser from "@/app/models/ProjectUserModel";
// // Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// // JSON Schema for 2–5 tasks
// // NOTE: the SDK's TS types for "responseSchema" are strict; cast to `any` here
// // to avoid type incompatibilities while keeping the runtime schema intact.
// const schema: any = {
//   description: "A list of 2–5 actionable project tasks.",
//   type: SchemaType.ARRAY,
//   minItems: 2,
//   maxItems: 5,
//   items: {
//     type: SchemaType.OBJECT,
//     properties: {
//       title: {
//         type: SchemaType.STRING,
//         description: "A short, clear task title.",
//       },
//       content: {
//         type: SchemaType.STRING,
//         description: "Detailed markdown instructions for completing the task.",
//       },
//     },
//     required: ["title", "content"],
//   },
// };
// //

// //
// export async function POST(req: Request) {
//   try {
//     const { userPrompt } = await req.json();

//     if (!userPrompt) {
//       return NextResponse.json(
//         { error: "A project description is required." },
//         { status: 400 }
//       );
//     }

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.0-flash",
//       generationConfig: {
//         responseMimeType: "application/json",
//         responseSchema: schema,
//       },
//     });

//     //
//         const currentUser = await getAuthenticatedUser();
//     if (!currentUser) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const loggedInUserId = currentUser.id;

//     // Ensure project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     // ✅ Check that logged-in user is manager of the project
//     const projectUser = await ProjectUser.findOne({ userId: loggedInUserId, projectId });
//     if (!projectUser || projectUser.role !== "manager") {
//       return NextResponse.json({ error: "You are not the manager of this project" }, { status: 403 });
//     }

//     //
//     const result = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: userPrompt,
//             },
//           ],
//         },
//       ],
//       systemInstruction: `
//         You are a project task generator.

//         The user will provide a project idea or description.

//         Your job is to generate BETWEEN 2 AND 5 actionable development tasks.

//         Each task MUST include:
//         - A short, clear title
//         - Detailed markdown content describing what to do and how to implement it

//         Rules:
//         - Do NOT summarize the project.
//         - Do NOT repeat the project description.
//         - Do NOT provide general fluff.
//         - All tasks must be actionable steps a developer can follow.

//         Return ONLY JSON following the provided schema.
//       `,
//     });

//     // Parse JSON returned by Gemini
//     const jsonString = result.response.text();
//     const tasks = JSON.parse(jsonString);

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
      title: {
        type: SchemaType.STRING,
        description: "A short, clear task title.",
      },
      content: {
        type: SchemaType.STRING,
        description: "Detailed markdown instructions for completing the task.",
      },
    },
    required: ["title", "content"],
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
        Each task MUST include a title and detailed markdown content.
        Return ONLY JSON following the provided schema.
      `,
    });

    const jsonString = result.response.text();
    const tasks = JSON.parse(jsonString);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("AI Task Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate tasks. Check your API key, schema, or model." },
      { status: 500 }
    );
  }
}
