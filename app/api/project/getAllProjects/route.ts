import { dbConnect } from "@/app/lib/DB";
import { GetAllProjects } from "@/app/lib/server/projectServer";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
try {
    const projects = await GetAllProjects();
    console.log(projects ,"proj");
    
    return NextResponse.json({projects});
  
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    );
  }
}
