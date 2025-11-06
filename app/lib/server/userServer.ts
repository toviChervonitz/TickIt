import { getAuthToken } from '../jwt';

export async function AddUserToProject(projectId: string, email: string) {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Missing authentication token. Please log in again.");
    }
    const res = await fetch('/api/users/addMembers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,

        },
        body: JSON.stringify({ projectId, email }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Adding users to project failed');
    }
    return { status: res.status, ...data };
}