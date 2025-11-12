import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

export const usePreventNavigation = () => {
  const {t} = useTranslation()
  useEffect(() => {
    // 🔹 Interceptar cierre, recarga o F5
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Necesario para que algunos navegadores muestren el diálogo nativo
    };

    // 🔹 Interceptar botón "atrás" del navegador
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();

      Swal.fire({
        title: t("Alerts.txtCloseProccess") ,
        text: t("Alerts.txtCloseProccessMsg") ,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("Alerts.txtCloseProccessConfim") ,
        cancelButtonText: t("Alerts.txtCloseProccessDecline") ,
        confirmButtonColor: "#ef4444",
      }).then((result) => {
        if (result.isConfirmed) {
          window.removeEventListener("beforeunload", handleBeforeUnload);
          window.history.back(); // permitir volver solo si confirma
        } else {
          window.history.pushState(null, "", window.location.href); // mantener en la misma vista
        }
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Evita que retroceda automáticamente al montar
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
};
