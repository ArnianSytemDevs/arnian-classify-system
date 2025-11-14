import { useState, useEffect } from 'react'
import { useTranslation } from "react-i18next";
import { MdCreateNewFolder, MdEditSquare } from "react-icons/md";
import { FaTrashAlt, FaListAlt } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { useClassifyContext } from '../../hooks/useClassifyContext';
import EntrysList from '../../components/Listas/EntrysList';
import type { Status } from '../../types/collections';
import EntryForm from '../../components/Formularios/EntryForm';
import { EntrysController } from './Entrys.controller';
import { useNavigate } from 'react-router';
import { FaSearchDollar } from "react-icons/fa";
import { checkRole } from '../../hooks/usePremission.controller';
import UserPermissions from '../../hooks/usePremission';
import Swal from 'sweetalert2';

export default function Products() {

    const navigate = useNavigate()
    const { t } = useTranslation();
    const { entryState,classifyDispatch,role,setRole } = useClassifyContext();
    const [mode, setMode] = useState("create");
    const [status, setStatus] = useState<Status[]>([]);
    const [option, setOption] = useState(1);
    const [open, setOpen] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const btnBase =
        "px-5 py-3 rounded-md w-full transition items-center justify-left flex flex-rows gap-2";
    const btnUnselected = `${btnBase} hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 cursor-pointer`;
    const btnSelected = `${btnBase} bg-gray-200 dark:bg-slate-700 text-cyan-800 dark:text-cyan-300`;
    const btnDisabled = `${btnBase} text-gray-400 dark:text-gray-500 cursor-not-allowed`;

    useEffect(() => {
        EntrysController.getStatus().then((resp: any) => {
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

    /** 🔹 Eliminar registros seleccionados */
    const handleDeleteEntry = async () => {
        if (entryState.entryList.length <= 0) {
            Swal.fire({
            icon: "info",
            title: t("Alerts.txtWarningNoentry", { defaultValue: "No hay entradas seleccionadas" }),
            text: t("Alerts.txtWarningNoentryMsg", { defaultValue: "Selecciona una o más entradas antes de eliminar." }),
            confirmButtonText: "Entendido",
            confirmButtonColor: "#3085d6",
            });
            return;
        }

        const confirm = await Swal.fire({
            title: t("Entrys.confirmDelete", { defaultValue: "¿Deseas eliminar las entradas seleccionadas?" }),
            text: t("Entrys.alertDeleteProductMsg", {
            defaultValue: "Esta acción eliminará permanentemente las entradas seleccionadas. ¿Deseas continuar?",
            }),
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: t("Entrys.btnDelete", { defaultValue: "Sí, eliminar" }),
            cancelButtonText: t("Classify.alerts.txtReturnWarningDecline", { defaultValue: "Cancelar" }),
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        });

        if (!confirm.isConfirmed) {
            Swal.fire({
            icon: "info",
            title: t("Entrys.cancelProcces", { defaultValue: "Operación cancelada" }),
            text: t("Entrys.cancelProccesMsg", { defaultValue: "No se eliminaron las entradas." }),
            timer: 1500,
            showConfirmButton: false,
            });
            return;
        }

        // 🔥 Ejecutar eliminación
        const success = await EntrysController.deleteEntrys(entryState.entryList, status);

        if (success) {
            Swal.fire({
            icon: "success",
            title: t("Entrys.alertDeleteProductOkMsg", { defaultValue: "Entradas eliminadas correctamente." }),
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
            }).then(() => {
            setRefresh((prev) => !prev); // 🔄 Forzar recarga del listado
            });
        } else {
            Swal.fire({
            icon: "error",
            title: t("Entrys.alertError", { defaultValue: "Error al eliminar las entradas." }),
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
            });
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
                    <FaListAlt className="text-md" /> {t("Entrys.btnGet")}
                </button>

                <br />
                <UserPermissions permission='createEntry' role={role} >
                    <button
                        onClick={() => {
                            setOpen(true);
                            setMode("create");
                        }}
                        className={option === 2 ? btnSelected : btnUnselected}
                    >
                        <MdCreateNewFolder className="text-md" /> {t("Entrys.btnCreate")}
                    </button>
                </UserPermissions>

                <br />
                <UserPermissions permission='editEntry' role={role} >
                    <button
                        disabled={
                            entryState.entryList.length > 1 ||
                            entryState.entryList.length === 0
                        }
                        onClick={() => {
                            setOpen(true);
                            setMode("edit");
                        }}
                        className={
                            entryState.entryList.length > 1 ||
                            entryState.entryList.length === 0
                                ? btnDisabled
                                : option === 3
                                ? btnSelected
                                : btnUnselected
                        }
                    >
                        <MdEditSquare className="text-md" /> {t("Entrys.btnUpdate")}
                    </button>
                </UserPermissions>
                <br />
                <UserPermissions permission='deleteEntry' role={role} >
                    <button
                        disabled={entryState.entryList.length <= 0}
                        onClick={handleDeleteEntry} // ✅ Ejecuta la función correctamente
                        className={
                            entryState.entryList.length === 0
                                ? btnDisabled
                                : btnUnselected
                        }
                    >
                        <FaTrashAlt className="text-md" /> {t("Entrys.btnDelete")}
                    </button>
                </UserPermissions>
                <br />
                <button
                    disabled={
                        entryState.entryList.length > 1 ||
                        entryState.entryList.length === 0
                    }
                    onClick={() => {
                        classifyDispatch({ type:'set-entry', payload:{ entry:entryState.entryList[0] } })
                        setTimeout(() => {
                            navigate("/classify");
                        }, 1000);

                    }}
                    className={
                        entryState.entryList.length > 1 ||
                        entryState.entryList.length === 0
                            ? btnDisabled
                            : option === 3
                            ? btnSelected
                            : btnUnselected
                    }
                >
                    <FaSearchDollar className="text-md" /> { role == "Reviewer"? t("Classify.btnReview") : t("Classify.btnStart")  }
                </button>
            </div>

            {/* Main content */}
            <div className="w-full h-full dark:bg-slate-800 dark:text-cyan-300">
                <div className="px-5 py-5 flex flex-row w-full items-center">
                    <p className="text-3xl text-cyan-800 dark:text-cyan-300 font-semibold">
                        {t("menu.title2")} / {t("Entrys.btnGet")}
                    </p>
                    <button
                        onClick={() => setRefresh(prev => !prev)} // 🔄 Refresca manualmente
                        className="ml-5 p-2 cursor-pointer rounded-2xl text-xl 
                                hover:bg-gray-200 dark:hover:bg-slate-700 
                                transition"
                    >
                        <FiRefreshCw className="hover:animate-spin" />
                    </button>
                </div>

                {/* Listado */}
                <EntrysList status={status} key={refresh ? "ref1" : "ref2"} />

                {/* Modal de formulario */}
                <EntryForm openModal={open} setOpenModal={setOpen} mode={mode} status={status} />
            </div>
        </div>
    );
}
