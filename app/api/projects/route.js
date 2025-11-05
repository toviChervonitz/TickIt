import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

// GET all projects
export async function GET() {
  await dbConnect();
  const projects = await Project.find().populate("userId");
  return NextResponse.json(projects);
}

// POST new project
export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const project = await Project.create(data);
  return NextResponse.json(project, { status: 201 });
}

// PUT update project
export async function PUT(request) {
  await dbConnect();
  const data = await request.json();
  const { id, ...updates } = data;

  if (!id) return NextResponse.json({ error: "Missing project ID" }, { status: 400 });

  const project = await Project.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json(project);
}

// DELETE project
export async function DELETE(request) {
  await dbConnect();
  const data = await request.json();
  const { id } = data;

  if (!id) return NextResponse.json({ error: "Missing project ID" }, { status: 400 });

  await Project.findByIdAndDelete(id);
  return NextResponse.json({ message: "Project deleted" });
}
