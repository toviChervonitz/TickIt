// "use client";

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import Pusher from "pusher-js";
// import { getChatMessages, sendChatMessage } from "@/app/lib/server/chatServer";
// import useAppStore from "../store/useAppStore";
// import ChatMessageComp from "./ChatMessage";
// import { getTranslation } from "../lib/i18n";

// import { Box, TextField, Button, CircularProgress } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";

// const CHAT_COLORS = {
//   turquoise: "secondary.main",
//   darkTurquoise: "secondary.main",
//   inputBorder: "#e0e0e0",
//   background: "#f9f9f9",
// };

// export default function Chat() {
//   const t = getTranslation();
//   const { projectId, user, messages, setMessages, language } = useAppStore();
//   const [newMessage, setNewMessage] = useState("");
//   const [loadingInitial, setLoadingInitial] = useState(true);
//   const [loadingSend, setLoadingSend] = useState(false);

//   const [skip, setSkip] = useState(0);
//   const limit = 30;
//   const shouldAutoScrollRef = useRef(true);
//   const hasLoadedInitialMessagesRef = useRef(false);

//   const containerRef = useRef<HTMLDivElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const initialLoadRef = useRef(true);
//   const isFetchingRef = useRef(false);

//   const isRTL = language === "he";

//   useEffect(() => {
//     requestAnimationFrame(() => {
//       if (!shouldAutoScrollRef.current) {
//         shouldAutoScrollRef.current = true;
//         return;
//       }

//       if (initialLoadRef.current) {
//         messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
//         initialLoadRef.current = false;
//       } else {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       }
//     });
//   }, [messages]);

//   useEffect(() => {
//     if (!projectId) return;
//     if (hasLoadedInitialMessagesRef.current) return;
//     if (messages.length > 0 && !loadingInitial) return;
//     if (isFetchingRef.current) return;

//     (async () => {
//       isFetchingRef.current = true;
//       setLoadingInitial(true);
//       try {
//         const chat = await getChatMessages(projectId, 0, limit);

//         const safeMessages = chat.map((m: any) => ({
//           ...m,
//           user: m.user ?? { _id: "unknown", name: "Unknown", image: undefined },
//         }));

//         setMessages(safeMessages);
//         setSkip(limit);
//         hasLoadedInitialMessagesRef.current = true;
//       } catch (error) {
//         console.error("Error loading initial chat messages:", error);
//       } finally {
//         isFetchingRef.current = false;
//         setLoadingInitial(false);
//       }
//     })();
//   }, [projectId, messages.length, setMessages, loadingInitial]);

//   const handleScroll = useCallback(async () => {
//     const container = containerRef.current;
//     if (!container || isFetchingRef.current || skip === 0) return;

//     if (container.scrollTop <= 20) {
//       isFetchingRef.current = true;

//       const oldHeight = container.scrollHeight;
//       shouldAutoScrollRef.current = false;

//       const older = await getChatMessages(projectId!, skip, limit);
//       if (older.length === 0) {
//         isFetchingRef.current = false;
//         return;
//       }

//       const safe = older.map((m: any) => ({
//         ...m,
//         user: m.user ?? { _id: "unknown", name: "Unknown", image: undefined },
//       }));

//       const currentMessages = useAppStore.getState().messages;
//       setMessages([...safe, ...currentMessages]);

//       setSkip(skip + limit);

//       requestAnimationFrame(() => {
//         const newHeight = container.scrollHeight;
//         container.scrollTop = newHeight - oldHeight;
//       });

//       isFetchingRef.current = false;
//     }
//   }, [projectId, skip, limit, setMessages]);

//   useEffect(() => {
//     const div = containerRef.current;
//     if (!div) return;
//     div.addEventListener("scroll", handleScroll);
//     return () => div.removeEventListener("scroll", handleScroll);
//   }, [handleScroll]);

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

//         if (user && incoming.user._id === user._id) {
//           return;
//         }

//         const current = useAppStore.getState().messages;
//         setMessages([...current, incoming]);
//       }
//     });

//     return () => {
//       channel.unbind_all();
//       channel.unsubscribe();
//       pusher.disconnect();
//     };
//   }, [projectId, user, setMessages]);

//   const handleSend = async () => {
//     if (!newMessage.trim() || !user || !projectId) return;

//     setLoadingSend(true);
//     const messageToSend = newMessage.trim();

//     try {
//       await sendChatMessage({
//         userId: user._id,
//         projectId,
//         message: newMessage.trim(),
//       });

