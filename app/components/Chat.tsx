
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import { getChatMessages, sendChatMessage } from "@/app/lib/server/chatServer";
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

const LIMIT = 30;

export default function Chat() {
  const t = getTranslation();
  const { projectId, user, messages, setMessages, language } = useAppStore();

  const [newMessage, setNewMessage] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSend, setLoadingSend] = useState(false);
  const [skip, setSkip] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const hasLoadedInitialRef = useRef(false);

  const isRTL = language === "he";

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (!projectId || hasLoadedInitialRef.current) return;

    (async () => {
      isFetchingRef.current = true;
      setLoadingInitial(true);

      try {
        const chat = await getChatMessages(projectId, 0, LIMIT);

        const safe = chat.map((m: any) => ({
          ...m,
          user: m.user ?? { _id: "unknown", name: "Unknown" },
        }));

        setMessages(safe);
        setSkip(LIMIT);
        hasLoadedInitialRef.current = true;

        // 🔑 force bottom AFTER render
        requestAnimationFrame(() => {
          const c = containerRef.current;
          if (c) c.scrollTop = c.scrollHeight;
        });
      } finally {
        isFetchingRef.current = false;
        setLoadingInitial(false);
      }
    })();
  }, [projectId, setMessages]);

  /* ---------- PAGINATION ---------- */
  const handleScroll = useCallback(async () => {
    const c = containerRef.current;
    if (!c || isFetchingRef.current || c.scrollTop > 40) return;

    isFetchingRef.current = true;
    const prevHeight = c.scrollHeight;

    try {
      const older = await getChatMessages(projectId!, skip, LIMIT);
      if (!older.length) return;

      const safe = older.map((m: any) => ({
        ...m,
        user: m.user ?? { _id: "unknown", name: "Unknown" },
      }));

      const current = useAppStore.getState().messages;
      setMessages([...safe, ...current]);
      setSkip(skip + LIMIT);

      requestAnimationFrame(() => {
        const newHeight = c.scrollHeight;
        c.scrollTop = newHeight - prevHeight;
      });
    } finally {
      isFetchingRef.current = false;
    }
  }, [projectId, skip, setMessages]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    c.addEventListener("scroll", handleScroll);
    return () => c.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* ---------- PUSHER ---------- */
  useEffect(() => {
    if (!projectId || !user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-project-${projectId}`);

    channel.bind("chatMessage-updated", (data: any) => {
      if (data.action !== "ADD") return;

      const incoming = {
        ...data.chatMessage,
        user: data.chatMessage.user ?? { _id: "unknown", name: "Unknown" },
      };

      if (incoming.user._id === user._id) return;

      const c = containerRef.current;
      const nearBottom =
        c &&
        c.scrollHeight - c.scrollTop - c.clientHeight < 120;

      const current = useAppStore.getState().messages;
      setMessages([...current, incoming]);

      if (nearBottom) {
        requestAnimationFrame(() => {
          if (c) c.scrollTop = c.scrollHeight;
        });
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [projectId, user, setMessages]);

  /* ---------- SEND ---------- */
  const handleSend = async () => {
    if (!newMessage.trim() || !user || !projectId) return;

    setLoadingSend(true);

    try {
      await sendChatMessage({
        userId: user._id,
        projectId,
        message: newMessage.trim(),
      });

      const current = useAppStore.getState().messages;
      setMessages([
        ...current,
        {
          user: { _id: user._id, name: user.name, image: user.image },
          message: newMessage.trim(),
          createdAt: new Date().toISOString(),
        } as any,
      ]);

      setNewMessage("");

      requestAnimationFrame(() => {
        const c = containerRef.current;
        if (c) c.scrollTop = c.scrollHeight;
      });
    } finally {
      setLoadingSend(false);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden">
      <Box
        ref={containerRef}
        flex={1}
        overflow="auto"
        p={2}
        bgcolor={CHAT_COLORS.background}
      >
        {loadingInitial && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {messages.map((msg, i) => {
          const u = msg.user ?? { _id: "unknown", name: "Unknown" };
          return (
            <ChatMessageComp
              key={msg.id ?? i}
              username={u.name}
              profileImage={u.image}
              message={msg.message}
              time={msg.createdAt}
              isCurrentUser={u._id === user?._id}
            />
          );
        })}
      </Box>

      <Box display="flex" p={1} gap={1} borderTop={`1px solid ${CHAT_COLORS.inputBorder}`}>
        <TextField
          fullWidth
          placeholder={t("typeMessage")}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loadingSend}
          size="small"
          sx={{ direction: isRTL ? "rtl" : "ltr" }}
        />

        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!newMessage.trim() || loadingSend}
          sx={{ minWidth: 40, borderRadius: "50%" }}
        >
          {loadingSend ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendIcon sx={{ transform: isRTL ? "scaleX(-1)" : "none" }} />
          )}
        </Button>
      </Box>
    </Box>
  );
}
