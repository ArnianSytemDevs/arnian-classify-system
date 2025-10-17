import type { Config } from "tailwindcss";

export default {
    darkMode: "class", // 👈 forzamos uso de clase
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
} satisfies Config;
