import { loginUser } from '../../helpers/pocketbase/Users';
import Cookies from 'js-cookie'
import { SystemInitializer } from '../../helpers/pocketbase/SystemInitializer';
import { pb } from '../../helpers/pocketbase/pocketbase';

class HomeController {
    public static async login(email: string, pass: string) {
        try {
            const resp: any = await loginUser(email, pass);

            if (resp?.status === 400 || !resp?.token) {
                console.warn("❌ Credenciales inválidas o token ausente.");
                return false;
            }

            // ✅ Si autenticó correctamente, guardamos datos en cookies
            Cookies.set("avatar", resp.record.avatar);
            Cookies.set("email", resp.record.email);
            Cookies.set("id", resp.record.id);
            Cookies.set("name", resp.record.name);
            Cookies.set("token", resp.token);
            Cookies.set("categoryUser", resp.record.id_category_user);

            // 🚀 Inicializar datos base del sistema
            try {
                console.log("⚙️ Verificando datos del sistema...");
                await SystemInitializer.initializeSystemData();
                console.log("✅ Datos base del sistema verificados correctamente.");
            } catch (initError) {
                console.error("⚠️ Error durante la inicialización del sistema:", initError);
            }

            return true;
        } catch (err) {
            console.error("❌ Error general en login:", err);
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
