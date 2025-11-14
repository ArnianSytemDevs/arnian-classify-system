import { pb } from "./pocketbase";

export class SessionManager {
    private static refreshInterval: ReturnType<typeof setInterval> | null = null;

    static init() {
        console.log("🔐 Initializing persistent session...");
        pb.authStore.loadFromCookie(document.cookie);

        // 🔁 Sincronizar automáticamente cuando cambie el authStore
        pb.authStore.onChange(() => {
        document.cookie = pb.authStore.exportToCookie({
            httpOnly: false,
            sameSite: "Lax",
            secure: true
        });
        });

        // Si hay sesión válida, inicia el refresco automático
        if (pb.authStore.isValid) {
        console.log("✅ Valid session detected, starting auto-refresh");
        this.startAutoRefresh();
        } else {
        console.warn("⚠️ No valid session found");
        }
    }

    static startAutoRefresh(intervalMinutes = 15) {
        if (this.refreshInterval) clearInterval(this.refreshInterval);

        this.refreshInterval = setInterval(async () => {
        try {
            if (pb.authStore.isValid) {
            await pb.collection("users").authRefresh();
            console.log("♻️ PocketBase token automatically refreshed");
            }
        } catch (err) {
            console.warn("⚠️ Failed to refresh token, clearing session:", err);
            pb.authStore.clear();
        }
        }, intervalMinutes * 60 * 1000);
    }

    static clear() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        pb.authStore.clear();
        document.cookie = "";
    }
}

