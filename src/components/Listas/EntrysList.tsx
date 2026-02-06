import { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import type { Clients, Entry, Status, Supplier } from "../../types/collections";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import { EntrysController } from "./Entrys.controller";
import type { EntryFilters } from "../../types/forms";
import { Autocomplete, FormControl, MenuItem, Modal, Select, Switch, TextField, type SelectChangeEvent } from "@mui/material";
import NoPhoto from "../../../public/assets/NotPhoto.png"
import { pb } from "../../helpers/pocketbase/pocketbase";
import { useTranslation } from "react-i18next";
import { FaSquare } from "react-icons/fa6";
import { FaCheckSquare } from "react-icons/fa";

type EntrysListProops = {
    status: Status[];
};

export default function EntrysList({ status }: EntrysListProops) {
    const { entryState, entryDispatch } = useClassifyContext();
    const [openMod, setOpenMod] = useState(false);
    const [entrys, setEntrys] = useState<Entry[]>([]);
    
    // 🔹 Estados para Autocomplete
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null); // ✅ Persistencia visual
    const [inputValue, setInputValue] = useState("");
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);

    const [clients, setClients] = useState<Clients[]>([]);
    const [selectedClient, setSelectedClient] = useState<Clients | null>(null); // ✅ Persistencia visual
    const [inputCValue, setInputCValue] = useState("");
    const [loadingClients, setLoadingClients] = useState(false);

    const { t } = useTranslation();

    const [filters, setFilters] = useState<EntryFilters>({
        id: "",
        public_key: "",
        id_load: "",
        id_tax: "",
        invoice_number: "",
        is_disabled: false,
        id_supplier: "",
        id_author: "",
        id_status: "",
        id_client: "",
        created: "",
        updated: "",
    });

    const thBody = "px-5 py-4 text-sm font-mono font-light text-left text-gray-800 dark:text-gray-200";
    const thHead = "px-5 py-2 font-semibold transition text-left text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-t-md";

    const inputText = {
        "& .MuiInputBase-root": {
            color: "text.primary",
            backgroundColor: "background.paper",
        },
        "& .MuiInputLabel-root": { color: "text.secondary" },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#06b6d4" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0891b2" },
    };

    const inputText2 = {
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

    /* 🔹 Autocomplete Suppliers (Con Debounce) */
    useEffect(() => {
        let active = true;
        const delayDebounceFn = setTimeout(() => {
            if (inputValue.trim() !== "") {
                setLoadingSuppliers(true);
                EntrysController.getSuppliers(inputValue, "create")
                    .then((resp: any) => {
                        if (active) {
                            setSuppliers(resp || []); // ✅ Evita undefined
                        }
                    })
                    .catch(() => {
                        if (active) setSuppliers([]);
                    })
                    .finally(() => setLoadingSuppliers(false));
            } else {
                setSuppliers([]);
            }
        }, 500); // ⏱️ Espera 500ms antes de buscar

        return () => {
            active = false;
            clearTimeout(delayDebounceFn);
        };
    }, [inputValue]);

    /* 🔹 Autocomplete Clients (Con Debounce) */
    useEffect(() => {
        let active = true;
        const delayDebounceFn = setTimeout(() => {
            if (inputCValue.trim() !== "") {
                setLoadingClients(true);
                EntrysController.getClient(inputCValue, "create")
                    .then((resp: any) => {
                        if (active) {
                            setClients(resp || []); // ✅ Evita undefined
                        }
                    })
                    .catch(() => {
                        if (active) setClients([]);
                    })
                    .finally(() => setLoadingClients(false));
            } else {
                setClients([]);
            }
        }, 500);

        return () => {
            active = false;
            clearTimeout(delayDebounceFn);
        };
    }, [inputCValue]);

    /* 🔹 Filtro Principal de Entradas */
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            EntrysController.getEntrys(setEntrys, filters);
        }, 800);

        return () => {
            clearTimeout(delayDebounce);
            EntrysController.unsubscribe();
        };
    }, [filters]);

    const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFilters((prev) => ({ ...prev, [name]: checked }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    /* 🔹 Handlers de Selección Segura */
    const handleSupplierChange = (_: any, newValue: Supplier | null) => {
        setSelectedSupplier(newValue); // ✅ Guarda el objeto entero visualmente
        setFilters((prev) => ({
            ...prev,
            id_supplier: newValue ? newValue.id : "",
        }));
    };

    const handleClientChange = (_: any, newValue: Clients | null) => {
        setSelectedClient(newValue); // ✅ Guarda el objeto entero visualmente
        setFilters((prev) => ({
            ...prev,
            id_client: newValue ? newValue.id : "",
        }));
    };

    const renderImage = (file: string[], record: Entry) => {
        if (record.file?.length > 0) {
            const fileName = file[0];
            const lower = fileName.toLowerCase();
            const url = pb.files.getURL(record, fileName);
            const handleOpen = () => window.open(url, "_blank");

            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) {
                return (
                    <img src={url || NoPhoto} alt={fileName} className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80" onClick={handleOpen} />
                );
            }
            if (lower.endsWith(".pdf")) {
                return (
                    <div onClick={handleOpen} className="flex flex-row hover:border-1 hover:border-pink-500 items-center text-pink-500 cursor-pointer hover:opacity-80">
                        📄 <span className="text-sm truncate ">{fileName}</span>
                    </div>
                );
            }
            if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
                return (
                    <div onClick={handleOpen} className="flex flex-col items-center text-blue-500 cursor-pointer hover:opacity-80">
                        📝 <span className="text-xs truncate w-20">{fileName}</span>
                    </div>
                );
            }
            return (
                <div onClick={handleOpen} className="flex flex-col items-center text-gray-500 cursor-pointer hover:opacity-80">
                    📦 <span className="text-xs truncate w-20">{fileName}</span>
                </div>
            );
        } else {
            return <img src={NoPhoto} alt="Sin imagen" className="w-20 h-20 object-cover rounded border opacity-70" />;
        }
    };

    return (
        <>
            <div className=" p-5 gap-5 flex flex-row w-250 " >
                <TextField
                    name="public_key"
                    sx={inputText2}
                    variant="filled"
                    label={t("Entrys.form.entry")}
                    value={filters.public_key}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    name="id_load"
                    sx={inputText2}
                    variant="filled"
                    label={t("Entrys.form.load")}
                    value={filters.id_load}
                    onChange={handleChange}
                    fullWidth
                />
            </div>
            <table className="w-full border-collapse">
                <thead className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800">
                    <tr>
                        <th className="px-2 py-2 rounded-t-md font-semibold transition text-gray-700 dark:text-gray-200">
                            <button
                                className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition"
                                onClick={() => setOpenMod(true)}
                            >
                                <FaFilter className="text-gray-600 dark:text-cyan-300" />
                            </button>
                        </th>
                        <th className={thHead}>{t("Entrys.form.entry")}</th>
                        <th className={thHead}>{t("Entrys.form.load")}</th>
                        <th className={thHead}>{t("Entrys.form.document")}</th>
                        <th className={thHead}>TAX ID</th>
                        <th className={thHead}>{t("Entrys.form.invoice")}</th>
                        <th className={thHead}>{t("Entrys.form.created")}</th>
                        <th className={thHead}>{t("Entrys.form.status")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {entrys.map((ent) => (
                        <tr
                            key={ent.id}
                            onClick={() => {
                                entryDispatch({
                                    type: "change-box",
                                    payload: {
                                        entry: ent,
                                        status: !entryState.entryList.some(item => item.id === ent.id),
                                    },
                                });
                            }}
                            className="hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer "
                        >
                            <td className={thBody}>
                                {entryState.entryList.some(item => item.id === ent.id) ? (<FaCheckSquare className=" text-xl text-sky-600 border-1 border-gray-500 rounded-xs " />) : (<FaSquare className=" text-xl text-white border-1 border-gray-500 rounded-xs " />)}
                            </td>
                            <td className={thBody}>{ent.public_key}</td>
                            <td className={thBody}>{ent.id_load}</td>
                            <td className={thBody}>{renderImage(ent.file, ent)}</td>
                            <td className={thBody}>{ent.id_tax}</td>
                            <td className={thBody}>{ent.invoice_number}</td>
                            <td className={thBody}>
                                {new Date(ent.created).toLocaleString("es-MX", {
                                    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                                })}
                            </td>
                            <td
                                className={`${thBody} underline decoration-2`}
                                style={{
                                    color: `#${status.find((st) => st.id === ent.id_status)?.color || "FFF"}`,
                                    fontWeight: "bold",
                                }}
                            >
                                {status.length !== 0 ? status.find((st) => st.id === ent.id_status)?.name || "N/A" : "N/A"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal
                open={openMod}
                onClose={() => setOpenMod(false)}
                sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
                <div className="flex flex-col bg-white dark:bg-slate-800 shadow-lg w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2 transition-all duration-300 rounded-lg overflow-y-auto">
                    <div className="grid grid-cols-2 gap-5 p-5 text-gray-800 dark:text-gray-200">
                        <TextField sx={inputText} name="public_key" label={t("Entrys.form.entry")} value={filters.public_key} onChange={handleChange} fullWidth />
                        <TextField sx={inputText} name="id_load" label={t("Entrys.form.load")} value={filters.id_load} onChange={handleChange} fullWidth />
                        <TextField sx={inputText} name="id_tax" label="TAX" value={filters.id_tax} onChange={handleChange} fullWidth />
                        <TextField sx={inputText} name="invoice_number" label={t("Entrys.form.invoice")} value={filters.invoice_number} onChange={handleChange} fullWidth />

                        <FormControl>
                            <label className="text-gray-700 dark:text-gray-300">Deshabilitado</label>
                            <Switch id="is_disabled" name="is_disabled" checked={filters.is_disabled} onChange={handleSwitch} />
                        </FormControl>

                        <FormControl fullWidth>
                            <Select sx={{ background: "#FFF" }} id="id_status" name="id_status" value={filters.id_status} onChange={handleChange} displayEmpty>
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                {status.map((st) => (
                                    <MenuItem key={st.id} value={st.id}>{st.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* 🔹 Autocomplete Supplier FIX */}
                        <Autocomplete
                            sx={{ width: '100%', ...inputText }} // Combino estilos
                            id="id_supplier"
                            disablePortal
                            loading={loadingSuppliers} // Spinner nativo
                            loadingText="Buscando..."
                            noOptionsText="Sin resultados"
                            options={suppliers}
                            value={selectedSupplier} // ✅ Uso el estado del objeto, no busco en array
                            getOptionLabel={(option) => option ? `${option.name} (${option.alias})` : ""}
                            isOptionEqualToValue={(option, value) => option.id === value.id} // ✅ Evita duplicados/warnings
                            inputValue={inputValue}
                            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                            onChange={handleSupplierChange}
                            renderInput={(params) => <TextField {...params} label={t("Entrys.form.supplier")} fullWidth />}
                        />

                        {/* 🔹 Autocomplete Client FIX */}
                        <Autocomplete
                            sx={{ width: '100%', ...inputText }}
                            id="id_client"
                            disablePortal
                            loading={loadingClients}
                            loadingText="Buscando..."
                            noOptionsText="Sin resultados"
                            options={clients}
                            value={selectedClient} // ✅ Uso el estado del objeto
                            getOptionLabel={(option) => option ? `${option.name}` : ""}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            inputValue={inputCValue}
                            onInputChange={(_, newInputValue) => setInputCValue(newInputValue)}
                            onChange={handleClientChange}
                            renderInput={(params) => <TextField {...params} label={t("Entrys.form.client")} fullWidth />}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}