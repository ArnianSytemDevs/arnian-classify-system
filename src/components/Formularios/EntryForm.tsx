import React, { useEffect, useState, type ChangeEvent } from 'react';
import { Autocomplete, Modal, TextField } from '@mui/material'
import { type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { TiMinusOutline } from "react-icons/ti";
import { entryFormController } from './EntryForm.controller';
import type { Clients, Status, Supplier } from '../../types/collections';
import { useClassifyContext } from '../../hooks/useClassifyContext';
import { pb } from '../../helpers/pocketbase/pocketbase';
import { FaRegWindowClose } from "react-icons/fa";

type EntryFormProops = {
    openModal:boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>
    mode:string
    status:Status[]
}

export default function EntryForm({openModal,setOpenModal,mode,status}:EntryFormProops) {

    const { entryState,entryDispatch } = useClassifyContext()
    const { t } = useTranslation();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [clients,setClients] = useState<Clients[]>([])
    const [inputValue, setInputValue] = useState("");
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
        entryFormController.getSuppliers(trimmed, mode)
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
        entryFormController.getClient(trimmed, mode)
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
        if (!entry || !entry.id_client || !entry.id_supplier) return;

        try {
        const [clientResp, supplierResp] :any= await Promise.all([
            entryFormController.getClient(entry.id_client, mode),
            entryFormController.getSuppliers(entry.id_supplier, mode),
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
            rate.id_supplier != null
    }

    const handleSubmit = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        entryFormController.createEntry(entryState.entryForm,status,mode,entryState.entryList[0]).then((resp)=>{
            if(resp){
                window.alert(`${t("Entrys.alerSucces")}`)
                entryDispatch({type:'clear-state'})
                setOpenModal(false)
                window.location.reload()
            }else{
                window.alert(`${t("Entrys.alertError")}`)
            }
        })
    }

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
                <div className="flex items-center gap-3 p-4 border-b shadow-sm sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <button
                    onClick={() => setOpenModal(false)}
                    className="bg-gray-100 hover:bg-gray-300 p-1 text-3xl text-red-500 rounded-sm cursor-pointer"
                    >
                    <IoMdCloseCircleOutline />
                    </button>
                    {/* <button className="bg-gray-100 hover:bg-gray-300 p-1 text-3xl text-green-500 rounded-sm cursor-pointer">
                    <FaRegSave />
                    </button> */}
                    <button onClick={(()=>setOpenModal(false))} className="bg-gray-100 hover:bg-gray-300 p-1 text-3xl text-cyan-500 rounded-sm cursor-pointer">
                    <TiMinusOutline />
                    </button>
                    <p className="ml-1 text-xl sm:text-3xl text-cyan-800 font-semibold dark:text-cyan-300">
                    {t("Entrys.btnCreate")}
                    </p>
                </div>
                <div className=" overflow-auto p-5 dark:bg-slate-800">
                    <form className=" grid grid-cols-2 gap-5 " >
                        <TextField sx={inputText} variant='filled' type="text" name="public_key" id="public_key" value={entryState.entryForm.public_key} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.public_key")} />
                        <TextField sx={inputText} variant='filled' type="text" name="invoice_number" id="invoice_number" value={entryState.entryForm.invoice_number} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.invoice")} />
                        <TextField sx={inputText} variant='filled' type="text" name="tax_id" id="tax_id" value={entryState.entryForm.tax_id} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label="TAX" />
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

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-cyan-300">
                            Archivos
                            </label>
                            <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="mb-4"
                            />
            
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
                    <button disabled={!isValid()} onClick={(e)=>{ handleSubmit(e) }} className={isValid() ? "px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer":"px-4 py-2 rounded-md bg-gray-600 text-white cursor-not-allowed"}>
                        {mode == "create"? t("Entrys.form.btnCreate"):t("Entrys.form.btnUpdate")}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
