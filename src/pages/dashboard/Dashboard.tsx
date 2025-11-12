import { useEffect } from "react";
import Swal from "sweetalert2";
import MenuComponent from "../../components/Menu/MenuComponent";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import Clients from "../Clients/Clients";
import Entrys from "../Entrys/Entrys";
import Products from "../Products/Products";
import Suppliers from "../Suppliers/Suppliers";
import { pb } from "../../helpers/pocketbase/pocketbase";
import { SessionManager } from "../../helpers/pocketbase/SessionManager";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export default function Dashboard() {

  const { selectedWindow } = useClassifyContext();
  const navigate = useNavigate()
  const {t} = useTranslation()

  useEffect(() => {
    // ⚙️ Empuja el estado inicial al historial
    window.history.pushState(null, "", window.location.href);

    const handlePopState = async () => {
      // 🔒 Volver a la misma página
      window.history.pushState(null, "", window.location.href);

      // 💬 Mostrar advertencia con SweetAlert2
      await Swal.fire({
        icon: "warning",
        title: t("Alerts.txtSessionStatus") ,
        html: `
          <p>${t("Alerts.txtSessionStatusMsg") }.</p>
          <p class="mt-2 text-gray-700 dark:text-gray-500">
            Usa el botón <b>'Cerrar sesión'</b> para salir correctamente.
          </p>
        `,
        confirmButtonText: t("Alerts.txtSessionStatusConfirm") ,
        confirmButtonColor: "#0ea5e9",
        background: "#f8fafc",
        color: "#1e293b",
      });
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue =
        "¿Estás seguro de que quieres salir? Usa 'Cerrar sesión' para hacerlo correctamente.";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      Swal.fire({
        icon: "warning",
        title: t("Alerts.txtSessionExpired") ,
        text: t("Alerts.txtSessionExpiredMsg") ,
      }).then(() => {
        SessionManager.clear();
        navigate("/");
      });
    }
  }, []);

  return (
    <div className="w-screen h-screen flex flex-row dark:bg-gray-500">
      <MenuComponent />
      <div className="w-full h-full max-h-[100%] overscroll-auto">
        {selectedWindow === 0 || selectedWindow === 1 ? <Products /> : null}
        {selectedWindow === 2 ? <Entrys /> : null}
        {selectedWindow === 3 ? <Clients /> : null}
        {selectedWindow === 4 ? <Suppliers /> : null}
      </div>
    </div>
  );
}
