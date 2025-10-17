import React, { useEffect, useState, type ChangeEvent } from 'react';
import { Autocomplete, Modal, TextField } from '@mui/material'
import { type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { TiMinusOutline } from "react-icons/ti";
import { entryFormController } from './EntryForm.controller';
import type { Clients, Status, Supplier } from '../../types/collections';
import { useClassifyContext } from '../../hooks/useClassifyContext';

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
        "& .MuiInputBase-root": {
            color: "text.primary", // hereda del tema
            backgroundColor: "background.paper",
        },
        "& .MuiInputLabel-root": {
            color: "text.secondary",
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#06b6d4", // cyan-500
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0891b2", // cyan-600
        },
    }
    
    useEffect(() => {
        if(openModal && mode == "create" || mode == "edit" ){
            if (inputValue.trim() !== "") {
                entryFormController.getSuppliers(inputValue,mode).then((resp: any) => {
                    setSuppliers(resp);
                });
            } else {
                setSuppliers([]);
            }
        }
    }, [inputValue]);

    useEffect(() => {
        if(openModal && mode == "create" || mode == "edit" ){
            if (inputCValue.trim() !== "") {
                entryFormController.getClient(inputCValue,mode).then((resp: any) => {
                    setClients(resp);
                });
            } else {
                setClients([])
            }
        }
    }, [inputCValue]);

    useEffect(()=>{
        if( openModal && mode == "edit" ){
            entryFormController.getClient(entryState.entryList[0].id_client,mode).then((resp: any) => {
                setClients(resp);
            });
            entryFormController.getSuppliers(entryState.entryList[0].id_supplier,mode).then((resp: any) => {
                setSuppliers(resp);
            });
        }
    },[openModal])

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
                        <TextField sx={inputText} type="text" name="invoice_number" id="invoice_number" value={entryState.entryForm.invoice_number} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label={t("Entrys.form.invoice")} />
                        <TextField sx={inputText} type="text" name="tax_id" id="tax_id" value={entryState.entryForm.tax_id} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>entryDispatch({ type:'change-textfield', payload:{e:e} })} label="TAX" />
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
                            <TextField sx={inputText}  {...params} required label={t("Entrys.form.supplier")} />
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
                            <TextField sx={inputText}  {...params} required label={t("Entrys.form.client")} />
                            )}
                        />
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
