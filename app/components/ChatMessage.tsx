
interface ChatMessageProps {
  username: string;
  profileImage?: string;
  message: string;
  time: string;
  isCurrentUser?: boolean;
}

export default function ChatMessageComp({
  username,
  profileImage,
  message,
  time,
  isCurrentUser = false,
}: ChatMessageProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isCurrentUser ? "flex-end" : "flex-start",
        marginBottom: "8px",
      }}
    >
      {!isCurrentUser && profileImage && (
        <img
          src={profileImage}
          alt={username}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            marginRight: "8px",
          }}
        />
      )}

      <div
        style={{
          maxWidth: "70%",
          padding: "8px 12px",
          borderRadius: "12px",
          backgroundColor: isCurrentUser ? "#1d4ed8" : "#e5e7eb",
          color: isCurrentUser ? "white" : "black",
          wordBreak: "break-word",
          position: "relative",
        }}
      >
        {!isCurrentUser && (
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{username}</div>
        )}
        <div>{message}</div>
        <div
          style={{
            fontSize: "10px",
            color: isCurrentUser ? "#d1d5db" : "#6b7280",
            textAlign: "right",
            marginTop: "4px",
          }}
        >
          {time}
        </div>
      </div>

      {isCurrentUser && profileImage && (
        <img
          src={profileImage}
          alt={username}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            marginLeft: "8px",
          }}
        />
      )}
    </div>
  );
}
