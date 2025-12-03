import mongoose from "mongoose";

// Project interfaces
export interface IProject {
  _id?: string;
  name: string;
  description?: string;
  tasks?: mongoose.Types.ObjectId[];
  color: string;
}

export type Lang = "en" | "he";


export interface IProjectRole {
  project: IProject;
  role: "manager" | "viewer";
}

export interface IProjectRole {
  project: IProject;
  role: "manager" | "viewer";
}

export interface IProjectUser {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  role: "manager" | "viewer";
  createdAt?: Date;
  updatedAt?: Date;
}

// Task interface
export interface ITask {
  _id?: string;
  title: string;
  content?: string;
  status: "todo" | "doing" | "done";
  createdAt?: Date;
  dueDate?: Date;
  completedDate?: Date;
  userId?: mongoose.Types.ObjectId | IUser;
  projectId?: mongoose.Types.ObjectId | IProject;
}

// User types
export type IUser =
  | {
    _id?: string;           // include _id
    provider: "credentials";
    name: string;
    email: string;
    tel?: string;
    password: string;        // required for manual users
    image?: string;
  }
  | {
    _id?: string;           // include _id
    provider: "google";
    name: string;
    email: string;
    tel?: string;
    password?: undefined;    // optional/undefined for Google users
    image?: string;
  };

// Safe user for frontend (no password)
export interface IUserSafe {
  _id: string; // include _id for TS safety
  name: string;
  email: string;
  tel?: string;
  provider: "credentials" | "google";
  image?: string;
}