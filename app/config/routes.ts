export const ROUTES = {
    LANDING:"/",
    DASHBOARD: "/pages/dashboard",
    HOME:"/pages/homeContent", 
    LOGIN: "/pages/login",
    REGISTER: "/pages/register",
    FORGOT: "/pages/forgotPassword",
    RESET: "/pages/resetPassword",
    UNAUTHORIZED: "/unauthorized",
    PROFILE:"/pages/profile",
    PROJECTS:"/pages/getAllProjects",
    TASKS:"/pages/getAllTaskByUser",
    CALENDAR:"/pages/calendar",
    CHARTS:"/pages/charts"
};

export const PUBLIC_ROUTES = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT,
    ROUTES.RESET,
    ROUTES.UNAUTHORIZED,
    ROUTES.LANDING
];

export const BLOCK_WHEN_LOGGED_IN = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT,
    ROUTES.RESET,
    ROUTES.UNAUTHORIZED,
    ROUTES.LANDING
];

export const PROTECTED_ROUTES = [
    "/pages",
];