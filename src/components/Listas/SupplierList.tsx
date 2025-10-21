    import { useState, useEffect } from "react";
    import { FaFilter } from "react-icons/fa";
    import type { Supplier, Status } from "../../types/collections";
    import { SuppliersController } from "./SupplierList.controller";
    import { FormControl, MenuItem, Modal, Select, Switch, TextField, type SelectChangeEvent } from "@mui/material";
    import { useClassifyContext } from "../../hooks/useClassifyContext";

    type SuppliersListProps = {
    status: Status[];
    };

    export default function SuppliersList({ status }: SuppliersListProps) {
    const { suppliersDispatch } = useClassifyContext();
    const [openMod, setOpenMod] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [filters, setFilters] = useState({
        id: "",
        public_key: "",
        name: "",
        alias: "",
        rfc: "",
        vin: "",
        phone_number: "",
        email: "",
        address: "",
        postal_code: "",
        id_status: "",
        is_deleted: false,
    });

    // ============================================================
    // 🎨 Estilos MUI
    // ============================================================
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

    // ============================================================
    // 🔹 Cargar proveedores (realtime)
    // ============================================================
    useEffect(() => {
    const delayDebounce = setTimeout(() => {
        SuppliersController.getSuppliers(setSuppliers, filters);
    }, 3000); // ⏱️ Espera 3 segundos después del último cambio

    return () => {
        clearTimeout(delayDebounce); // 🔄 Reinicia el temporizador si el usuario sigue escribiendo
        SuppliersController.unsubscribe(); // 🚫 Cancela la suscripción anterior
    };
    }, [filters]);


    // ============================================================
    // 🔹 Handlers de filtro
    // ============================================================
    const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFilters((prev) => ({ ...prev, [name]: checked }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // ============================================================
    // 🧱 Render principal
    // ============================================================
    return (
        <>
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
                <th className="px-5 py-2 font-semibold text-left text-gray-900 dark:text-gray-200">Nombre</th>
                <th className="px-5 py-2 font-semibold text-left text-gray-900 dark:text-gray-200">Alias</th>
                <th className="px-5 py-2 font-semibold text-left text-gray-900 dark:text-gray-200">RFC</th>
                <th className="px-5 py-2 font-semibold text-left text-gray-900 dark:text-gray-200">VIN</th>
                <th className="px-5 py-2 font-semibold text-left text-gray-900 dark:text-gray-200">Correo</th>
                <th className="px-5 py-2 font-semibold text-left text-gray-900 dark:text-gray-200">Teléfono</th>
                <th className="px-5 py-2 font-semibold text-left text-gray-900 dark:text-gray-200">Dirección</th>
                <th className="px-5 py-2 font-semibold text-left text-gray-900 dark:text-gray-200">Status</th>
            </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {suppliers.map((sp) => (
                <tr
                key={sp.id}
                className="hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                <td className="px-5 py-4 text-sm font-mono text-gray-800 dark:text-gray-200">
                    <input
                    className="w-5 h-5 accent-cyan-600 cursor-pointer"
                    type="checkbox"
                    onChange={(e) =>
                        suppliersDispatch({
                        type: "change-box",
                        payload: { supplier: sp, status: e.target.checked },
                        })
                    }
                    />
                </td>
                <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">{sp.name}</td>
                <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">{sp.alias}</td>
                <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">{sp.rfc}</td>
                <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">{sp.vin}</td>
                <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">{sp.email}</td>
                <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">{sp.phone_number}</td>
                <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">{sp.address}</td>
                <td
                    className="px-5 py-4 text-sm font-bold"
                    style={{
                    color: `#${status.find((st) => st.id === sp.id_status)?.color || "FFF"}`,
                    }}
                >
                    {status.find((st) => st.id === sp.id_status)?.name || "N/A"}
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
                <TextField sx={inputText} name="name" label="Nombre" value={filters.name} onChange={handleChange} fullWidth />
                <TextField sx={inputText} name="alias" label="Alias" value={filters.alias} onChange={handleChange} fullWidth />
                <TextField sx={inputText} name="rfc" label="RFC" value={filters.rfc} onChange={handleChange} fullWidth />
                <TextField sx={inputText} name="vin" label="VIN" value={filters.vin} onChange={handleChange} fullWidth />
                <TextField sx={inputText} name="email" label="Correo" value={filters.email} onChange={handleChange} fullWidth />
                <TextField sx={inputText} name="phone_number" label="Teléfono" value={filters.phone_number} onChange={handleChange} fullWidth />
                <TextField sx={inputText} name="address" label="Dirección" value={filters.address} onChange={handleChange} fullWidth />
                <TextField sx={inputText} name="postal_code" label="Código Postal" type="text" value={filters.postal_code} onChange={handleChange} fullWidth />

                <FormControl>
                <label className="text-gray-700 dark:text-gray-300">Eliminado</label>
                <Switch id="is_deleted" name="is_deleted" checked={filters.is_deleted} onChange={handleSwitch} />
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
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 p-3 border-t dark:border-gray-700">
                <button
                onClick={() =>
                    setFilters({
                    id: "",
                    public_key: "",
                    name: "",
                    alias: "",
                    rfc: "",
                    vin: "",
                    phone_number: "",
                    email: "",
                    address: "",
                    postal_code: "",
                    id_status: "",
                    is_deleted: false,
                    })
                }
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-md"
                >
                Limpiar
                </button>
                <button
                onClick={() => setOpenMod(false)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md"
                >
                Aplicar
                </button>
            </div>
            </div>
        </Modal>
        </>
    );
    }
