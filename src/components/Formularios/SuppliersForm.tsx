    import React from "react";
    import { Modal, TextField } from "@mui/material";
    import { IoMdCloseCircleOutline } from "react-icons/io";
    import { TiMinusOutline } from "react-icons/ti";
    import { useTranslation } from "react-i18next";
    import { SuppliersFormController } from "./SuppliersForm.controller";
    import { useClassifyContext } from "../../hooks/useClassifyContext";
    import type { Status } from "../../types/collections";

    type SuppliersFormProps = {
    openModal: boolean;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    mode: string;
    status?: Status[];
    };

    export default function SuppliersForm({ openModal, setOpenModal, mode }: SuppliersFormProps) {
    const { suppliersState, suppliersDispatch } = useClassifyContext();
    const { t } = useTranslation();

    /* ============================================================
        🎨 Estilos MUI
    ============================================================ */
    const inputText = {
        "& .MuiInputBase-root": {
        color: "text.primary",
        backgroundColor: "background.paper",
        },
        "& .MuiInputLabel-root": {
        color: "text.secondary",
        },
        "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "divider",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#06b6d4",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0891b2",
        },
    };

    /* ============================================================
        💾 Guardar proveedor
    ============================================================ */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const resp = await SuppliersFormController.createSupplier(
        suppliersState.supplierForm,
        mode,
        suppliersState.supplierList[0]
        );

        if (resp) {
        window.alert(
            t("suppliers.alertSuccess", { defaultValue: "Proveedor guardado correctamente" })
        );
        suppliersDispatch({ type: "clear-state" });
        setOpenModal(false);
        window.location.reload();
        } else {
        window.alert(
            t("suppliers.alertError", { defaultValue: "Error al guardar el proveedor" })
        );
        }
    };

    /* ============================================================
        ✅ Validación básica
    ============================================================ */
    const isValid = () => {
        const s = suppliersState.supplierForm;
        return (
        s.name.trim() !== "" &&
        s.alias.trim() !== "" &&
        s.rfc.trim() !== "" &&
        s.vin.trim() !== "" &&
        s.address.trim() !== "" &&
        s.email.trim() !== "" &&
        s.phone_number.trim() !== "" &&
        s.postal_code.trim() !== ""
        );
    };

    /* ============================================================
        🧱 Render principal
    ============================================================ */
    return (
        <Modal
        open={openModal}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
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
                {mode === "edit" ? t("suppliers.edit") : t("suppliers.create")}
            </p>
            </div>

            {/* BODY */}
            <div className="overflow-auto p-5">
            <form className="grid grid-cols-2 gap-5" onSubmit={handleSubmit}>
                <TextField
                sx={inputText}
                type="text"
                id="name"
                label="Nombre"
                value={suppliersState.supplierForm.name}
                onChange={(e) =>
                    suppliersDispatch({ type: "change-textfield", payload: { e } })
                }
                required
                fullWidth
                />

                <TextField
                sx={inputText}
                type="text"
                id="alias"
                label="Alias"
                value={suppliersState.supplierForm.alias}
                onChange={(e) =>
                    suppliersDispatch({ type: "change-textfield", payload: { e } })
                }
                fullWidth
                />

                <TextField
                sx={inputText}
                type="text"
                id="rfc"
                label="RFC"
                value={suppliersState.supplierForm.rfc}
                onChange={(e) =>
                    suppliersDispatch({ type: "change-textfield", payload: { e } })
                }
                required
                fullWidth
                />

                <TextField
                sx={inputText}
                type="text"
                id="vin"
                label="VIN"
                value={suppliersState.supplierForm.vin}
                onChange={(e) =>
                    suppliersDispatch({ type: "change-textfield", payload: { e } })
                }
                fullWidth
                />

                <TextField
                sx={inputText}
                type="text"
                id="address"
                label="Dirección"
                value={suppliersState.supplierForm.address}
                onChange={(e) =>
                    suppliersDispatch({ type: "change-textfield", payload: { e } })
                }
                required
                fullWidth
                />

                <TextField
                sx={inputText}
                type="text"
                id="postal_code"
                label="Código Postal"
                value={suppliersState.supplierForm.postal_code}
                onChange={(e) =>
                    suppliersDispatch({ type: "change-textfield", payload: { e } })
                }
                required
                fullWidth
                />

                <TextField
                sx={inputText}
                type="email"
                id="email"
                label="Correo"
                value={suppliersState.supplierForm.email}
                onChange={(e) =>
                    suppliersDispatch({ type: "change-textfield", payload: { e } })
                }
                required
                fullWidth
                />

                <TextField
                sx={inputText}
                type="tel"
                id="phone_number"
                label="Teléfono"
                value={suppliersState.supplierForm.phone_number}
                onChange={(e) =>
                    suppliersDispatch({ type: "change-textfield", payload: { e } })
                }
                required
                fullWidth
                />
            </form>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 dark:bg-slate-800">
            <button
                onClick={() => {
                setOpenModal(false);
                suppliersDispatch({ type: "clear-form" });
                }}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
            >
                Cancelar
            </button>

            <button
                disabled={!isValid()}
                type="submit"
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
