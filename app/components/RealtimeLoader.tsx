"use client";

import { useEffect } from 'react';
import useAppStore from '@/app/store/useAppStore';
export default function RealtimeLoader() {

    const { user, initializeRealtime, projectId, subscribeToProjectUpdates } = useAppStore();

    useEffect(() => {
        if (user?._id) {
            initializeRealtime(user._id);
        }
    }, [user, initializeRealtime]);

    useEffect(() => {
        if (projectId) {
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