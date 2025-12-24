import mongoose from "mongoose";

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
  isArchived: boolean;
}

export interface IProjectUser {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  role: "manager" | "viewer";
  createdAt?: Date;
  updatedAt?: Date;
}

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

export type IUser =
  | {
      _id?: string;
      provider: "credentials";
      name: string;
      email: string;
      tel?: string;
      password: string;
      image?: string;
    }
  | {
      _id?: string;
      provider: "google";
      name: string;
      email: string;
      tel?: string;
      password?: undefined;
      image?: string;
    };

export interface IUserSafe {
  _id: string;
  name: string;
  email: string;
  tel?: string;
  provider: "credentials" | "google";
  image?: string;
}
export interface ChatUser {
  _id: string;
  name: string;
  image?: string;
}
export interface IChatMessage {
  id: string;
  user: ChatUser;
  message: string;
  createdAt: string;
}
