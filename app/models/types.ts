import mongoose from "mongoose";

export interface IProject {
    _id?: string;
    name: string;
    description?: string;
    tasks?: mongoose.Types.ObjectId[];
}

export interface IProjectUser {
    _id?: string;
    userId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    role: "owner" | "editor" | "viewer";
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
    userId?: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
}

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    tel?: string;
    password: string;
    image?: string;
    tasks?: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

