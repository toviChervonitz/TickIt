
interface SendChatMessageProps {
  userId: string;
  projectId: string;
  message: string;
}
// export async function sendChatMessage({
//   userId,
//   projectId,
//   message,
// }: SendChatMessageProps) {
//   try{
//   const res = await fetch("/api/chatMessage/setMessage", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     credentials: "include",
//       body: JSON.stringify({
//         userId,
//         projectId,
//         message,
//       }),
//   });

//   const data = await res.json();
//   if (!res.ok) {
//     throw new Error(data.message || data.error || "Message creation failed");
//   }

//   return { status: res.status, ...data };

//   }
//   catch(err:any){
//     console.error("Error sending chat message:", err);
//     throw new Error(err.message || "Chat message error");

//   }

// }






// export async function getChatMessages(projectId: string) {
//   try {

//     const res = await fetch(`/api/chatMessage/getMessages?projectId=${projectId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       cache: "no-store",
//     });

//     const data = await res.json();
//     if (!res.ok) {
//       throw new Error(data.message || data.error || "Fetching chat failed");
//     }
//     return data;
//   } catch (err: any) {
//     console.error("Get chat Error:", err);
//     return [];
//   }
// }
// app/lib/server/chatServer.ts
export async function sendChatMessage(payload: {
  userId: string;
  projectId: string;
  message: string;
}) {
  const res = await fetch("/api/chatMessage/setMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    // Throw the error returned from the server
    throw new Error(data.error || "Message creation failed");
  }

  // Return the populated chat message object
  return data.chatMessage;
}

export async function getChatMessages(projectId: string) {
  try {
    const res = await fetch(`/api/chatMessage/getMessages?projectId=${projectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Fetching chat failed");
    }

    // Return only the chat array, default to empty array if missing
    return data.chat ?? [];
  } catch (err: any) {
    console.error("Get chat Error:", err);
    return [];
  }
}

