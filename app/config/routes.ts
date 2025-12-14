export const ROUTES = {
    HOME: "/pages/HomeContent",
    LOGIN: "/pages/login",
    REGISTER: "/pages/register",
    FORGOT: "/pages/forgotPassword",
    RESET: "/pages/resetPassword",
    UNAUTHORIZED: "/pages/unauthorized",
};

export const PUBLIC_ROUTES = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT,
    ROUTES.RESET,
];

export const BLOCK_WHEN_LOGGED_IN = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT,
    ROUTES.RESET,
];

export const PROTECTED_ROUTES = [
    "/pages",
];