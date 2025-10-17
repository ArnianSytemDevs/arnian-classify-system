import Cookies from "js-cookie"
import { pb } from "./pocketbase";

/* =======================================================
  LOGIN
======================================================= */
export const loginUser = async (identity: string, password: string) => {
  try {
    if (!identity || !password) {
      throw new Error("Email/usuario y contraseña son requeridos");
    }

    const authData = await pb.collection("users").authWithPassword(
      identity,
      password
    );

    // Guardar token en cookies
    Cookies.set("token", pb.authStore.token, {
      secure: true,
      sameSite: "strict",
    });

    return authData;
  } catch (error: any) {
    console.error("Error en login:", error);
    throw error;
  }
};