"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import { getChatMessages, sendChatMessage } from "@/app/lib/server/chatServer";
import useAppStore from "../store/useAppStore";
import ChatMessageComp from "./ChatMessage"; 
import { getTranslation } from "../lib/i18n";

import { Box, TextField, Button, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useLanguage } from "../context/LanguageContext"; 

const CHAT_COLORS = {
  turquoise: "secondary.main", 
  darkTurquoise: "secondary.main",
  inputBorder: "#e0e0e0",
  background: "#f9f9f9",
};

export default function Chat() {
  const t = getTranslation();
  const { projectId, user, messages, setMessages } = useAppStore();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [skip, setSkip] = useState(0);
  const limit = 30;
  const shouldAutoScrollRef = useRef(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);
  const isFetchingRef = useRef(false);

  const { lang } = useLanguage();
  const isRTL = lang === "he";

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!shouldAutoScrollRef.current) {
        shouldAutoScrollRef.current = true; 
        return;
      }

      if (initialLoadRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        initialLoadRef.current = false;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messages]);

  useEffect(() => {
    if (!projectId || messages.length > 0) return;

    (async () => {
      setLoading(true); 
      const chat = await getChatMessages(projectId, 0, limit);

      const safeMessages = chat.map((m: any) => ({
        ...m,
        user: m.user ?? { _id: "unknown", name: "Unknown", image: undefined },
      }));

      setMessages(safeMessages);
      setSkip(limit);
      setLoading(false);
    })();
  }, [projectId, messages, setMessages]);

  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || isFetchingRef.current || skip === 0) return;

    if (container.scrollTop <= 20) {
      isFetchingRef.current = true;

      const oldHeight = container.scrollHeight;
      shouldAutoScrollRef.current = false;  

      const older = await getChatMessages(projectId!, skip, limit);
      if (older.length === 0) {
        isFetchingRef.current = false;
        return;
      }

      const safe = older.map((m: any) => ({
        ...m,
        user: m.user ?? { _id: "unknown", name: "Unknown", image: undefined },
      }));

      const currentMessages = useAppStore.getState().messages;
      setMessages([...safe, ...currentMessages]);

      setSkip(skip + limit);

      requestAnimationFrame(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - oldHeight; 
      });

      isFetchingRef.current = false;
    }
  }, [projectId, skip, limit, setMessages]);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

        const current = useAppStore.getState().messages;
        setMessages([...current, incoming]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [projectId, user, setMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !projectId) return;

    setLoading(true);
    try {
      await sendChatMessage({
        userId: user._id,
        projectId,
        message: newMessage.trim(),
      });
      setNewMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden", 
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2, 
          bgcolor: CHAT_COLORS.background, 
        }}
      >
        {loading && messages.length === 0 && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} sx={{ color: CHAT_COLORS.turquoise }} />
          </Box>
        )}

        {messages.map((msg, index) => {
          const msgUser = msg.user ?? { _id: "unknown", name: "Unknown" };
          const isMe = msgUser._id === user?._id;
          return (
            <ChatMessageComp
              key={msg.id ?? index}
              username={msgUser.name} 
              profileImage={msgUser.image}
              message={msg.message}
              time={msg.createdAt}
              isCurrentUser={isMe}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          display: "flex",
          p: 1, 
          gap: 1,
          borderTop: `1px solid ${CHAT_COLORS.inputBorder}`,
        }}
      >
        
        <TextField
          fullWidth
          placeholder={t("typeMessage")}
          variant="outlined"
          size="small"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? handleSend() : null)}
          disabled={loading}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 50,
              paddingRight: isRTL ? "4px" : "14px",
              paddingLeft: isRTL ? "14px" : "4px",
            },
            "& fieldset": {
              borderColor: CHAT_COLORS.inputBorder,
            },
            direction: isRTL ? "rtl" : "ltr", 
            flexGrow: 1,
          }}
        />

        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!newMessage.trim() || loading}
          sx={{
            minWidth: "40px",
            height: "40px",
            borderRadius: "50%",
            p: 0,
            bgcolor: CHAT_COLORS.turquoise,
            "&:hover": { bgcolor: CHAT_COLORS.darkTurquoise },
            "&.Mui-disabled": {
              bgcolor: "rgba(0, 0, 0, 0.12)",
              color: "rgba(0, 0, 0, 0.26)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendIcon
              sx={{
                fontSize: 20,
                transform: isRTL ? "scaleX(-1)" : "none",
              }}
            />
          )}
        </Button>
      </Box>
    </Box>
  );
}