//       const newMessageObject = {
//         user: { _id: user._id, name: user.name, image: user.image },
//         message: messageToSend,
//         createdAt: new Date().toISOString(),
//       };

//       const current = useAppStore.getState().messages;
//       setMessages([...current, newMessageObject as any]);
//       setNewMessage("");
//     } finally {
//       setLoadingSend(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100%",
//         overflow: "hidden",
//       }}
//     >
//       <Box
//         ref={containerRef}
//         sx={{
//           flex: 1,
//           overflowY: "auto",
//           p: 2,
//           bgcolor: CHAT_COLORS.background,
//         }}
//       >
//         {/* {loading && messages.length > 0 && (
//           <Box display="flex" justifyContent="center" py={2}>
//             <CircularProgress size={24} sx={{ color: CHAT_COLORS.turquoise }} />
//           </Box>
//         )}

//         {!loading && messages.length === 0 && (
//           <Box textAlign="center" py={2} color="text.secondary">
//             No messages yet. Start the conversation!
//           </Box>
//         )} */}

//         {messages.map((msg, index) => {
//           const msgUser = msg.user ?? { _id: "unknown", name: "Unknown" };
//           const isMe = msgUser._id === user?._id;
//           return (
//             <ChatMessageComp
//               key={msg.id ?? index}
//               username={msgUser.name}
//               profileImage={msgUser.image}
//               message={msg.message}
//               time={msg.createdAt}
//               isCurrentUser={isMe}
//             />
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </Box>

//       <Box
//         sx={{
//           display: "flex",
//           p: 1,
//           gap: 1,
//           borderTop: `1px solid ${CHAT_COLORS.inputBorder}`,
//         }}
//       >

// <TextField
//   fullWidth
//   placeholder={t("typeMessage")}
//   variant="outlined"
//   size="small"
//   value={newMessage}
//   onChange={(e) => setNewMessage(e.target.value)}
//   disabled={loadingSend}
//   inputProps={{
//     style: {
//       textAlign: isRTL ? "right" : "left",
//       direction: isRTL ? "rtl" : "ltr",
//     },
//   }}
//   sx={{
//     "& .MuiOutlinedInput-root": {
//       borderRadius: 50,
//       paddingRight: isRTL ? "4px" : "14px",
//       paddingLeft: isRTL ? "14px" : "4px",
//     },
//   }}
// />

//         <Button
//           variant="contained"
//           onClick={handleSend}
//           disabled={!newMessage.trim() || loadingSend}
//           sx={{
//             minWidth: "40px",
//             height: "40px",
//             borderRadius: "50%",
//             p: 0,
//             bgcolor: CHAT_COLORS.turquoise,
//             "&:hover": { bgcolor: CHAT_COLORS.darkTurquoise },
//             "&.Mui-disabled": {
//               bgcolor: "rgba(0, 0, 0, 0.12)",
//               color: "rgba(0, 0, 0, 0.26)",
//             },
//           }}
//         >
//           {loadingSend ? (
//             <CircularProgress size={20} color="inherit" />
//           ) : (
//             <SendIcon
//               sx={{
//                 fontSize: 20,
//                 transform: isRTL ? "scaleX(-1)" : "none",
//               }}
//             />
//           )}
//         </Button>
//       </Box>
//     </Box>
//   );
// }

// /**
//  * chatGPT, can you follow these instructions:
//  * lets start over. i want to have it that when a user exits the chat, it will 
//  * have saved the id of his last read message (how low he scrolled) and before 
//  * closing the chat it updates it using the server function. then when entering 
//  * the chat, if there are more messages after the one last read, it will make a 
//  * divider line, and then put the rest of the unread messages. the divider line 
//  * doesnt change as the user scrolls up and down. (if no unread messages, no need 
//  * for divider). if the last read message is not in the first batch of 30 brought, 
//  * assume there are no new messages and dont bring anymore-- no line. */      
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import { getChatMessages, sendChatMessage, updateLastReadMessage, getLastReadMessage } from "@/app/lib/server/chatServer";
import useAppStore from "../store/useAppStore";
import ChatMessageComp from "./ChatMessage";
import { getTranslation } from "../lib/i18n";

