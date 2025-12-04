
// interface ChatMessageProps {
//   username: string;
//   profileImage?: string;
//   message: string;
//   time: string | Date;
//   isCurrentUser?: boolean;
// }

// export default function ChatMessageComp({
//   username,
//   profileImage,
//   message,
//   time,
//   isCurrentUser = false,
// }: ChatMessageProps) {
//   const date = new Date(time);
//   const now = new Date();

//   let formattedTime = "";

//   const isToday =
//     date.getFullYear() === now.getFullYear() &&
//     date.getMonth() === now.getMonth() &&
//     date.getDate() === now.getDate();

//   const isThisYear = date.getFullYear() === now.getFullYear();

//   const day = date.getDate();
//   const month = date.getMonth() + 1;
//   const year = date.getFullYear();
//   const hoursMinutes = date.toLocaleTimeString(undefined, {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   });

//   if (isToday) {
//     // Only time
//     formattedTime = hoursMinutes;
//   } else if (isThisYear) {
//     // Day/Month + time (no year)
//     formattedTime = `${day}/${month}, ${hoursMinutes}`;
//   } else {
//     // Full date + time
//     formattedTime = `${day}/${month}/${year}, ${hoursMinutes}`;
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: isCurrentUser ? "flex-end" : "flex-start",
//         marginBottom: "8px",
//       }}
//     >
//       {!isCurrentUser && profileImage && (
//         <img
//           src={profileImage}
//           alt={username}
//           style={{
//             width: "32px",
//             height: "32px",
//             borderRadius: "50%",
//             marginRight: "8px",
//           }}
//         />
//       )}

//       <div
//         style={{
//           maxWidth: "70%",
//           padding: "8px 12px",
//           borderRadius: "12px",
//           backgroundColor: isCurrentUser ? "#1d4ed8" : "#e5e7eb",
//           color: isCurrentUser ? "white" : "black",
//           wordBreak: "break-word",
//           position: "relative",
//         }}
//       >
//         {!isCurrentUser && (
//           <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{username}</div>
//         )}
//         <div>{message}</div>
//         <div
//           style={{
//             fontSize: "10px",
//             color: isCurrentUser ? "#d1d5db" : "#6b7280",
//             textAlign: "right",
//             marginTop: "4px",
//           }}
//         >
//           {formattedTime}
//         </div>
//       </div>

//       {isCurrentUser && profileImage && (
//         <img
//           src={profileImage}
//           alt={username}
//           style={{
//             width: "32px",
//             height: "32px",
//             borderRadius: "50%",
//             marginLeft: "8px",
//           }}
//         />
//       )}
//     </div>
//   );
// }
interface ChatMessageProps {
  username: string;
  profileImage?: string;
  message: string;
  time: string | Date;
  isCurrentUser?: boolean;
}

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
        {/* Always show the username */}
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{username}</div>
        <div>{message}</div>
        <div
          style={{
            fontSize: "10px",
            color: isCurrentUser ? "#d1d5db" : "#6b7280",
            textAlign: "right",
            marginTop: "4px",
          }}
        >
          {formattedTime}
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
