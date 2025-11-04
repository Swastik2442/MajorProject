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
