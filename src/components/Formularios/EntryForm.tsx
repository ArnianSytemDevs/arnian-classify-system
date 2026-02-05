import React, { useEffect, useState, useCallback, useMemo, type ChangeEvent} from 'react';
import { Autocomplete, Modal, TextField } from '@mui/material';
import { type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { EntryFormController } from './EntryForm.controller';
import type { Clients, Status, Supplier } from '../../types/collections';
import { useClassifyContext } from '../../hooks/useClassifyContext';
import { pb } from '../../helpers/pocketbase/pocketbase';
import { FaRegWindowClose } from "react-icons/fa";
import UserPermissions from '../../hooks/usePremission';
import { IoMdPersonAdd } from "react-icons/io";
import { BsBuildingFillAdd } from "react-icons/bs";
import Swal from "sweetalert2";
import SuppliersForm from './SuppliersForm';
import ClientsForm from './ClientsForm';

type EntryFormProops = {
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
    mode: string;
    status: Status[];
}

export default function EntryForm({ openModal, setOpenModal, mode, status }: EntryFormProops) {
    const { entryState, entryDispatch, role } = useClassifyContext();
    const { t } = useTranslation();

    // Estados Locales
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [clients, setClients] = useState<Clients[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [inputCValue, setInputCValue] = useState("");
    const [openSModal, setOpenSModal] = useState(false);
    const [openCModal, setOpenCModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // 🔒 Control de idempotencia

    // Estilos de Material UI (Tus estilos originales)
    const inputText = {
        "& .MuiFilledInput-root": {
            backgroundColor: "rgba(255,255,255,1)",
            transition: "none",
            "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
            "&.Mui-focused": { backgroundColor: "rgba(255,255,255,1)" },
            "&.Mui-disabled": { backgroundColor: "rgba(255,255,255,0.7)" },
        },
        "& .MuiInputBase-root": { color: "text.primary" },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#06b6d4" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0891b2" },
    };

    // 🔹 Búsquedas Optimizadas (Debounce)
    const fetchData = useCallback(async (type: 'supplier' | 'client', query: string) => {
        const trimmed = query.trim();
        try {
            if (type === 'supplier') {
                const resp = trimmed ? await EntryFormController.getSuppliers(trimmed, mode) : [];
                setSuppliers(resp);
            } else {
                const resp = trimmed ? await EntryFormController.getClients(trimmed, mode) : [];
                setClients(resp);
            }
        } catch (err) {
            console.error(`❌ Error buscando ${type}:`, err);
        }
    }, [mode]);

    useEffect(() => {
        if (!openModal) return;
        const delay = setTimeout(() => fetchData('supplier', inputValue), 600);
        return () => clearTimeout(delay);
    }, [inputValue, openModal, fetchData]);

    useEffect(() => {
        if (!openModal) return;
        const delay = setTimeout(() => fetchData('client', inputCValue), 600);
        return () => clearTimeout(delay);
    }, [inputCValue, openModal, fetchData]);

    // 🔹 Carga inicial en modo Edición (Idempotente)
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!openModal || mode !== "edit") return;
            const entry = entryState.entryList[0];
            
            if (!entry?.id_client || !entry?.id_supplier) {
                entryDispatch({ type: 'edit-entry', payload: { suppliers: [], status, clients: [] } });
                return;
            }

            try {
                const [clientResp, supplierResp] = await Promise.all([
                    EntryFormController.getClients(entry.id_client, "edit", true),
                    EntryFormController.getSuppliers(entry.id_supplier, "edit", true),
                ]);
                setClients(clientResp);
                setSuppliers(supplierResp);
                entryDispatch({ type: 'edit-entry', payload: { suppliers: supplierResp, status, clients: clientResp } });
            } catch (err) {
                console.error("❌ Error inicial:", err);
            }
        };
        fetchInitialData();
    }, [openModal, mode, entryState.entryList, status, entryDispatch]);

    // 🔹 Validación (Memoizada para evitar cálculos en cada render)
    const isValid = useMemo(() => {
        const rate = entryState.entryForm;
        return !!(
            rate.public_key &&
            rate.invoice_number &&
            rate.tax_id &&
            rate.id_client &&
            rate.id_supplier &&
            rate.files?.length > 0
        );
    }, [entryState.entryForm]);

    // 🔹 Manejo de Envío
    const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; // 🔒 Evita duplicados si ya se está enviando

        setIsSubmitting(true);
        const resp = await EntryFormController.submitEntry(
            entryState.entryForm,
            status,
            mode,
            entryState.entryList[0]
        );

        if (resp) {
            await Swal.fire({
                icon: "success",
                title: t("Alerts.txtEntrySucces"),
                timer: 1500,
                showConfirmButton: false,
                didOpen: (el) => el.style.zIndex = "20000"
            });
            entryDispatch({ type: "clear-state" });
            setOpenModal(false);
            window.location.reload();
        } else {
            await Swal.fire({
                icon: "error",
                title: t("Alerts.txtEntryError"),
                didOpen: (el) => el.style.zIndex = "20000"
            });
        }
        setIsSubmitting(false);
    };

    const renderPreview = (file: File | string) => {
        if (file instanceof File) {
            const fileType = file.type;
            if (fileType.startsWith("image/")) return <img src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover rounded border" />;
            if (fileType === "application/pdf") return <span className="text-red-500 text-2xl">📄</span>;
            return <span className="text-gray-500 text-2xl">📦</span>;
        }
        if (typeof file === "string") {
            const lower = file.toLowerCase();
            const url = pb.files.getURL(entryState.entryList[0], file);
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) {
                return <img src={url} alt={file} className="w-20 h-20 object-cover rounded border" />;
            }
            return <div className="flex flex-col items-center text-red-500">📄 <span className="text-xs truncate w-20">{file}</span></div>;
        }
        return null;
    };

    return (
        <Modal open={openModal} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="flex flex-col bg-white shadow-lg w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2 transition-all duration-300 dark:bg-slate-800 dark:text-cyan-300">
                <div className="overflow-auto p-5 dark:bg-slate-800">
                    <form className="grid grid-cols-2 gap-5">
                       <TextField sx={inputText} variant='filled' type="text" name="public_key" id="public_key" value={entryState.entryForm.public_key} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.entry")} />
                        <TextField sx={inputText} variant='filled' type="text" name="id_load" id="id_load" value={entryState.entryForm.id_load} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.load")} />
                        <TextField sx={inputText} variant='filled' type="text" name="invoice_number" id="invoice_number" value={entryState.entryForm.invoice_number} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.invoice")} />
                        <TextField sx={inputText} variant='filled' type="text" name="tax_id" id="tax_id" value={entryState.entryForm.tax_id} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label="TAX" />
                        
                        <div className="flex flex-row">
                            <Autocomplete
                                className="w-full"
                                options={suppliers}
                                value={entryState.entryForm.id_supplier}
                                getOptionLabel={(option) => `${option.name} (${option.alias || ''})`}
                                inputValue={inputValue}
                                onInputChange={(_, val) => setInputValue(val)}
                                onChange={(_, val) => entryDispatch({ type: "change-autocomplete-entry", payload: { field: "id_supplier", value: val } })}
                                renderInput={(params) => <TextField sx={inputText} variant='filled' {...params} required label={t("Entrys.form.supplier")} />}
                            />
                            <a onClick={() => setOpenSModal(true)} className="w-[20%] transition flex justify-center items-center rounded-md text-white text-4xl bg-cyan-600 hover:bg-cyan-700 cursor-pointer">
                                <BsBuildingFillAdd className="w-full" />
                            </a>
                        </div>

                        <div className="flex flex-row">
                            <Autocomplete
                                className="w-full"
                                options={clients}
                                value={entryState.entryForm.id_client}
                                getOptionLabel={(option) => `${option.name}`}
                                inputValue={inputCValue}
                                onInputChange={(_, val) => setInputCValue(val)}
                                onChange={(_, val) => entryDispatch({ type: "change-autocomplete-entry", payload: { field: "id_client", value: val } })}
                                renderInput={(params) => <TextField sx={inputText} variant='filled' {...params} required label={t("Entrys.form.client")} />}
                            />
                            <a onClick={() => setOpenCModal(true)} className="w-[20%] transition flex justify-center items-center rounded-md text-white text-4xl bg-cyan-600 hover:bg-cyan-700 cursor-pointer">
                                <IoMdPersonAdd className="w-full" />
                            </a>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 dark:text-cyan-300">Archivos</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                onChange={(e) => e.target.files && entryDispatch({ type: "add-files", payload: { files: e.target.files } })}
                                className="block w-full text-sm text-gray-700 border border-cyan-500 rounded-lg cursor-pointer bg-cyan-50 dark:bg-slate-800 dark:text-gray-200 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                            />
                            <br />
                            {entryState.entryForm.files?.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {entryState.entryForm.files.map((file: any, index: number) => (
                                        <div key={index} className="flex flex-col items-center justify-center border rounded-lg p-1 bg-gray-50 hover:bg-gray-100 text-center dark:text-black">
                                            <button
                                                type="button"
                                                className="cursor-pointer hover:bg-red-300 self-end"
                                                onClick={() => entryDispatch({ type: "delete-file", payload: { file: file.name || file.toString() } })}
                                            >
                                                <FaRegWindowClose className="text-md text-red-500" />
                                            </button>
                                            <div
                                                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 p-3"
                                                onClick={() => window.open(file instanceof File ? URL.createObjectURL(file) : pb.files.getURL(entryState.entryList[0], file))}
                                            >
                                                {renderPreview(file)}
                                                <span className="mt-2 text-xs truncate w-24">{file.name || file.toString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 dark:bg-slate-800">
                    <button
                        onClick={() => { setOpenModal(false); entryDispatch({ type: "clear-form" }); }}
                        className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <UserPermissions permission="saveEntry" role={role}>
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid || isSubmitting}
                            className={isValid && !isSubmitting ? "px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer" : "px-4 py-2 rounded-md bg-gray-600 text-white cursor-not-allowed"}
                        >
                            {isSubmitting ? "..." : (mode === "create" ? t("Entrys.form.btnCreate") : t("Entrys.form.btnUpdate"))}
                        </button>
                    </UserPermissions>
                </div>

                <SuppliersForm openModal={openSModal} setOpenModal={setOpenSModal} mode="create" call={"component"} />
                <ClientsForm openModal={openCModal} setOpenModal={setOpenCModal} mode="create" call={"component"} />
            </div>
        </Modal>
    );
}