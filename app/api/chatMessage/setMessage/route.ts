// import { NextResponse } from "next/server";
// import { dbConnect } from "@/app/lib/DB";
// import Pusher from "pusher";
// import { getAuthenticatedUser } from "@/app/lib/jwt";
// import Project from "@/app/models/ProjectModel";
// import ChatMessage from "@/app/models/ChatMessageModel";



// const pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID!,
//   key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
//   secret: process.env.PUSHER_SECRET!,
//   cluster: process.env.PUSHER_CLUSTER!,
//   useTLS: true,
// });

// export async function POST(req: Request) {
//   await dbConnect();

//   try {
//     const body = await req.json();
//     const { userId, projectId, message } = body;


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

//     // Create task (assigned to userId from body)
//     const newMessage = await ChatMessage.create({
//       userId,
//       projectId,
//       message,
//       createdAt: new Date(),
//     });

//     // const populatedMessage = await ChatMessage.findById(newMessage._id)
//     //   .lean();

//     await pusher.trigger(
//       `private-user-${userId}`, 
//       "chatMessage-updated",          
//       {
//         action: "ADD",         
//         chatMessage: newMessage         
//       }
//     );

//     return NextResponse.json({ message: "ChatMessage created successfully", chatMessage: newMessage }, { status: 200 });

//   } catch (err: any) {
//     console.error("❌ Chat Message creation error:", err);
//     return NextResponse.json({ error: "Failed to create chat message", details: err.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Pusher from "pusher";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import Project from "@/app/models/ProjectModel";
import ChatMessage from "@/app/models/ChatMessageModel";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { userId, projectId, message } = body;

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create chat message
    const newMessage = await ChatMessage.create({
      userId,
      projectId,
      message,
      createdAt: new Date(),
    });

    // Populate the user info for frontend
    const populatedMessage = await newMessage.populate("userId", "_id name image").execPopulate();

    // Trigger Pusher event
    await pusher.trigger(`private-user-${userId}`, "chatMessage-updated", {
      action: "ADD",
      chatMessage: populatedMessage,
    });

    // Return the populated message
    return NextResponse.json({ chatMessage: populatedMessage }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Chat Message creation error:", err);
    return NextResponse.json(
      { error: "Failed to create chat message", details: err.message },
      { status: 500 }
    );
  }
}
