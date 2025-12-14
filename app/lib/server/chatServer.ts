
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
// export async function getLastReadMessage(projectId: string) {
//   try {
    
//     const res = await fetch(`/api/chatMessage/${projectId}/getLastRead`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       cache: "no-store",
    
//     });

//     const data = await res.json();

//     if (res.ok && data.status === "success") {
//       return data.lastReadMessageId || null;
//     } else {
//       console.error("Failed to get last read:", data);
//       return null;
//     }
//   } catch (err) {
//     console.error("Error fetching last read:", err);
//     return null;
//   }
// }
export async function getLastReadMessage(projectId: string) {
  try {
    const res = await fetch(`/api/chatMessage/getLastRead?projectId=${projectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("getLastReadMessage non-200:", res.status);
      return null;
    }

    const data = await res.json();

    if (data?.status === "success") {
      return data.lastReadMessageId || null;
    } else {
      console.error("Failed to get last read:", data);
      return null;
    }
  } catch (err) {
    console.error("Error fetching last read:", err);
    return null;
  }
}

// export async function updateLastReadMessage(
//   projectId: string,
//   lastReadMessageId: string,
// ) {
//   try {

//     const res = await fetch(`api/chat/${projectId}/setLastRead`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         // optional: send token if needed
//       },
//       body: JSON.stringify({ lastReadMessageId }),
//     });

//     const data = await res.json();

//     if (res.ok && data.status === "success") {
//       return data.lastReadMessageId;
//     } else {
//       console.error("Failed to update last read:", data);
//       return null;
//     }
//   } catch (err) {
//     console.error("Error updating last read:", err);
//     return null;
//   }
// }

export async function updateLastReadMessage(
  projectId: string,
  lastReadMessageId: string
) {
  try {
    const res = await fetch(`/api/chatMessage/setLastRead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, lastReadMessageId }),
    });

    if (!res.ok) {
      console.warn("updateLastReadMessage non-200:", res.status);
      return null;
    }

    const data = await res.json();

    if (data?.status === "success") {
      return data.lastReadMessageId;
    } else {
      console.error("Failed to update last read:", data);
      return null;
    }
  } catch (err) {
    console.error("Error updating last read:", err);
    return null;
  }
}

