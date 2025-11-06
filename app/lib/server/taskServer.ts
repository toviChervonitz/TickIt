import { routeModule } from 'next/dist/build/templates/pages';
import { getAuthToken, getTokenPayload } from '../jwt';
import { taskSchema } from '../validation';

export async function CreateTask(form: any) {
    const { error } = taskSchema.validate(form);
    if (error) {
        throw new Error(error.message);
    }
    const payload=getTokenPayload()

    if (!payload||!payload.id) {
        throw new Error("Missing authentication token.");
    }
    
    //get user id from token
    //get project id from zustand
    //check if projectUser exists and role=manager
    const projectId=0;//get from zustand
    const res1 = await fetch('/api/projectUser/verifyManager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({userId: payload.id, projectId: projectId, role: 'manager'}),
    });
    const data1 = await res1.json();
    if (!res1.ok) {
        throw new Error(data1.error || 'You are not the manager of this project');
    }
    ////

    const res = await fetch('/api/task/createTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Task creation failed');
    }
    return { status: res.status, ...data };
}