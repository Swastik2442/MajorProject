for (const varName of [
    "VITE_NMS_URL",
    "VITE_API_URL",
    "VITE_APP_URL",
    "VITE_APP_TITLE",
    "VITE_CLERK_PUBLISHABLE_KEY"
]) {
    if (!(import.meta.env[varName])) {
        throw new Error(`${varName} not set! Please set ${varName} in your .env file.`);
    }
}

export const API_KEY_TEMP_STORAGE_KEY = "nms.temp.apiKey";

export const SEVERITY_COLORS = {
    notClassified: "#6b7280",
    information: "#10b981",
    warning: "#eab308",
    average: "#3b82f6",
    high: "#f59e0b",
    disaster: "#ef4444",
} as const;
