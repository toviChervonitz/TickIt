"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/app/store/useAppStore";
import TaskStatusChart from "@/app/components/progressChart";



export default function Charts() {
  const router = useRouter();
  const { tasks } = useAppStore();

  
 
  

  

  return (
    <div>
        <h1>Charts Page</h1>
        <TaskStatusChart tasks={tasks}></TaskStatusChart>
    </div>
  );
}
