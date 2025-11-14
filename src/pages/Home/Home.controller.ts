import { loginUser } from '../../helpers/pocketbase/Users';
import Cookies from 'js-cookie'
import { SystemInitializer } from '../../helpers/pocketbase/SystemInitializer';
import { pb } from '../../helpers/pocketbase/pocketbase';

class HomeController {
    public static async login(email: string, pass: string) {
        try {
        const resp: any = await loginUser(email, pass);

        if (!resp?.token || resp?.status === 400) {
            console.warn("❌ Invalid credentials or missing token.");
            return false;
        }

        // ✅ Autenticar al authStore directamente (sin depender de pb_auth previo)
        pb.authStore.save(resp.token, resp.record);

        // ✅ Exportar cookie en formato que PocketBase reconoce
        document.cookie = pb.authStore.exportToCookie({
            httpOnly: false,
            sameSite: "Lax",
            secure: true
        });

        // ✅ Guardar tus cookies personalizadas (solo para mostrar datos en UI)
        Cookies.set("avatar", resp.record.avatar);
        Cookies.set("email", resp.record.email);
        Cookies.set("id", resp.record.id);
        Cookies.set("name", resp.record.name);
        Cookies.set("categoryUser", resp.record.id_category_user);

        // 🚀 Inicializar datos base del sistema
        try {
            console.log("⚙️ Verifying base system data...");
            await SystemInitializer.initializeSystemData();
            console.log("✅ System data verified successfully.");
        } catch (initError) {
            console.error("⚠️ Error during system initialization:", initError);
        }

        return true;
        } catch (err) {
        console.error("❌ General login error:", err);
        return false;
        }
    }
    
    public static async logout() {
        try {
        console.log("👋 Cerrando sesión del usuario...");

        // 🧹 Limpiar cookies de sesión
        Cookies.remove("avatar");
        Cookies.remove("email");
        Cookies.remove("id");
        Cookies.remove("name");
        Cookies.remove("token");
        Cookies.remove("categoryUser");

        // 🧾 Limpiar sesión interna de PocketBase (si existe)
        if (pb?.authStore?.isValid) {
            pb.authStore.clear();
        }

        console.log("✅ Sesión cerrada correctamente.");


        return { status: "success", message: "Sesión cerrada correctamente." };
        } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
        return { status: "error", message: "Error al cerrar sesión." };
        }
    }
}

export default HomeController;
