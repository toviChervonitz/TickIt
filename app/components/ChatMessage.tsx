// interface MessageProps {
//   username: string;
//   profileImage?: string;
//   message: string;
//   time: string;
// }

// export default function ChatMessage({
//   username,
//   profileImage,
//   message,
//   time,
// }: MessageProps) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         gap: "12px",
//         margin: "12px 0",
//         alignItems: "flex-start",
//       }}
//     >
//       {/* Avatar */}
// {profileImage ? (
//   <img
//     src={profileImage}
//     alt={username}
//     style={{
//       width: 40,
//       height: 40,
//       borderRadius: "50%",
//       objectFit: "cover",
//     }}
//   />
// ) : (
//   <div
//     style={{
//       width: 40,
//       height: 40,
//       borderRadius: "50%",
//       background: "#888",
//       color: "white",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontWeight: "bold",
//       fontSize: 18,
//       textTransform: "uppercase",
//     }}
//   >
//     {username.charAt(0)}
//   </div>
// )}

//       {/* Content */}
//       <div style={{ maxWidth: "70%" }}>
//         <div
//           style={{
//             fontSize: "14px",
//             fontWeight: 600,
//             marginBottom: "4px",
//             color: "#333",
//           }}
//         >
//           {username}
//         </div>

//         <div
//           style={{
//             background: "#f1f1f1",
//             padding: "10px 14px",
//             borderRadius: "14px",
//             fontSize: "15px",
//             lineHeight: 1.4,
//             color: "#222",
//             boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
//           }}
//         >
//           {message}
//         </div>

//         <div
//           style={{
//             fontSize: "12px",
//             color: "#999",
//             marginTop: "4px",
//           }}
//         >
//           {time}
//         </div>
//       </div>
//     </div>
//   );
// }
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
