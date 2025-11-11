import { pb } from "./pocketbase";

export class SessionManager {
    private static refreshInterval: ReturnType<typeof setInterval> | null = null;

    // 🧠 Inicializa la sesión persistente
    static init() {
        console.log("🔐 Inicializando sesión persistente...");
        pb.authStore.loadFromCookie(document.cookie);

        // Activa almacenamiento local persistente
        pb.authStore.onChange(() => {
        document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
        });

        // Si hay token válido, arrancamos el refresco automático
        if (pb.authStore.isValid) {
        this.startAutoRefresh();
        }
    }

    // 🔁 Refresca el token cada cierto tiempo
    static startAutoRefresh(intervalMinutes = 15) {
        // Limpia intervalos previos
        if (this.refreshInterval) clearInterval(this.refreshInterval);

        this.refreshInterval = setInterval(async () => {
        try {
            if (pb.authStore.isValid) {
            await pb.collection("users").authRefresh();
            console.log("✅ Token de PocketBase renovado automáticamente");
            }
        } catch (err) {
            console.warn("⚠️ Fallo al refrescar token, limpiando sesión:", err);
            pb.authStore.clear();
        }
        }, intervalMinutes * 60 * 1000); // cada 15 min (ajustable)
    }

    // 🚪 Limpia sesión completamente
    static clear() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        pb.authStore.clear();
        document.cookie = "";
    }
}
