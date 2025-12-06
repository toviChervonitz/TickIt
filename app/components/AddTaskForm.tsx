// "use client";

// import React, { ChangeEvent, FormEvent } from "react";
// import useAppStore from "@/app/store/useAppStore";
// import { getTranslation } from "../lib/i18n";

// export interface TaskFormData {
//   title: string;
//   content: string;
//   userId: string;
//   dueDate: string;
//   status: "todo" | "doing" | "done";
// }

// interface TaskFormProps {
//   task: TaskFormData;
//   setTask: (t: TaskFormData) => void;
//   onSubmit: () => void; 
// }

// export default function TaskForm({ task, setTask, onSubmit }: TaskFormProps) {
//   const { projectUsers } = useAppStore();
//   const t = getTranslation();

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setTask({ ...task, [name]: value });
//   };

//   console.log(projectUsers,"in form to add task");

//   return (
//     <form
//       className="create-project-form"
//       onSubmit={(e: FormEvent) => {
//         e.preventDefault();
//         onSubmit();
//       }}
//     >
//       <input
//         type="text"
//         name="title"
//         placeholder={t("taskTitle")}
//         value={task.title}
//         onChange={handleChange}
//         required
//       />
//       <textarea
//         name="content"
//         placeholder={t("taskContent")}
//         value={task.content}
//         onChange={handleChange}
//       />
//       <select
//         name="userId"
//         value={task.userId}
//         onChange={handleChange}
//         required
//       >
//         <option value="">{`-- ${t("assignTo")} --`}</option>
//         (projectUsers)(
//         {projectUsers.map((user) => (
//           <option key={user._id} value={user._id}>
//             {user.email}
//           </option>
//         ))})
//       </select>
//       <input
//         type="date"
//         name="dueDate"
//         value={task.dueDate}
//         onChange={handleChange}
//         required
//         min={new Date().toISOString().split("T")[0]}
//       />
//       <button type="submit">{t("addTask")}</button>
//     </form>
//   );
// }
"use client";

import React, { ChangeEvent, FormEvent } from "react";
import useAppStore from "@/app/store/useAppStore";
import { getTranslation } from "../lib/i18n";

import {
  TextField,
  Button,
  Stack,
  MenuItem,
  GridLegacy as Grid,
  Box,
  Paper,
  useMediaQuery,
  useTheme
} from "@mui/material";

export interface TaskFormData {
  title: string;
  content: string;
  userId: string;
  dueDate: string;
  status: "todo" | "doing" | "done";
}

interface TaskFormProps {
  task: TaskFormData;
  setTask: (t: TaskFormData) => void;
  onSubmit: () => void;
  variant?: "popup" | "page";
}

export default function TaskForm({
  task,
  setTask,
  onSubmit,
  variant = "popup",
}: TaskFormProps) {
  const { projectUsers } = useAppStore();
  const t = getTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Paper
      elevation={variant === "popup" ? 0 : 1}
      sx={{
        p: variant === "popup" ? 1 : 3,
        bgcolor: "transparent",
        boxShadow: "none",
        width: "100%",
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={variant === "popup" ? 2 : 3}>

          {/* Title */}
          <TextField
            fullWidth
            label={t("taskTitle")}
            name="title"
            value={task.title}
            onChange={handleChange}
            size="small"
            required
          />

          {/* Content */}
          <TextField
            fullWidth
            label={t("taskContent")}
            name="content"
            value={task.content}
            onChange={handleChange}
            size="small"
            multiline
            rows={variant === "popup" ? 3 : 4}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
          >
            <TextField
              select
              label={t("assignTo")}
              name="userId"
              fullWidth
              size="small"
              value={task.userId}
              onChange={handleChange}
              required
            >
              <MenuItem value="">-- {t("assignTo")} --</MenuItem>
              {projectUsers?.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.email}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label={t("dueDate")}
              name="dueDate"
              fullWidth
              size="small"
              value={task.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Stack>


          {/* Submit Button */}
          <Box
            sx={{
              width: "100%",
              mt: 1,
            }}
          >
            {variant === "popup" ? (
              /* POPUP BUTTON — טורקיז ורחב */
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="small"
                sx={{
                  textTransform: "none",
                  py: 1.3,
                  background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
                  "&:hover": {
                    background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
                  },
                }}
              >
                {t("addTask")}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="medium"
                sx={{
                  textTransform: "none",
                  py: 1.4,
                  bgcolor: "#1B4A71",
                  "&:hover": { bgcolor: "#163B5A" },
                }}
              >
                {t("addTask")}
              </Button>
            )}
          </Box>


        </Stack>
      </Box>
    </Paper>
  );
}
