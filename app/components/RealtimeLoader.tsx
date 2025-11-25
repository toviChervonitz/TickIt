"use client";

import { useEffect } from 'react';
import useAppStore from '@/app/store/useAppStore'; // ודא שהנתיב לסטור נכון

export default function RealtimeLoader() {
    
    const { user, initializeRealtime } = useAppStore();

    useEffect(() => {
        if (user?._id) {
            console.log("Realtime connection started.");
            initializeRealtime(user._id);
        }
    }, [user, initializeRealtime]);

    return null; 
}