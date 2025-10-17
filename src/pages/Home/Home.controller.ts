import { loginUser } from '../../helpers/pocketbase/Users';
import Cookies from 'js-cookie'

class HomeController {
    public static async login(email: string, pass: string) {
        try {
            const resp: any = await loginUser(email, pass);
            if (resp?.status === 400 || !resp?.token) {
                // error
                return false;
            }
            // si autenticó bien
            Cookies.set("avatar", resp.record.avatar);
            Cookies.set("email", resp.record.email);
            Cookies.set("id", resp.record.id);
            Cookies.set("name", resp.record.name);
            Cookies.set("token", resp.token);
            return true;
        } catch (err) {
            console.error("Login error:", err);
            return false;
        }
    }
}

export default HomeController;
