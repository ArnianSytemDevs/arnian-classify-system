import React, { type ChangeEvent } from "react";
import { Modal, TextField } from "@mui/material";
import Swal from "sweetalert2";
import { FaRegWindowClose } from "react-icons/fa";
import { pb } from "../../helpers/pocketbase/pocketbase";
import { useTranslation } from "react-i18next";
import { ClientsFormController } from "./ClientsForm.controller";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import type { Status } from "../../types/collections";
import UserPermissions from "../../hooks/usePremission";

type ClientsFormProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string; // 'create' | 'edit'
  call?: string;
  status?: Status[];
};

export default function ClientsForm({ openModal, setOpenModal, mode, call }: ClientsFormProps) {
  const { clientsState, clientsDispatch,role } = useClassifyContext();
  const { t } = useTranslation();

  /* ============================================================
    🎨 Estilos MUI
  ============================================================ */
  const inputText = {
    "& .MuiFilledInput-root": {
        backgroundColor: "rgba(255,255,255,1)", // o usa theme.palette.background.paper
        transition: "none",
        "&:hover": {
        backgroundColor: "rgba(255,255,255,1)",
        },
        "&.Mui-focused": {
        backgroundColor: "rgba(255,255,255,1)",
        },
        "&.Mui-disabled": {
        backgroundColor: "rgba(255,255,255,0.7)",
        },
    },
    "& .MuiInputBase-root": {
        color: "text.primary",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#06b6d4" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0891b2" },
    };

  /* ============================================================
     📸 Manejo de archivos (imágenes)
  ============================================================ */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      clientsDispatch({
        type: "add-files",
        payload: { image: Array.from(e.target.files) }, // ✅ conversión segura
      });
    }
  };

  /* ============================================================
     🖼️ Renderizar vista previa
  ============================================================ */
  const renderPreview = (file: File | string) => {
    // Caso 1: archivo local (nuevo)
    if (file instanceof File) {
      const fileType = file.type;

      if (fileType.startsWith("image/")) {
        const previewURL = URL.createObjectURL(file);
        return (
          <img
            src={previewURL}
            alt={file.name}
            className="w-20 h-20 object-cover rounded border"
            onLoad={() => URL.revokeObjectURL(previewURL)} // ✅ evita fugas
          />
        );
      }
      if (fileType === "application/pdf") return <span className="text-red-500 text-2xl">📄</span>;
      if (fileType.includes("word") || fileType.includes("msword"))
        return <span className="text-blue-500 text-2xl">📝</span>;
      return <span className="text-gray-500 text-2xl">📦</span>;
    }

    // Caso 2: archivo guardado en PocketBase
    if (typeof file === "string") {
      const lower = file.toLowerCase();
      const record = clientsState.clientList[0]; // ✅ se usa el primer cliente seleccionado
      if (!record) return null;

      // Compatibilidad con ambas versiones del SDK
      const url = pb.files.getURL?.(record, file) ?? pb.files.getUrl(record, file);

      if (/\.(jpg|jpeg|png|webp|gif)$/.test(lower)) {
        return (
          <img src={url} alt={file} className="w-20 h-20 object-cover rounded border" />
        );
      }

      if (lower.endsWith(".pdf"))
        return (
          <div className="flex flex-col items-center text-red-500">
            📄 <span className="text-xs truncate w-20">{file}</span>
          </div>
        );

      if (lower.endsWith(".doc") || lower.endsWith(".docx"))
        return (
          <div className="flex flex-col items-center text-blue-500">
            📝 <span className="text-xs truncate w-20">{file}</span>
          </div>
        );

      return (
        <div className="flex flex-col items-center text-gray-500">
          📦 <span className="text-xs truncate w-20">{file}</span>
        </div>
      );
    }

    return null;
  };

  /* ============================================================
     💾 Guardar cliente
  ============================================================ */
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const missingFields = validateMissingClientFields();

    if (missingFields.length > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        html: `
          <p>Faltan los siguientes campos por completar:</p>
          <ul style="text-align: left; margin-top: 10px; color: #ef4444;">
            ${missingFields.map((f) => `<li>• ${f}</li>`).join("")}
          </ul>
        `,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
        background: "#f9fafb",
        color: "#1e293b",
        customClass: {
          popup: "swal-over-modal",
        },
        didOpen: (el) => {
          el.style.zIndex = "20000";
        },
      });
      return;
    }

    const resp = await ClientsFormController.createClient(
      clientsState.clientForm,
      mode,
      clientsState.clientList[0]
    );

    if (resp) {
      await Swal.fire({
        icon: "success",
        title: t("clients.alertSuccess", { defaultValue: "Cliente guardado correctamente" }),
        confirmButtonColor: "#22c55e",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: "swal-over-modal",
        },
        didOpen: (el) => {
          el.style.zIndex = "20000";
        },
      });

      clientsDispatch({ type: "clear-state" });
      setOpenModal(false);
      if(call != "component") window.location.reload();
    } else {
      await Swal.fire({
        icon: "error",
        title: t("clients.alertError", { defaultValue: "Error al guardar el cliente" }),
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-over-modal",
        },
        didOpen: (el) => {
          el.style.zIndex = "20000";
        },
      });
    }
  };

  /* ============================================================
    ✅ Validación detallada
  ============================================================ */
  const validateMissingClientFields = () => {
    const c = clientsState.clientForm;
    const missing: string[] = [];

    if (!c.name.trim()) missing.push("Nombre");
    if (!c.alias.trim()) missing.push("Alias");
    if (!c.field.trim()) missing.push("Giro o campo de negocio");
    if (!c.rfc.trim()) missing.push("RFC");
    if (!c.address.trim()) missing.push("Dirección");
    if (!c.email.trim()) missing.push("Correo electrónico");
    if (!c.postal_code || c.postal_code === 0) missing.push("Código postal");

    return missing;
  };


  /* ============================================================
     ✅ Validación simple
  ============================================================ */
  const isValid = () => {
    const c = clientsState.clientForm;
    return (
      c.name.trim() !== "" &&
      c.alias.trim() !== "" &&
      c.field.trim() !== "" &&
      c.rfc.trim() !== "" &&
      c.address.trim() !== "" &&
      c.email.trim() !== "" &&
      c.postal_code !== 0
    );
  };

  /* ============================================================
      🧱 Render principal
  ============================================================ */
  return (
    <Modal open={openModal} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div
        className="
          flex flex-col bg-white shadow-lg
          w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2
          transition-all duration-300
          dark:bg-slate-800 dark:text-cyan-300
        "
      >

        {/* BODY */}
        <div className="overflow-auto p-5">
          <form className="grid grid-cols-2 gap-5">
            <TextField
              variant='filled'
              sx={inputText}
              type="text"
              id="name"
              label="Nombre"
              value={clientsState.clientForm.name}
              onChange={(e) => clientsDispatch({ type: "change-textfield", payload: { e } })}
              required
              fullWidth
            />

            <TextField
              variant='filled'
              sx={inputText}
              type="text"
              id="alias"
              label="Alias"
              value={clientsState.clientForm.alias}
              onChange={(e) => clientsDispatch({ type: "change-textfield", payload: { e } })}
              required
              fullWidth
            />

            <TextField
              variant='filled'
              sx={inputText}
              type="text"
              id="field"
              label="Giro o campo"
              value={clientsState.clientForm.field}
              onChange={(e) => clientsDispatch({ type: "change-textfield", payload: { e } })}
              required
              fullWidth
            />

            <TextField
              variant='filled'
              sx={inputText}
              type="text"
              id="rfc"
              label="RFC"
              value={clientsState.clientForm.rfc}
              onChange={(e) => clientsDispatch({ type: "change-textfield", payload: { e } })}
              required
              fullWidth
            />

            <TextField
              variant='filled'
              sx={inputText}
              type="text"
              id="address"
              label="Dirección"
              value={clientsState.clientForm.address}
              onChange={(e) => clientsDispatch({ type: "change-textfield", payload: { e } })}
              required
              fullWidth
            />

            <TextField
              variant='filled'
              sx={inputText}
              type="number"
              id="postal_code"
              label="Código postal"
              value={clientsState.clientForm.postal_code}
              onChange={(e) => clientsDispatch({ type: "change-textfield", payload: { e } })}
              required
              fullWidth
            />

            <TextField
              variant='filled'
              sx={inputText}
              type="email"
              id="email"
              label="Correo"
              value={clientsState.clientForm.email}
              onChange={(e) => clientsDispatch({ type: "change-textfield", payload: { e } })}
              required
              fullWidth
            />

            {/* IMÁGENES */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2 dark:text-cyan-300">
                Archivos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 
                          border border-cyan-500 rounded-lg cursor-pointer 
                          bg-cyan-50 dark:bg-slate-800 dark:text-gray-200 
                          focus:outline-none file:mr-4 file:py-2 file:px-4 
                          file:rounded-md file:border-0 
                          file:text-sm file:font-semibold 
                          file:bg-cyan-600 file:text-white 
                          hover:file:bg-cyan-700"
              />
              <br/>
              {clientsState.clientForm.image.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {clientsState.clientForm.image.map((file: File | string) => (
                    <div
                      key={file instanceof File ? file.name : file.toString()}
                      className="flex flex-col items-center border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 dark:text-black"
                    >
                      <button
                        className="cursor-pointer hover:bg-red-300 self-end"
                        onClick={(e) => {
                          e.preventDefault();
                          clientsDispatch({
                            type: "delete-file",
                            payload: { file: file instanceof File ? file.name : file.toString() },
                          });
                        }}
                      >
                        <FaRegWindowClose className="text-md text-red-500" />
                      </button>
                      {renderPreview(file)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 dark:bg-slate-800">
          <button
            onClick={() => {
              setOpenModal(false);
              clientsDispatch({ type: "clear-form" });
            }}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
          >
            Cancelar
          </button>
          <UserPermissions permission="saveClient" role={role} >
            <button
              onClick={handleSubmit}
              className={
                isValid()
                  ? "px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                  : "px-4 py-2 rounded-md bg-gray-500 text-white cursor-not-allowed"
              }
            >
              {mode === "edit"
                ? t("actions.save", { defaultValue: "Guardar" })
                : t("actions.create", { defaultValue: "Crear" })}
            </button>
          </UserPermissions>
        </div>
      </div>
    </Modal>
  );
}
