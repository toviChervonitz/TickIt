
// "use client";

// import React, { useMemo, useState } from "react";
// import {
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { ITask } from "../../models/types";

// interface TaskCompletionChartProps {
//   tasks: ITask[];
// }

// type Range = "day" | "week" | "month";

// const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
//   const [range, setRange] = useState<Range>("day");

//   const formatDate = (date: string | Date) => {
//     const d = new Date(date);
//     return d.toISOString().split("T")[0];
//   };

//   const getWeekStart = (date: Date) => {
//     const d = new Date(date);
//     const diff = d.getDate() - d.getDay();
//     const weekStart = new Date(d.setDate(diff));
//     return weekStart.toISOString().split("T")[0];
//   };

//   const getMonthStart = (date: Date) => {
//     const d = new Date(date);
//     return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-01`;
//   };

// const groupedData = useMemo(() => {
//   const now = new Date();

//   // time limits
//   const dailyLimit = new Date(now);
//   dailyLimit.setDate(now.getDate() - 30);

//   const weeklyLimit = new Date(now);
//   weeklyLimit.setDate(now.getDate() - 70); // 10 weeks

//   const monthlyLimit = new Date(now);
//   monthlyLimit.setMonth(now.getMonth() - 12); // 12 months

//   const filtered = tasks.filter((t) => {
//     if (t.status !== "done" || !t.completedDate) return false;

//     const completed = new Date(t.completedDate);

//     switch (range) {
//       case "day":
//         return completed >= dailyLimit;
//       case "week":
//         return completed >= weeklyLimit;
//       case "month":
//         return completed >= monthlyLimit;
//       default:
//         return true;
//     }
//   });

//   const map = new Map<string, number>();

//   filtered.forEach((task) => {
//     const completed = new Date(task.completedDate!);

//     let key = "";
//     if (range === "day") key = formatDate(completed);
//     else if (range === "week") key = getWeekStart(completed);
//     else if (range === "month") key = getMonthStart(completed);

//     map.set(key, (map.get(key) || 0) + 1);
//   });

//   return Array.from(map, ([date, count]) => ({ date, count })).sort(
//     (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//   );
// }, [tasks, range]);

//   return (
//     <div className="w-full p-4 bg-white rounded-xl shadow">
//       {/* Range toggle buttons */}
//       <div className="flex gap-4 mb-4">
//         <button
//           onClick={() => setRange("day")}
//           className={`px-3 py-1 rounded ${
//             range === "day" ? "bg-blue-500 text-white" : "bg-gray-200"
//           }`}
//         >
//           Daily
//         </button>
//         <button
//           onClick={() => setRange("week")}
//           className={`px-3 py-1 rounded ${
//             range === "week" ? "bg-blue-500 text-white" : "bg-gray-200"
//           }`}
//         >
//           Weekly
//         </button>
//         <button
//           onClick={() => setRange("month")}
//           className={`px-3 py-1 rounded ${
//             range === "month" ? "bg-blue-500 text-white" : "bg-gray-200"
//           }`}
//         >
//           Monthly
//         </button>
//       </div>

//       {/* Chart */}
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={groupedData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="date" />
//           <YAxis allowDecimals={false} />
//           <Tooltip />
//           <Line
//             type="monotone"
//             dataKey="count"
//             stroke="#8884d8"
//             strokeWidth={3}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default TaskCompletionChart;
"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ITask } from "../../models/types";

interface TaskCompletionChartProps {
  tasks: ITask[];
}

type Range = "day" | "week" | "month";

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
  const [range, setRange] = useState<Range>("day");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // ----------- Helpers ------------
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const diff = d.getDate() - d.getDay();
    const weekStart = new Date(d.setDate(diff));
    return formatDate(weekStart);
  };

  const getMonthStart = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-01`;
  };

  // ----------- Build project dropdown ------------
  const projectNames = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => {
      //(projectId as any).color
      if ((t.projectId as any).name) names.add((t.projectId as any).name);
    });
    return ["all", ...Array.from(names)];
  }, [tasks]);

  // ----------- Build cumulative chart data ------------
  const groupedData = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (t.status !== "done" || !t.completedDate) return false;
      if (selectedProject !== "all" && (t.projectId as any).name !== selectedProject)
        return false;
      return true;
    });

    const map = new Map<string, number>();

    filtered.forEach((task) => {
      const d = new Date(task.completedDate!);
      let key = "";

      if (range === "day") key = formatDate(d);
      if (range === "week") key = getWeekStart(d);
      if (range === "month") key = getMonthStart(d);

      map.set(key, (map.get(key) || 0) + 1);
    });

    const entries = Array.from(map, ([date, count]) => ({
      date,
      count,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // ---- Convert to cumulative totals ----
    let runningTotal = 0;
    const cumulative = entries.map((item) => {
      runningTotal += item.count;
      return {
        date: item.date,
        count: runningTotal,
      };
    });

    return cumulative;
  }, [tasks, range, selectedProject]);

  // ----------- Component UI ------------
  return (
    <div className="w-full p-4 bg-white rounded-xl shadow">

      {/* Project dropdown */}
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="px-3 py-2 border rounded mb-4"
      >
        {projectNames.map((name) => (
          <option key={name} value={name}>
            {name === "all" ? "All Projects" : name}
          </option>
        ))}
      </select>

      {/* Range toggle buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setRange("day")}
          className={`px-3 py-1 rounded ${
            range === "day" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setRange("week")}
          className={`px-3 py-1 rounded ${
            range === "week" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setRange("month")}
          className={`px-3 py-1 rounded ${
            range === "month" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskCompletionChart;