import { Box, TextField, Button, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const CHAT_COLORS = {
  turquoise: "secondary.main",
  darkTurquoise: "secondary.main",
  inputBorder: "#e0e0e0",
  background: "#f9f9f9",
};

export default function Chat() {
  const t = getTranslation();
  const { projectId, user, messages, setMessages, language } = useAppStore();
  const [newMessage, setNewMessage] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSend, setLoadingSend] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 30;

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);
  const isFetchingRef = useRef(false);

  const [lastReadId, setLastReadId] = useState<string | null>(null);
  const lastReadRef = useRef<string | null>(null);
  const isRTL = language === "he";

  // Keep lastReadRef always updated
  useEffect(() => {
    lastReadRef.current = lastReadId;
  }, [lastReadId]);

  // --- Load initial messages and last-read ---
  useEffect(() => {
    if (!projectId || !user || isFetchingRef.current) return;

    (async () => {
      isFetchingRef.current = true;
      setLoadingInitial(true);

      try {
        // Fetch last-read ID
        const lastRead = await getLastReadMessage(projectId);
        setLastReadId(lastRead || null);

        // Fetch first batch
        const chat = await getChatMessages(projectId, 0, limit);
        const safeMessages = chat.map((m: any) => ({
          ...m,
          id: m.id ?? `${Date.now()}-${Math.random()}`, // ensure stable ID
          user: m.user ?? { _id: "unknown", name: "Unknown", image: undefined },
        }));

        setMessages(safeMessages);
        setSkip(limit);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoadingInitial(false);
        isFetchingRef.current = false;
      }
    })();
  }, [projectId, user, setMessages]);

  // --- Scroll to bottom on new messages ---
  useEffect(() => {
    requestAnimationFrame(() => {
      if (initialLoadRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        initialLoadRef.current = false;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messages]);

  // --- Track last-read message when scrolling ---
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const allMessages = container.querySelectorAll(".chat-message");
    for (let i = allMessages.length - 1; i >= 0; i--) {
      const msgEl = allMessages[i] as HTMLElement;
      const rect = msgEl.getBoundingClientRect();
      if (rect.top <= container.getBoundingClientRect().bottom) {
        setLastReadId(msgEl.dataset.id!);
        break;
      }
    }
  }, []);

  // --- Save last-read on unmount ---
  useEffect(() => {
    return () => {
      if (projectId && user && lastReadRef.current) {
        updateLastReadMessage(projectId, lastReadRef.current).catch(console.error);
      }
    };
  }, [projectId, user]);

  // --- Handle sending messages ---
  const handleSend = async () => {
    if (!newMessage.trim() || !user || !projectId) return;
    setLoadingSend(true);

    try {
      await sendChatMessage({ userId: user._id, projectId, message: newMessage.trim() });

      const newMsg = {
        id: `${Date.now()}-${Math.random()}`,
        user: { _id: user._id, name: user.name, image: user.image },
        message: newMessage.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    } finally {
      setLoadingSend(false);
    }
  };

  // --- Compute divider index ---
  const dividerIndex = lastReadId ? messages.findIndex(m => m.id === lastReadId) + 1 : -1;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: CHAT_COLORS.background }}
      >
        {messages.map((msg, index) => {
          const isMe = msg.user._id === user?._id;
          return (
            <React.Fragment key={msg.id}>
              {index === dividerIndex && (
                <Box
                  sx={{
                    textAlign: "center",
                    color: "text.secondary",
                    py: 1,
                    borderTop: "1px solid gray",
                    borderBottom: "1px solid gray",
                    mb: 1,
                  }}
                >
                  {"unreadMessages"}
                </Box>
              )}
              <ChatMessageComp
                data-id={msg.id}
                username={msg.user.name}
                profileImage={msg.user.image}
                message={msg.message}
                time={msg.createdAt}
                isCurrentUser={isMe}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ display: "flex", p: 1, gap: 1, borderTop: `1px solid ${CHAT_COLORS.inputBorder}` }}>
        <TextField
          fullWidth
          placeholder={t("typeMessage")}
          variant="outlined"
          size="small"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loadingSend}
          inputProps={{ style: { textAlign: isRTL ? "right" : "left", direction: isRTL ? "rtl" : "ltr" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 50,
              paddingRight: isRTL ? "4px" : "14px",
              paddingLeft: isRTL ? "14px" : "4px",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!newMessage.trim() || loadingSend}
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: "50%",
            p: 0,
            bgcolor: CHAT_COLORS.turquoise,
            "&:hover": { bgcolor: CHAT_COLORS.darkTurquoise },
          }}
        >
          {loadingSend ? <CircularProgress size={20} color="inherit" /> : <SendIcon sx={{ fontSize: 20, transform: isRTL ? "scaleX(-1)" : "none" }} />}
        </Button>
      </Box>
    </Box>
  );
}
