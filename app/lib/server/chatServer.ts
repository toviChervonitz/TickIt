
// export async function sendChatMessage(payload: {
//   userId: string;
//   projectId: string;
//   message: string;
// }) {
//   const res = await fetch("/api/chatMessage/setMessage", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     // Throw the error returned from the server
//     throw new Error(data.error || "Message creation failed");
//   }

//   // Return the populated chat message object
//   return data.chatMessage;
// }

// export async function getChatMessages(projectId: string) {
//   try {
//     const res = await fetch(`/api/chatMessage/getMessages?projectId=${projectId}`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       cache: "no-store",
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || data.error || "Fetching chat failed");
//     }

//     // Return only the chat array, default to empty array if missing
//     return data.chat ?? [];
//   } catch (err: any) {
//     console.error("Get chat Error:", err);
//     return [];
//   }
// }

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
  if (!res.ok) throw new Error(data.error || "Message creation failed");
  return data.chatMessage;
}

export async function getChatMessages(
  projectId: string,
  skip: number = 0,
  limit: number = 30
) {
  const res = await fetch(
    `/api/chatMessage/getMessages?projectId=${projectId}&skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetching chat failed");

  return data.chat ?? [];
}
