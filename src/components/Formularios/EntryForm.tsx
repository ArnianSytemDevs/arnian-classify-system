import React, { useEffect, useState, type ChangeEvent } from 'react';
import { Autocomplete, Modal, TextField } from '@mui/material'
import { type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next';
import { entryFormController } from './EntryForm.controller';
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
    openModal:boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>
    mode:string
    status:Status[]
}

export default function EntryForm({openModal,setOpenModal,mode,status}:EntryFormProops) {

    const { entryState,entryDispatch, role } = useClassifyContext()
    const { t } = useTranslation();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [clients,setClients] = useState<Clients[]>([])
    const [inputValue, setInputValue] = useState(""); 
    const [openSModal,setOpenSModal] =  useState(false)
    const [openCModal,setOpenCModal] =  useState(false)
    const [inputCValue, setInputCValue] = useState("");
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
    
    // 🔹 Buscar proveedores con retardo (debounce)
    useEffect(() => {
    // Verifica que el modal esté abierto y el modo sea válido
    if (!(openModal && (mode === "create" || mode === "edit"))) return;

    const delay = setTimeout(() => {
        const trimmed = inputValue.trim();

        if (trimmed !== "") {
        entryFormController.getSuppliers(trimmed, "create",false)
            .then((resp: any) => setSuppliers(resp))
            .catch((err) => console.error("❌ Error al cargar proveedores:", err));
        } else {
        setSuppliers([]); // limpia si no hay texto
        }
    }, 800); // 800 ms de espera

    // Limpia el timeout al escribir otra vez o desmontar
    return () => clearTimeout(delay);
    }, [inputValue, openModal, mode]);


    // 🔹 Buscar clientes con retardo (debounce)
    useEffect(() => {
    if (!(openModal && (mode === "create" || mode === "edit"))) return;

    const delay = setTimeout(() => {
        const trimmed = inputCValue.trim();

        if (trimmed !== "") {
        entryFormController.getClient(trimmed, mode,false)
            .then((resp: any) => setClients(resp))
            .catch((err) => console.error("❌ Error al cargar clientes:", err));
        } else {
        setClients([]); // limpia si no hay texto
        }
    }, 800);

    return () => clearTimeout(delay);
    }, [inputCValue, openModal, mode]);


    useEffect(() => {
    const fetchData = async () => {
        // Verificamos condiciones antes de ejecutar
        if (!openModal || mode !== "edit") return;

        const entry = entryState.entryList[0];
        if (!entry || !entry.id_client || !entry.id_supplier){
            entryDispatch({type: 'edit-entry', payload:{ suppliers:suppliers, status:status, clients:clients }});
            setClients([]);
            setSuppliers([]);
            return
        }

        try {
        const [clientResp, supplierResp] :any= await Promise.all([
            entryFormController.getClient(entry.id_client, mode,true),
            entryFormController.getSuppliers(entry.id_supplier, mode, true),
        ]);

        setClients(clientResp);
        setSuppliers(supplierResp);
        } catch (err) {
        console.error("❌ Error al cargar datos de cliente o proveedor:", err);
        }
    };

    fetchData();
    }, [openModal, mode, entryState.entryList]);


    useEffect(()=>{
        if(openModal == true && mode == 'edit' && status.length != 0 && suppliers.length != 0 && clients.length != 0){
            entryDispatch({type: 'edit-entry', payload:{ suppliers:suppliers, status:status, clients:clients }});
        }
    },[suppliers,clients])

    const isValid = () => {
        const rate = entryState.entryForm
        return rate.public_key != "" &&
            rate.invoice_number != "" &&
            rate.tax_id != "" &&
            rate.id_client != null &&
            rate.id_supplier != null &&
            rate.files.length != 0
    }

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        const missingFields = validateMissingEntryFields();

        if (missingFields.length > 0) {
            await Swal.fire({
            icon: "warning",
            title: t("Alerts.txtFields"),
            html: `
                <p>${t("Alerts.txtFieldsMsg")}:</p>
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

        const resp = await entryFormController.createEntry(
            entryState.entryForm,
            status,
            mode,
            entryState.entryList[0]
        );

        if (resp) {
            await Swal.fire({
            icon: "success",
            title: t("Entrys.alerSucces", { defaultValue: t("Alerts.txtEntrySucces") }),
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

            entryDispatch({ type: "clear-state" });
            setOpenModal(false);
            window.location.reload();
        } else {
            await Swal.fire({
            icon: "error",
            title: t("Entrys.alertError", { defaultValue: t("Alerts.txtEntryError") }),
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
    ✅ Validación detallada de campos faltantes
    ============================================================ */
    const validateMissingEntryFields = () => {
    const rate = entryState.entryForm;
    const missing: string[] = [];

    if (!rate.public_key) missing.push("Clave pública");
    // if (!rate.id_load) missing.push("Numero de carga");
    if (!rate.invoice_number) missing.push("Número de factura");
    if (!rate.tax_id) missing.push("TAX ID");
    if (!rate.id_client) missing.push("Cliente");
    if (!rate.id_supplier) missing.push("Proveedor");
    if (!rate.files || rate.files.length === 0) missing.push("Archivo adjunto");

    return missing;
    };


    const renderPreview = (file: File | string) => {
        // 📌 Caso 1: cuando es File del navegador
        if (file instanceof File) {
        const fileType = file.type;

        if (fileType.startsWith("image/")) {
            return (
            <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-20 h-20 object-cover rounded border"
            />
            );
        }

        if (fileType === "application/pdf") {
            return <span className="text-red-500 text-2xl">📄</span>;
        }

        if (
            fileType.includes("word") ||
            fileType.includes("officedocument") ||
            fileType.includes("msword")
        ) {
            return <span className="text-blue-500 text-2xl">📝</span>;
        }

        return <span className="text-gray-500 text-2xl">📦</span>;
        }

        // 📌 Caso 2: cuando es string desde PocketBase
        if (typeof file === "string") {
        const lower = file.toLowerCase();

        // ⚠️ Aquí necesitas el record completo, no solo el id
        const record = entryState.entryList[0]; // o el producto actual
        const url = pb.files.getURL(record, file);

        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) {
            return (
            <img
                src={url}
                alt={file}
                className="w-20 h-20 object-cover rounded border"
            />
            );
        }

        if (lower.endsWith(".pdf")) {
            return (
            <div className="flex flex-col items-center text-red-500">
                📄 <span className="text-xs truncate w-20">{file}</span>
            </div>
            );
        }

        if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
            return (
            <div className="flex flex-col items-center text-blue-500">
                📝 <span className="text-xs truncate w-20">{file}</span>
            </div>
            );
        }

        return (
            <div className="flex flex-col items-center text-gray-500">
            📦 <span className="text-xs truncate w-20">{file}</span>
            </div>
        );
        }

        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            entryDispatch({
            type: "add-files",
            payload: { files: e.target.files },
            });
        }
    };

    return (
        <Modal open={openModal} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="flex flex-col bg-white shadow-lg w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2 transition-all duration-300dark:bg-slate-800 dark:text-cyan-300">
                <div className=" overflow-auto p-5 dark:bg-slate-800">
                    <form className=" grid grid-cols-2 gap-5 " >
                        <TextField sx={inputText} variant='filled' type="text" name="public_key" id="public_key" value={entryState.entryForm.public_key} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.entry")} />
                        <TextField sx={inputText} variant='filled' type="text" name="id_load" id="id_load" value={entryState.entryForm.id_load} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.load")} />
                        <TextField sx={inputText} variant='filled' type="text" name="invoice_number" id="invoice_number" value={entryState.entryForm.invoice_number} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.invoice")} />
                        <TextField sx={inputText} variant='filled' type="text" name="tax_id" id="tax_id" value={entryState.entryForm.tax_id} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label="TAX" />
                        <div className=" flex flex-row " >
                            <Autocomplete
                                className="w-full"
                                id="id_supplier"
                                disablePortal
                                options={suppliers}
                                // 🔑 el value viene de tu reducer (ya guarda el ID seleccionado)
                                value={entryState.entryForm.id_supplier}
                                getOptionLabel={(option) => `${option.name} (${option.alias})`}
                
                                inputValue={inputValue}
                                onInputChange={(_, newInputValue) => {
                                setInputValue(newInputValue); // 🔎 dispara la búsqueda
                                }}
                                // 🔑 aquí usamos tu handle para despachar el ID del supplier
                                onChange={(_, newValue) => {
                                entryDispatch({
                                    type: "change-autocomplete-entry",
                                    payload: { field: "id_supplier", value: newValue },
                                });
                                }}
                                renderInput={(params) => (
                                <TextField sx={inputText} variant='filled'  {...params} required label={t("Entrys.form.supplier")} />
                                )}
                            />
                            <a onClick={()=>setOpenSModal(!openSModal)} className="w-[20%] transition flex justify-center items-center rounded-md text-white text-4xl  bg-cyan-600  hover:bg-cyan-700 cursor-pointer">
                                <BsBuildingFillAdd className="w-full" />
                            </a>
                        </div>
                        <div className=" flex flex-row " >
                            <Autocomplete
                                className="w-full"
                                id="id_client"
                                disablePortal
                                options={clients}
                                // 🔑 el value viene de tu reducer (ya guarda el ID seleccionado)
                                value={entryState.entryForm.id_client}
                                getOptionLabel={(option) => `${option.name} `}
                
                                inputValue={inputCValue}
                                onInputChange={(_, newInputCValue) => {
                                setInputCValue(newInputCValue); // 🔎 dispara la búsqueda
                                }}
                                // 🔑 aquí usamos tu handle para despachar el ID del client
                                onChange={(_, newCValue) => {
                                entryDispatch({
                                    type: "change-autocomplete-entry",
                                    payload: { field: "id_client", value: newCValue },
                                });
                                }}
                                renderInput={(params) => (
                                <TextField sx={inputText} variant='filled'  {...params} required label={t("Entrys.form.client")} />
                                )}
                            />
                            <a onClick={()=>setOpenCModal(!openCModal)} className="w-[20%] transition flex justify-center items-center rounded-md text-white text-4xl  bg-cyan-600  hover:bg-cyan-700 cursor-pointer">
                                <IoMdPersonAdd className="w-full" />
                            </a>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 dark:text-cyan-300">
                                Archivos
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
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
            
                            {entryState.entryForm.files.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {entryState.entryForm.files.map((file: File) => (
                                <div
                                    key={file.name || file.toString()  }
                                    className="flex flex-col items-center justify-center border rounded-lg p-1 bg-gray-50 hover:bg-gray-100 text-center dark:text-black"
                                >
                                    <button
                                    className="cursor-pointer hover:bg-red-300 self-end"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        entryDispatch({
                                        type: "delete-file",
                                        payload: { file: file.name },
                                        });
                                    }}
                                    >
                                    <FaRegWindowClose className="text-md text-red-500 cursor" />
                                    </button>
            
                                    <div
                                    className="w-[100%] h-[100%] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 p-3"
                                    onClick={() => window.open(mode == 'edit'? pb.files.getURL(entryState.entryList[0], file.toString()) : URL.createObjectURL(file))}
                                    >
                                    {renderPreview(file)}
                                    <span className="mt-2 text-xs truncate w-24">{mode == 'edit' ? file.toString() : file.name}</span>
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
                        onClick={() => { setOpenModal(false); setClients([]); setSuppliers([]); entryDispatch({type:"clear-form"}) }  }
                        className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <UserPermissions permission="saveEntry" role={role} >
                        <button onClick={(e)=>{ handleSubmit(e) }} className={isValid() ? "px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer":"px-4 py-2 rounded-md bg-gray-600 text-white cursor-not-allowed"}>
                            {mode == "create"? t("Entrys.form.btnCreate"):t("Entrys.form.btnUpdate")}
                        </button>
                    </UserPermissions>
                </div>
                <SuppliersForm openModal={openSModal} setOpenModal={setOpenSModal} mode="create" call={"component"}/>
                <ClientsForm openModal={openCModal} setOpenModal={setOpenCModal} mode="create" call={"component"}/>
            </div>
        </Modal>
    )
}
