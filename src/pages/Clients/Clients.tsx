import { useState, useEffect } from 'react'
import { useTranslation } from "react-i18next";
import { MdCreateNewFolder, MdEditSquare } from "react-icons/md";
import { FaTrashAlt, FaListAlt } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { useClassifyContext } from '../../hooks/useClassifyContext';
import type { Status } from '../../types/collections';
import { ClientsController } from './Clients.controller';
import ClientsForm from '../../components/Formularios/ClientsForm';
import ClientsList from '../../components/Listas/ClientsList';

export default function Clients() {

    const { t } = useTranslation();
    const { clientsState,clientsDispatch } = useClassifyContext();
    const [mode, setMode] = useState("create");
    const [status, setStatus] = useState<Status[]>([]);
    const [option, setOption] = useState(1);
    const [open, setOpen] = useState(false);

    const btnBase =
        "px-5 py-3 rounded-md w-full transition items-center justify-left flex flex-rows gap-2";
    const btnUnselected = `${btnBase} hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 cursor-pointer`;
    const btnSelected = `${btnBase} bg-gray-200 dark:bg-slate-700 text-cyan-800 dark:text-cyan-300`;
    const btnDisabled = `${btnBase} text-gray-400 dark:text-gray-500 cursor-not-allowed`;

    useEffect(() => {
        ClientsController.getStatus().then((resp: any) => {
            setStatus(resp);
        });
    }, []);

    /** 🔹 Eliminar registros seleccionados */
    const handleDeleteEntry = async () => {
        if (clientsState.clientList.length <= 0) return;
        const confirmDelete = window.confirm(`${t("Clients.confirmDelete", { defaultValue: "¿Deseas eliminar las entradas seleccionadas?" })}`);

        if (!confirmDelete) return;

        const success = await ClientsController.deleteClients(clientsState.clientList,status);
        if (success) {
            alert(t("Clients.alertSuccess", { defaultValue: "Entradas eliminadas correctamente." }));
        } else {
            alert(t("Clients.alertError", { defaultValue: "Error al eliminar las entradas." }));
        }
    };

    return (
        <div className="w-full h-full flex flex-row">
            {/* Sidebar */}
            <div className="bg-gray-50 dark:bg-slate-800 h-full w-[20%] items-start p-5 
                            text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                <button className="p-5 w-full items-center border-b border-gray-300 dark:border-gray-600">
                    {t("submenu")}
                </button>

                <br />
                <button
                    onClick={() => setOption(1)}
                    className={option === 1 ? btnSelected : btnUnselected}
                >
                    <FaListAlt className="text-md" /> {t("Clients.btnGet")}
                </button>

                <br />
                <button
                    onClick={() => {
                        setOpen(true);
                        setMode("create");
                    }}
                    className={option === 2 ? btnSelected : btnUnselected}
                >
                    <MdCreateNewFolder className="text-md" /> {t("Clients.btnCreate")}
                </button>

                <br />
                <button
                    disabled={
                        clientsState.clientList.length > 1 ||
                        clientsState.clientList.length === 0
                    }
                    onClick={() => {
                        setMode("edit");
                        clientsDispatch({type:"edit-client"})
                        setOpen(true);
                    }}
                    className={
                        clientsState.clientList.length > 1 ||
                        clientsState.clientList.length === 0
                            ? btnDisabled
                            : option === 3
                            ? btnSelected
                            : btnUnselected
                    }
                >
                    <MdEditSquare className="text-md" /> {t("Clients.btnUpdate")}
                </button>

                <br />
                <button
                    disabled={clientsState.clientList.length <= 0}
                    onClick={handleDeleteEntry} // ✅ Ejecuta la función correctamente
                    className={
                        clientsState.clientList.length === 0
                            ? btnDisabled
                            : btnUnselected
                    }
                >
                    <FaTrashAlt className="text-md" /> {t("Clients.btnDelete")}
                </button>

                <br />
            </div>

            {/* Main content */}
            <div className="w-full h-full dark:bg-slate-800 dark:text-cyan-300">
                <div className="px-5 py-5 flex flex-row w-full items-center">
                    <p className="text-3xl text-cyan-800 dark:text-cyan-300 font-semibold">
                        {t("menu.title2")} / {t("Clients.btnGet")}
                    </p>
                    <button // 🔄 Refresca manualmente
                        className="ml-5 p-2 cursor-pointer rounded-2xl text-xl 
                                hover:bg-gray-200 dark:hover:bg-slate-700 
                                transition"
                    >
                        <FiRefreshCw className="hover:animate-spin" />
                    </button>
                </div>

                <div className=' max-h-[90%] overflow-auto ' >
                    {/* Listado */}
                    <ClientsList  status={status} />
                </div>

                {/* Modal de formulario */}
                <ClientsForm openModal={open} setOpenModal={setOpen} mode={mode} status={status} />
            </div>
        </div>
    );
}
