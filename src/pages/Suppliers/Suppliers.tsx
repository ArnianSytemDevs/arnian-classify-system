import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MdCreateNewFolder, MdEditSquare } from "react-icons/md";
import { FaTrashAlt, FaListAlt } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import type { Status } from "../../types/collections";
import { SuppliersController } from "./Suppliers.controller";
import SuppliersForm from "../../components/Formularios/SuppliersForm";
import SuppliersList from "../../components/Listas/SupplierList";
import { checkRole } from "../../hooks/usePremission.controller";
import UserPermissions from "../../hooks/usePremission";

export default function Suppliers() {
  const { t } = useTranslation();
  const { suppliersState, suppliersDispatch,role,setRole } = useClassifyContext();
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState<Status[]>([]);
  const [option, setOption] = useState(1);
  const [open, setOpen] = useState(false);

  // ============================================================
  // 🎨 Estilos de botones
  // ============================================================
  const btnBase =
    "px-5 py-3 rounded-md w-full transition items-center justify-left flex flex-rows gap-2";
  const btnUnselected = `${btnBase} hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 cursor-pointer`;
  const btnSelected = `${btnBase} bg-gray-200 dark:bg-slate-700 text-cyan-800 dark:text-cyan-300`;
  const btnDisabled = `${btnBase} text-gray-400 dark:text-gray-500 cursor-not-allowed`;

  // ============================================================
  // 📦 Cargar lista de estados
  // ============================================================
  useEffect(() => {
    SuppliersController.getStatus().then((resp: any) => {
      setStatus(resp);
    });
  }, []);

  useEffect(() => {
      const getRole = async () => {
          const userRole = await checkRole();
          setRole(userRole);
      };
      getRole();
  }, []);

  // ============================================================
  // 🗑️ Eliminar (marcar como eliminado)
  // ============================================================
  const handleDeleteSupplier = async () => {
    if (suppliersState.supplierList.length <= 0) return;
    const confirmDelete = window.confirm(
      t("Suppliers.confirmDelete", {
        defaultValue: "¿Deseas eliminar los proveedores seleccionados?",
      })
    );

    if (!confirmDelete) return;

    const success = await SuppliersController.deleteSuppliers(
      suppliersState.supplierList,
      status
    );

    if (success) {
      alert(
        t("Suppliers.alertSuccess", {
          defaultValue: "Proveedores eliminados correctamente.",
        })
      );
      window.location.reload()
    } else {
      alert(
        t("Suppliers.alertError", {
          defaultValue: "Error al eliminar los proveedores.",
        })
      );
    }
  };

  // ============================================================
  // 🧱 Render principal
  // ============================================================
  return (
    <div className="w-full h-full flex flex-row">
      {/* Sidebar */}
      <div
        className="bg-gray-50 dark:bg-slate-800 h-full w-[20%] items-start p-5 
                    text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600"
      >
        <button className="p-5 w-full items-center border-b border-gray-300 dark:border-gray-600">
          {t("submenu")}
        </button>

        <br />
        <button
          onClick={() => setOption(1)}
          className={option === 1 ? btnSelected : btnUnselected}
        >
          <FaListAlt className="text-md" /> {t("Suppliers.btnGet", { defaultValue: "Ver lista" })}
        </button>

        <br />
        <UserPermissions permission='createSuppliers' role={role} >
          <button
            onClick={() => {
              setOpen(true);
              setMode("create");
            }}
            className={option === 2 ? btnSelected : btnUnselected}
          >
            <MdCreateNewFolder className="text-md" /> {t("Suppliers.btnCreate", { defaultValue: "Nuevo" })}
          </button>
        </UserPermissions>

        <br />
        <UserPermissions permission='editSuppliers' role={role} >
          <button
            disabled={
              suppliersState.supplierList.length > 1 ||
              suppliersState.supplierList.length === 0
            }
            onClick={() => {
              setMode("edit");
              suppliersDispatch({ type: "edit-supplier" });
              setOpen(true);
            }}
            className={
              suppliersState.supplierList.length > 1 ||
              suppliersState.supplierList.length === 0
                ? btnDisabled
                : option === 3
                ? btnSelected
                : btnUnselected
            }
          >
            <MdEditSquare className="text-md" /> {t("Suppliers.btnUpdate", { defaultValue: "Editar" })}
          </button>
        </UserPermissions>

        <br />
        <UserPermissions permission='deleteSuppliers' role={role} >
          <button
            disabled={suppliersState.supplierList.length <= 0}
            onClick={handleDeleteSupplier}
            className={
              suppliersState.supplierList.length === 0
                ? btnDisabled
                : btnUnselected
            }
          >
            <FaTrashAlt className="text-md" /> {t("Suppliers.btnDelete", { defaultValue: "Eliminar" })}
          </button>
        </UserPermissions>

        <br />
      </div>

      {/* Main content */}
      <div className="w-full h-full dark:bg-slate-800 dark:text-cyan-300">
        <div className="px-5 py-5 flex flex-row w-full items-center">
          <p className="text-3xl text-cyan-800 dark:text-cyan-300 font-semibold">
            {t("menu.title2")} / {t("Suppliers.btnGet", { defaultValue: "Proveedores" })}
          </p>
          <button
            className="ml-5 p-2 cursor-pointer rounded-2xl text-xl 
                        hover:bg-gray-200 dark:hover:bg-slate-700 
                        transition"
          >
            <FiRefreshCw className="hover:animate-spin" />
          </button>
        </div>
        <div className=' max-h-[90%] overflow-auto ' >
          {/* Listado */}
          <SuppliersList status={status} />
        </div>

        {/* Modal de formulario */}
        <SuppliersForm
          openModal={open}
          setOpenModal={setOpen}
          mode={mode}
          status={status}
        />
      </div>
    </div>
  );
}
