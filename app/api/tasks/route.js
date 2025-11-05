import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

// GET all tasks
export async function GET() {
  await dbConnect();
  const tasks = await Task.find().populate("userId").populate("projectId");
  return NextResponse.json(tasks);
}

// POST new task
export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const task = await Task.create(data);
  return NextResponse.json(task, { status: 201 });
}

// PUT update task
export async function PUT(request) {
  await dbConnect();
  const data = await request.json();
  const { id, ...updates } = data;

  if (!id) return NextResponse.json({ error: "Missing task ID" }, { status: 400 });

  const task = await Task.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json(task);
}

// DELETE task
export async function DELETE(request) {
  await dbConnect();
  const data = await request.json();
  const { id } = data;

  if (!id) return NextResponse.json({ error: "Missing task ID" }, { status: 400 });

  await Task.findByIdAndDelete(id);
  return NextResponse.json({ message: "Task deleted" });
}
