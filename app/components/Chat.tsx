
// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import Pusher from "pusher-js";
// import { getChatMessages, sendChatMessage } from "@/app/lib/server/chatServer";
// import useAppStore from "../store/useAppStore";
// import ChatMessageComp from "./ChatMessage";

// interface User {
//   _id: string;
//   name: string;
//   image?: string;
// }

// interface ChatMessage {
//   id: string;
//   user: User;
//   message: string;
//   createdAt: string;
// }

// interface ChatProps {
//   onClose?: () => void; // optional close handler
// }

// export default function Chat({ onClose }: ChatProps) {
//   const { projectId, user, getProjectName } = useAppStore();

//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

//   // Load initial messages
//   useEffect(() => {
//     if (!projectId) return;
//     (async () => {
//       try {
//         const chat = await getChatMessages(projectId);
//         const safeMessages = chat.map((msg: any) => ({
//           ...msg,
//           user: msg.user ?? { _id: "unknown", name: "Unknown", image: undefined },
//         }));
//         setMessages(safeMessages);
//         scrollToBottom();
//       } catch (err) {
//         console.error("Failed to load chat messages:", err);
//       }
//     })();
//   }, [projectId]);

//   // Real-time Pusher subscription
//   useEffect(() => {
//     if (!projectId || !user) return;

//     const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
//       cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
//       authEndpoint: "/api/pusher/auth",
//     });

//     const channel = pusher.subscribe(`private-project-${projectId}`);

//     channel.bind("chatMessage-updated", (data: any) => {
//       if (data.action === "ADD" && data.chatMessage) {
//         const incoming = {
//           ...data.chatMessage,
//           user: data.chatMessage.user ?? { _id: "unknown", name: "Unknown", image: undefined },
//         };

//         // Prevent duplicates
//         setMessages((prev) => {
//           if (prev.find((m) => m.id === incoming.id)) return prev;
//           return [...prev, incoming];
//         });

//         scrollToBottom();
//       }
//     });

//     return () => {
//       channel.unbind_all();
//       channel.unsubscribe();
//       pusher.disconnect();
//     };
//   }, [projectId, user]);

//   // Send a message
//   const handleSend = async () => {
//     if (!newMessage.trim() || !user || !projectId) return;

//     setLoading(true);
//     try {
//       await sendChatMessage({
//         userId: user._id,
//         projectId,
//         message: newMessage.trim(),
//       });

//       // Clear input only; Pusher will append the message
//       setNewMessage("");
//     } catch (err) {
//       console.error("Failed to send message:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
//       {/* Header */}
//       <div style={{ position: "relative", padding: "16px", backgroundColor: "#2563eb", color: "white", fontWeight: "bold", fontSize: "1.125rem" }}>
//         {getProjectName(projectId!)}
//         {onClose && (
//           <button
//             onClick={onClose}
//             style={{
//               position: "absolute",
//               top: "8px",
//               right: "8px",
//               background: "transparent",
//               border: "none",
//               color: "white",
//               fontSize: "1.25rem",
//               cursor: "pointer",
//             }}
//             aria-label="Close chat"
//           >
//             ×
//           </button>
//         )}
//       </div>

//       {/* Messages */}
//       <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
//         {messages.length > 0 ? (
//           messages.map((msg, index) => {
//             const msgUser = msg.user ?? { _id: "unknown", name: "Unknown", image: undefined };
//             const isCurrentUser = msgUser._id === user?._id;

//             const key = msg.id ?? `${msg.createdAt}-${index}`;

//             return (
//               <ChatMessageComp
//                 key={key}
//                 username={isCurrentUser ? "You" : msgUser.name}
//                 profileImage={msgUser.image}
//                 message={msg.message}
//                 time={new Date(msg.createdAt).toLocaleTimeString()}
//                 isCurrentUser={isCurrentUser}
//               />
//             );
//           })
//         ) : (
//           <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "16px" }}>Start chatting!</div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <div style={{ display: "flex", padding: "16px", borderTop: "1px solid #ccc", gap: "8px" }}>
//         <input
//           type="text"
//           placeholder="Type your message..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={handleKeyDown}
//           disabled={loading}
//           style={{
//             flex: 1,
//             padding: "8px 12px",
//             borderRadius: "4px",
//             border: "1px solid #ccc",
//             outline: "none",
//           }}
//         />
//         <button
//           onClick={handleSend}
//           disabled={loading || !newMessage.trim()}
//           style={{
//             backgroundColor: "#2563eb",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             padding: "8px 16px",
//             cursor: loading || !newMessage.trim() ? "not-allowed" : "pointer",
//           }}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { getChatMessages, sendChatMessage } from "@/app/lib/server/chatServer";
import useAppStore from "../store/useAppStore";
import ChatMessageComp from "./ChatMessage";

interface User {
  _id: string;
  name: string;
  image?: string;
}

interface ChatMessage {
  id: string;
  user: User;
  message: string;
  createdAt: string;
}

interface ChatProps {
  onClose?: () => void;
}

export default function Chat({ onClose }: ChatProps) {
  const { projectId, user, getProjectName } = useAppStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Load initial messages
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const chat = await getChatMessages(projectId);
        const safeMessages = chat.map((msg: any) => ({
          ...msg,
          user: msg.user ?? { _id: "unknown", name: "Unknown", image: undefined },
        }));
        setMessages(safeMessages);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      }
    })();
  }, [projectId]);

  // Real-time Pusher subscription
  useEffect(() => {
    if (!projectId || !user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-project-${projectId}`);

    channel.bind("chatMessage-updated", (data: any) => {
      if (data.action === "ADD" && data.chatMessage) {
        const incoming = {
          ...data.chatMessage,
          user: data.chatMessage.user ?? { _id: "unknown", name: "Unknown", image: undefined },
        };

        setMessages((prev) => {
          if (prev.find((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });

        scrollToBottom();
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [projectId, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !projectId) return;

    setLoading(true);
    try {
      await sendChatMessage({
        userId: user._id,
        projectId,
        message: newMessage.trim(),
      });
      setNewMessage(""); // clear input only, Pusher handles new message
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid #ccc", borderRadius: "8px" }}>
      {/* Header */}
      <div style={{ position: "relative", padding: "16px", backgroundColor: "#2563eb", color: "white", fontWeight: "bold", fontSize: "1.125rem" }}>
        {getProjectName(projectId!)}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.25rem",
              cursor: "pointer",
            }}
            aria-label="Close chat"
          >
            ×
          </button>
        )}
      </div>

      {/* Messages - scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", backgroundColor: "#f9f9f9" }}>
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const msgUser = msg.user ?? { _id: "unknown", name: "Unknown", image: undefined };
            const isCurrentUser = msgUser._id === user?._id;
            const key = msg.id ?? `${msg.createdAt}-${index}`;

            return (
              <ChatMessageComp
                key={key}
                username={isCurrentUser ? "You" : msgUser.name}
                profileImage={msgUser.image}
                message={msg.message}
                time={new Date(msg.createdAt).toLocaleTimeString()}
                isCurrentUser={isCurrentUser} // this can be used for right/left alignment
              />
            );
          })
        ) : (
          <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "16px" }}>Start chatting!</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", padding: "16px", borderTop: "1px solid #ccc", gap: "8px" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !newMessage.trim()}
          style={{
            backgroundColor: "#2563eb",
            color: "white", 
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            cursor: loading || !newMessage.trim() ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
