"use client";

import { Box, Typography, Avatar } from "@mui/material";

interface ChatMessageProps {
  username: string;
  profileImage?: string;
  message: string;
  time: string | Date;
  isCurrentUser?: boolean;
}

const CHAT_COLORS = {
  currentUser: "text.secondary",
  otherUser: "#eef2f6",
  currentUserText: "white",
  otherUserText: "black",
  currentUserTime: "rgba(255, 255, 255, 0.7)",
  otherUserTime: "#6b7280",
};

export default function ChatMessageComp({
  username,
  profileImage,
  message,
  time,
  isCurrentUser = false,
}: ChatMessageProps) {
  const date = new Date(time);
  const now = new Date();

  let formattedTime = "";

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const isThisYear = date.getFullYear() === now.getFullYear();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hoursMinutes = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) {
    formattedTime = hoursMinutes;
  } else if (isThisYear) {
    formattedTime = `${day}/${month}, ${hoursMinutes}`;
  } else {
    formattedTime = `${day}/${month}/${year}, ${hoursMinutes}`;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isCurrentUser ? "flex-end" : "flex-start",
        mb: 1,
        alignItems: "flex-start",
      }}
    >
      {!isCurrentUser && profileImage && (
        <Avatar
          src={profileImage}
          alt={username}
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            mt: 0.5,
          }}
        />
      )}

      <Box
        sx={{
          maxWidth: "75%",
          p: "10px 14px",
          backgroundColor: isCurrentUser
            ? CHAT_COLORS.currentUser
            : CHAT_COLORS.otherUser,
          color: isCurrentUser
            ? CHAT_COLORS.currentUserText
            : CHAT_COLORS.otherUserText,
          borderRadius: isCurrentUser
            ? "18px 18px 2px 18px"
            : "18px 18px 18px 2px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          wordBreak: "break-word",
        }}
      >
        {!isCurrentUser && (
          <Typography
            variant="caption"
            component="div"
            fontWeight={700}
            sx={{
              mb: 0.5,
              fontSize: 13,
              color: isCurrentUser ? "#66dcd7" : CHAT_COLORS.otherUserText,
            }}
          >
            {username}
          </Typography>
        )}

        <Typography variant="body2" sx={{ fontSize: 15, lineHeight: 1.3 }}>
          {message}
        </Typography>

        <Typography
          variant="caption"
          component="div"
          sx={{
            fontSize: "10px",
            color: isCurrentUser ? CHAT_COLORS.currentUserTime : CHAT_COLORS.otherUserTime,
            textAlign: "right",
            mt: 0.5,
          }}
        >
          {formattedTime}
        </Typography>
      </Box>

      {isCurrentUser && profileImage && (
        <Avatar
          src={profileImage}
          alt={username}
          sx={{
            width: 32,
            height: 32,
            ml: 1,
            mt: 0.5,
          }}
        />
      )}
    </Box>
  );
}
