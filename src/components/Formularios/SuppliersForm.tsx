    import React from "react";
    import { Modal, TextField } from "@mui/material";
    import Swal from "sweetalert2";
    import { useTranslation } from "react-i18next";
    import { SuppliersFormController } from "./SuppliersForm.controller";
    import { useClassifyContext } from "../../hooks/useClassifyContext";
    import type { Status } from "../../types/collections";
import UserPermissions from "../../hooks/usePremission";

    type SuppliersFormProps = {
    openModal: boolean;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    mode: string;
    call?: string;
    status?: Status[];
    };

    export default function SuppliersForm({ openModal, setOpenModal, mode, call }: SuppliersFormProps) {
    const { suppliersState, suppliersDispatch, role } = useClassifyContext();
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
        💾 Guardar proveedor
    ============================================================ */
    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            const missingFields = validateMissingSupplierFields();

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

            const resp = await SuppliersFormController.createSupplier(
                suppliersState.supplierForm,
                mode,
                suppliersState.supplierList[0]
            );

            if (resp) {
                await Swal.fire({
                icon: "success",
                title: t("suppliers.alertSuccess", { defaultValue: "Proveedor guardado correctamente" }),
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

                suppliersDispatch({ type: "clear-state" });
                setOpenModal(false);
                if(call != "component") window.location.reload()
            } else {
                await Swal.fire({
                icon: "error",
                title: t("suppliers.alertError", { defaultValue: "Error al guardar el proveedor" }),
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
        ✅ Validación de campos faltantes
        ============================================================ */
        const validateMissingSupplierFields = () => {
        const s = suppliersState.supplierForm;
        const missing: string[] = [];

        if (!s.name.trim()) missing.push("Nombre");
        if (!s.alias.trim()) missing.push("Alias");
        if (!s.rfc.trim()) missing.push("RFC");
        if (!s.vin.trim()) missing.push("VIN");
        if (!s.address.trim()) missing.push("Dirección");
        if (!s.email.trim()) missing.push("Correo electrónico");
        if (!s.phone_number.trim()) missing.push("Teléfono");
        if (!s.postal_code.trim()) missing.push("Código postal");

        return missing;
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
        <div className=" flex flex-col bg-white shadow-lg w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2 transition-all duration-300 dark:bg-slate-800 dark:text-cyan-300 ">
            {/* BODY */}
            <div className="overflow-auto p-5">
            <form className="grid grid-cols-2 gap-5" onSubmit={handleSubmit}>
                <TextField
                variant='filled'
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
                variant='filled'
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
                variant='filled'
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
                variant='filled'
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
                variant='filled'
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
                variant='filled'
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
                variant='filled'
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
                variant='filled'
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

            <UserPermissions permission="saveSupplier" role={role}> 
                <button
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
            </UserPermissions>
            </div>
        </div>
        </Modal>
    );
    }
