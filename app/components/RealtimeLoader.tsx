"use client";

import { useEffect } from 'react';
import useAppStore from '@/app/store/useAppStore'; 
export default function RealtimeLoader() {

    const { user, initializeRealtime, projectId, subscribeToProjectUpdates } = useAppStore();

    useEffect(() => {
        if (user?._id) {
            console.log("Realtime connection started.");
            initializeRealtime(user._id);
        }
    }, [user, initializeRealtime]);

    useEffect(() => {
        if (projectId) {
            console.log("Subscribing to current project updates:", projectId);
            subscribeToProjectUpdates(projectId);
        }

        return () => {
            if (projectId && useAppStore.getState().pusherClient) {
                return;
            }
        };
    }, [projectId, subscribeToProjectUpdates]);

    return null;
}