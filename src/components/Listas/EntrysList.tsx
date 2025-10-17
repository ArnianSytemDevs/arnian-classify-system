import { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import type { Clients, Entry, Status, Supplier } from "../../types/collections";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import { EntrysController } from "./Entrys.controller";
import type { EntryFilters } from "../../types/forms";
import { Autocomplete, FormControl, MenuItem, Modal, Select, Switch, TextField, type SelectChangeEvent} from "@mui/material";

type EntrysListProops = {
    status: Status[];
};

export default function EntrysList({ status }: EntrysListProops) {
    const { entryDispatch } = useClassifyContext();
    const [openMod, setOpenMod] = useState(false);
    const [entrys, setEntrys] = useState<Entry[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [clients, setClients] = useState<Clients[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [inputCValue, setInputCValue] = useState("");

    const [filters, setFilters] = useState<EntryFilters>({
        id: "",
        public_key: "",
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

    const thBody =
        "px-5 py-4 text-sm font-mono font-light text-left text-gray-800 dark:text-gray-200";
    const thHead =
        "px-5 py-2 font-semibold transition text-left text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-t-md";

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

    /* 🔹 Autocomplete suppliers */
    useEffect(() => {
        if (inputValue.trim() !== "") {
        EntrysController.getSuppliers(inputValue, "create").then((resp: any) => {
            setSuppliers(resp);
        });
        } else {
        setSuppliers([]);
        }
    }, [inputValue]);

    /* 🔹 Autocomplete clients */
    useEffect(() => {
        if (inputCValue.trim() !== "") {
        EntrysController.getClient(inputCValue, "create").then((resp: any) => {
            setClients(resp);
        });
        } else {
        setClients([]);
        }
    }, [inputCValue]);

    /* 🔹 Realtime entries */
    useEffect(() => {
        EntrysController.getEntrys(setEntrys, filters);
        return () => {
        EntrysController.unsubscribe();
        };
    }, [filters]);

    /* 🔹 Switch handler */
    const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFilters((prev) => ({
        ...prev,
        [name]: checked,
        }));
    };

    /* 🔹 Input / Select change handler */
    const handleChange = (
        e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectChangeEvent
    ) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    /* 🔹 Supplier autocomplete */
    const handleSupplierChange = (_: any, newValue: Supplier | null) => {
        setFilters((prev) => ({
        ...prev,
        id_supplier: newValue ? newValue.id : "",
        }));
    };

    /* 🔹 Client autocomplete */
    const handleClientChange = (_: any, newValue: Clients | null) => {
        setFilters((prev) => ({
        ...prev,
        id_client: newValue ? newValue.id : "",
        }));
    };

    return (
        <>
        <table className="w-full border-collapse">
            <thead className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800">
            <tr>
                <th className="px-2 py-2 rounded-t-md font-semibold transition text-gray-700 dark:text-gray-200">
                <button
                    className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition"
                    onClick={() => {
                    setOpenMod(true);
                    }}
                >
                    <FaFilter className="text-gray-600 dark:text-cyan-300" />
                </button>
                </th>
                <th className={thHead}>TAX ID</th>
                <th className={thHead}>Invoice</th>
                <th className={thHead}>Fecha de creación</th>
                <th className={thHead}>Status</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {entrys.map((ent) => (
                <tr
                key={ent.id}
                className="hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                <td className={thBody}>
                    <input
                    className="w-5 h-5 accent-cyan-600 cursor-pointer"
                    type="checkbox"
                    onChange={(e) => {
                        entryDispatch({
                        type: "change-box",
                        payload: {
                            entry: ent,
                            status: e.target.checked,
                        },
                        });
                    }}
                    />
                </td>
                <td className={thBody}>{ent.id_tax}</td>
                <td className={thBody}>{ent.invoice_number}</td>
                <td className={thBody}>
                    {new Date(ent.created).toLocaleString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    })}
                </td>
                <td
                    className={thBody}
                    style={{
                    color: `#${status.find((st) => st.id === ent.id_status)?.color || "FFF"}`,
                    fontWeight: "bold",
                    }}
                >
                    {status.length !== 0
                    ? status.find((st) => st.id === ent.id_status)?.name || "N/A"
                    : "N/A"}
                </td>
                </tr>
            ))}
            </tbody>
        </table>

        {/* =======================================================
            🔹 MODAL DE FILTROS
        ======================================================= */}
            <Modal
                open={openMod}
                onClose={() => setOpenMod(false)}
                sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
                <div
                className="
                    flex flex-col bg-white dark:bg-slate-800 shadow-lg 
                    w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2 
                    transition-all duration-300 rounded-lg overflow-y-auto
                "
                >
                    <div className="grid grid-cols-2 gap-5 p-5 text-gray-800 dark:text-gray-200">
                        <TextField
                        sx={inputText}
                        name="id_tax"
                        label="TAX"
                        value={filters.id_tax}
                        onChange={handleChange}
                        fullWidth
                        />
                        <TextField
                        sx={inputText}
                        name="invoice_number"
                        label="Invoice"
                        value={filters.invoice_number}
                        onChange={handleChange}
                        fullWidth
                        />

                        <FormControl>
                        <label className="text-gray-700 dark:text-gray-300">
                            Deshabilitado
                        </label>
                        <Switch
                            id="is_disabled"
                            name="is_disabled"
                            checked={filters.is_disabled}
                            onChange={handleSwitch}
                        />
                        </FormControl>

                        <FormControl fullWidth>
                        <Select
                            sx={{ background: "#FFF" }}
                            id="id_status"
                            name="id_status"
                            value={filters.id_status}
                            onChange={handleChange}
                            displayEmpty
                        >
                            <MenuItem value="">
                            <em>Todos</em>
                            </MenuItem>
                            {status.map((st) => (
                            <MenuItem key={st.id} value={st.id}>
                                {st.name}
                            </MenuItem>
                            ))}
                        </Select>
                        </FormControl>

                        {/* 🔹 Autocomplete Supplier */}
                        <Autocomplete
                        sx={{ width:'100%', "& .MuiInputBase-root": {
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
                        }}
                        id="id_supplier"
                        disablePortal
                        options={suppliers}
                        value={suppliers.find((sp) => sp.id === filters.id_supplier) || null}
                        getOptionLabel={(option) => `${option.name} (${option.alias})`}
                        inputValue={inputValue}
                        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                        onChange={handleSupplierChange}
                        renderInput={(params) => (
                            <TextField {...params} label="Proveedor" fullWidth />
                        )}
                        />

                        {/* 🔹 Autocomplete Client */}
                        <Autocomplete
                        sx={{ width:'100%', "& .MuiInputBase-root": {
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
                        }}
                        id="id_client"
                        disablePortal
                        options={clients}
                        value={clients.find((cl) => cl.id === filters.id_client) || null}
                        getOptionLabel={(option) => `${option.name}`}
                        inputValue={inputCValue}
                        onInputChange={(_, newInputValue) => setInputCValue(newInputValue)}
                        onChange={handleClientChange}
                        renderInput={(params) => (
                            <TextField {...params} label="Cliente" fullWidth />
                        )}
                        />
                    </div>
                </div>
            </Modal>
        </>
);
}
