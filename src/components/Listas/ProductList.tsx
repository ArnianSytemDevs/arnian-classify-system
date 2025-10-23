import { useEffect, useState } from "react";
import ProductListController from "./ProductList.controller";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import type { Product, Status, Supplier } from "../../types/collections";
import type { productFilters } from "../../types/forms";
import {
    Modal,
    TextField,
    Switch,
    FormControl,
    Select,
    MenuItem,
    Autocomplete,
} from "@mui/material";
import { FaFilter } from "react-icons/fa";
import type { SelectChangeEvent } from "@mui/material";
import { pb } from "../../helpers/pocketbase/pocketbase";
import NoPhoto from "../../assets/NotPhoto.png"

type ProductListProops = {
    status: Status[];
};

export default function ProductList({ status }: ProductListProops) {
    const { productDispatch } = useClassifyContext();
    const [products, setProducts] = useState<any[]>([]);
    const [openMod, setOpenMod] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [filters, setFilters] = useState<productFilters>({
        id: "",
        public_key: "",
        name: "",
        alias: "",
        code: "",
        is_deleted: false,
        part_number: "",
        model: "",
        brand: "",
        serial_number: "",
        // color: "",
        id_status: "",
        id_supplier: "",
        deprected: false,
        created: "",
        updated: "",
    });

    // ✅ estilos coherentes
    const thBody =
        "px-5 py-4 text-sm font-mono font-light text-left text-gray-800 dark:text-gray-200 ";
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

    useEffect(() => {
        ProductListController.getProdList(setProducts, filters);
        return () => {
            ProductListController.unsubscribe();
        };
    }, [filters]);

    useEffect(() => {
        if (openMod) {
            if (inputValue.trim() !== "") {
                ProductListController.getSuppliers(inputValue).then((resp: any) => {
                    setSuppliers(resp);
                });
            } else {
                setSuppliers([]);
            }
        }
    }, [inputValue, openMod]);

    const handleAutocomplete = (_: any, newValue: Supplier | null) => {
        setFilters((prev) => ({
            ...prev,
            id_supplier: newValue ? newValue.id : "",
        }));
    };

    const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const { name, value } = e.target;

        if ("type" in e.target) {
            const target = e.target as HTMLInputElement;
            setFilters((prev) => ({
                ...prev,
                [name]:
                    target.type === "checkbox"
                        ? target.checked
                        : target.type === "number"
                        ? Number(value)
                        : value,
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const renderImage = (file:string,record:Product) => {
        const lower = file[0].toLowerCase();
        const url = pb.files.getURL(record, file);

        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) {
        return (
            <img
            src={url || NoPhoto}
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

    return (
        <>
            <div className="overflow-y-auto max-h-[calc(100vh-80px)] w-full">
                <table className="w-full border-collapse">
                    <thead className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800 sticky top-0 z-10">
                    <tr>
                        <th className="px-2 py-2 font-semibold text-gray-700 dark:text-gray-200">
                        <button
                            className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition"
                            onClick={() => setOpenMod(true)}
                        >
                            <FaFilter className="text-gray-600 dark:text-cyan-300" />
                        </button>
                        </th>
                        <th className={thHead}></th>
                        <th className={thHead}>Alias</th>
                        <th className={thHead}>Name</th>
                        <th className={thHead}>Code</th>
                        <th className={thHead}>Brand</th>
                        <th className={thHead}>Model</th>
                        <th className={thHead}>Description</th>
                        <th className={thHead}>Status</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-x divide-gray-200 dark:divide-gray-500">
                    {products.map((p) => (
                        <tr
                        key={p.id}
                        className="hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                        <td className={thBody}>
                            <input
                            className="w-5 h-5 accent-cyan-600 cursor-pointer"
                            type="checkbox"
                            onChange={(e) =>
                                productDispatch({
                                type: "change-box",
                                payload: { product: p, status: e.target.checked },
                                })
                            }
                            />
                        </td>
                        <td className={thBody}>{renderImage(p.files, p)}</td>
                        <td className={thBody}>{p.alias}</td>
                        <td className={thBody}>{p.name}</td>
                        <td className={thBody}>{p.code}</td>
                        <td className={thBody}>{p.brand}</td>
                        <td className={thBody}>{p.model}</td>
                        <td className={thBody + " max-w-70 line-clamp-3"}>{p.description}</td>
                        <td
                            className={thBody}
                            style={{
                            color: `#${status.find((st) => st.id === p.id_status)?.color || "FFF"}`,
                            fontWeight: "bold",
                            }}
                        >
                            {status.find((st) => st.id === p.id_status)?.name || "N/A"}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>



            {/* ✅ Modal adaptado a light/dark */}
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
                            id="id"
                            name="id"
                            label="id"
                            value={filters.id}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            sx={inputText}
                            id="public_key"
                            name="public_key"
                            label="public_key"
                            value={filters.public_key}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            sx={inputText}
                            id="name"
                            name="name"
                            label="name"
                            value={filters.name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            sx={inputText}
                            id="alias"
                            name="alias"
                            label="alias"
                            value={filters.alias}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            sx={inputText}
                            id="code"
                            name="code"
                            label="code"
                            value={filters.code}
                            onChange={handleChange}
                            fullWidth
                        />

                        <FormControl>
                            <label className="text-gray-700 dark:text-gray-300">Deprected</label>
                            <Switch
                                id="deprected"
                                name="deprected"
                                checked={filters.deprected}
                                onChange={handleSwitch}
                            />
                        </FormControl>

                        <TextField
                            sx={inputText}
                            id="part_number"
                            name="part_number"
                            label="part_number"
                            value={filters.part_number}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            sx={inputText}
                            id="model"
                            name="model"
                            label="model"
                            value={filters.model}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            sx={inputText}
                            id="brand"
                            name="brand"
                            label="brand"
                            value={filters.brand}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            sx={inputText}
                            id="serial_number"
                            name="serial_number"
                            label="serial_number"
                            value={filters.serial_number}
                            onChange={handleChange}
                            fullWidth
                        />
                        {/* <TextField
                            sx={inputText}
                            id="color"
                            name="color"
                            label="color"
                            value={filters.color}
                            onChange={handleChange}
                            fullWidth
                        /> */}

                        <FormControl fullWidth>
                            <Select
                            sx={ { background:"#FFF" } }
                                id="id_status"
                                name="id_status"
                                value={filters.id_status}
                                onChange={handleChange}
                            >
                                {status.map((st) => (
                                    <MenuItem key={st.id} value={st.id}>
                                        {st.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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
                            onInputChange={(_, newInputValue) => {
                                setInputValue(newInputValue);
                            }}
                            onChange={handleAutocomplete}
                            renderInput={(params) => (
                                <TextField {...params} label="Proveedor" fullWidth />
                            )}
                        />

                        <TextField
                            sx={inputText}
                            id="created"
                            name="created"
                            type="date"
                            label="created"
                            value={filters.created}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            sx={inputText}
                            id="updated"
                            name="updated"
                            type="date"
                            label="updated"
                            value={filters.updated}
                            onChange={handleChange}
                            fullWidth
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
