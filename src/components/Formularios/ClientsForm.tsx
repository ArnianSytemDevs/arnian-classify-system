import React, { type ChangeEvent } from "react";
import { Modal, TextField } from "@mui/material";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { TiMinusOutline } from "react-icons/ti";
import { FaRegWindowClose } from "react-icons/fa";
import { pb } from "../../helpers/pocketbase/pocketbase";
import { useTranslation } from "react-i18next";
import { ClientsFormController } from "./ClientsForm.controller";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import type { Status } from "../../types/collections";

type ClientsFormProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string; // 'create' | 'edit'
  status?: Status[];
};

export default function ClientsForm({ openModal, setOpenModal, mode }: ClientsFormProps) {
  const { clientsState, clientsDispatch } = useClassifyContext();
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
    const resp = await ClientsFormController.createClient(
      clientsState.clientForm,
      mode,
      clientsState.clientList[0]
    );

    if (resp) {
      window.alert(
        t("clients.alertSuccess", { defaultValue: "Cliente guardado correctamente" })
      );
      clientsDispatch({ type: "clear-state" });
      setOpenModal(false);
      window.location.reload();
    } else {
      window.alert(
        t("clients.alertError", { defaultValue: "Error al guardar el cliente" })
      );
    }
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
        {/* HEADER */}
        <div className="flex items-center gap-3 p-4 border-b shadow-sm sticky top-0 bg-white dark:bg-slate-800 z-10">
          <button
            onClick={() => setOpenModal(false)}
            className="bg-gray-100 hover:bg-gray-300 p-1 text-3xl text-red-500 rounded-sm cursor-pointer"
          >
            <IoMdCloseCircleOutline />
          </button>
          <button
            onClick={() => setOpenModal(false)}
            className="bg-gray-100 hover:bg-gray-300 p-1 text-3xl text-cyan-500 rounded-sm cursor-pointer"
          >
            <TiMinusOutline />
          </button>
          <p className="ml-1 text-xl sm:text-3xl text-cyan-800 font-semibold dark:text-cyan-300">
            {mode === "edit" ? t("clients.edit") : t("clients.create")}
          </p>
        </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-cyan-300">
                Imágenes / Archivos
              </label>
              <input type="file" multiple onChange={handleFileChange} className="mb-4" />

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

          <button
            disabled={!isValid()}
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
        </div>
      </div>
    </Modal>
  );
}
