import { useEffect, useState } from "react";
import ArnLogo from "../../assets/ArnianLogo.png";
import { Autocomplete, TextField } from "@mui/material";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import { FaTrashAlt, FaSave } from "react-icons/fa";
import type { Supplier, Clients, Measurement, Units, Product } from "../../types/collections";
import { ClassifyController } from "./Classify.controller";
import { v4 as uuidv4 } from "uuid";
import { GetCountries } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import { MdEditSquare } from "react-icons/md";
import type { classifyProduct } from "../../types/forms";
import MenuComponent from "../../components/Menu/MenuComponent";
import { CgSandClock } from "react-icons/cg";
import { useNavigate } from "react-router";
import { usePreventNavigation } from "../../hooks/ReturnAlert";

export default function Classify() {

    usePreventNavigation()

    const { t } = useTranslation();
    const { classifyState, classifyDispatch } = useClassifyContext();
    const [inputProduct, setInputProduct] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [inputUnit] = useState("");
    const [inputMeasurement] = useState("");
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [units, setUnits] = useState<Units[]>([]);
    const [clients, setClients] = useState<Clients[]>([]);
    const [measurements,setMeasurements] = useState<Measurement[]>([]);
    const [countries,setCountries] = useState([])
    const navigate = useNavigate()
    const thBody =
        "px-1 text-xs md:text-sm font-semibold text-left text-gray-800 dark:text-gray-200 whitespace-nowrap min-w-40";
    const thHead =
        "px-4 py-2 font-semibold text-xs md:text-sm text-left text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 whitespace-nowrap";
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

    useEffect(()=>{
        GetCountries().then((resp:any)=>{
            setCountries(resp)
        })
    },[])

    useEffect(() => {
    const fetchClassifyData = async () => {
        try {
        const idEntry = classifyState.entrySelected.id;
        if (!idEntry) return;

        const existingClassify = await ClassifyController.getClassifyByEntry(idEntry);

        if (existingClassify.length > 0) {
            classifyDispatch({
            type: "set-product-classify-data",
            payload: { products: existingClassify },
            });
        }
        } catch (error) {
        console.error("❌ Error al cargar productos clasificados:", error);
        }
    };

    fetchClassifyData();
    }, [classifyState.entrySelected.id]);


    // 🔹 Carga de proveedores y clientes según entrada seleccionada
    useEffect(() => {
        if (classifyState.entrySelected.id) {
        ClassifyController.getSuppliers(classifyState.entrySelected.id_supplier, "edit")
            .then((resp: any) => setSuppliers(resp))
            .catch((err) => console.error("❌ Error al cargar proveedores:", err));

        ClassifyController.getClients(classifyState.entrySelected.id_client, "edit")
            .then((resp: any) => setClients(resp))
            .catch((err) => console.error("❌ Error al cargar clientes:", err));
        }else{
            navigate("/dashboard");
        }
    }, [classifyState.entrySelected]);

    // 🔹 Carga inicial de unidades
    useEffect(() => {
        ClassifyController.getUnits()
        .then((resp: any) => setUnits(resp))
        .catch((err) => console.error("❌ Error al cargar unidades:", err));
    }, []);

    // 🔹 Actualización dinámica de unidades según filtro
    useEffect(() => {
        if (inputUnit) {
        ClassifyController.getUnits(inputUnit)
            .then((resp: any) => setUnits(resp))
            .catch((err) => console.error("❌ Error al filtrar unidades:", err));
        }
    }, [inputUnit]);

    // Carga Inicial de measurement
    useEffect(() => {
        ClassifyController.getMeasurement()
        .then((resp: any) => setMeasurements(resp))
        .catch((err) => console.error("❌ Error al cargar unidades:", err));
    }, []);

    // 🔹 Actualización dinámica de measurement según filtro
    useEffect(() => {
        if (inputMeasurement) {
        ClassifyController.getMeasurement(inputMeasurement)
            .then((resp: any) => setMeasurements(resp))
            .catch((err) => console.error("❌ Error al filtrar unidades:", err));
        }
    }, [inputMeasurement]);

    // 🔹 Buscar productos conforme se escribe
    useEffect(() => {
        if (inputProduct) {
        ClassifyController.getProducts(inputProduct)
            .then((resp: any) => setProducts(resp))
            .catch((err) => console.error("❌ Error al buscar productos:", err));
        } else {
        setProducts([]);
        }
    }, [inputProduct]);

    // 🔹 Cuando se selecciona un producto en el buscador global
    const handleAddProduct = async (product: Product | null) => {
        if (!product) return;
        const newPublicKey = uuidv4();

        try {
        const formatted = await ClassifyController.formatProd(product);

        formatted.public_key = newPublicKey;
        formatted.id_product = product.id || "";

        classifyDispatch({ type: "add-product", payload: { public_key: newPublicKey } });
        classifyDispatch({
            type: "set-product-data",
            payload: { public_key: newPublicKey, classifyProduct: formatted },
        });

        setInputProduct("");
        } catch (error) {
        console.error("❌ Error al agregar producto:", error);
        }
    };

    // 🔹 Cambio genérico de input (TextField)
    const handleChangeInput = (e: any, public_key: string) => {
        classifyDispatch({ type: "change-input-product", payload: { public_key, e } });
    };

    // 🔹 Cambio genérico de Autocomplete
    const handleChangeAutocomplete = (public_key: string, field: string, value: any) => {
        classifyDispatch({
        type: "change-autocomplete-product",
        payload: { public_key, field, value },
        });
    };

    // 🔹 Cambio país de origen o vendedor
    const handleChangeCountry = (public_key: string, field: string, value: any) => {
    classifyDispatch({
        type: "change-country-product",
        payload: { public_key, field, value },
    });
    };


    
    const handleChangeSave = async (product: classifyProduct) => {
        // 🧩 Lista de campos requeridos
        const requiredFields: (keyof classifyProduct)[] = [
            "name",
            "lote",
            "batch",
            "quantity",
            "origin_country",
            "seller_country",
            "weight",
            "net_weight",
            "type_weight",
            "unit_weight",
            "tariff_fraction",
            "parts_number",
            "item",
            "limps",
        ];

        // 🔍 Validar campos vacíos
        const missingFields = requiredFields.filter((field) => {
            const value = product[field];
            return (
            value === null ||
            value === undefined ||
            value === "" ||
            (typeof value === "number" && isNaN(value))
            );
        });

        if (missingFields.length > 0) {
            // ⚠️ Si hay campos vacíos, mostrar advertencia
            const fieldNames = missingFields.join(", ");
            await Swal.fire({
            icon: "warning",
            title: "Campos incompletos",
            html: `<p>Faltan los siguientes campos:</p>
                    <p class="text-rose-600 font-semibold mt-2">${fieldNames}</p>`,
            confirmButtonText: "Entendido",
            confirmButtonColor: "#3085d6",
            background: "#f9fafb",
            color: "#1e293b",
            });
            return; // No continúa
        }

        // ✅ Si todo está lleno, cambiar modo edición
        classifyDispatch({
            type: "set-edit-data",
            payload: { public_key: product.public_key },
        });

        await Swal.fire({
            icon: "success",
            title: "Producto validado",
            text: "Todos los campos están completos. Se desactivó el modo edición.",
            confirmButtonColor: "#22c55e",
            timer: 1500,
            showConfirmButton: false,
        });
    };

    // 🔹 Eliminar producto con confirmación
    const handleRemoveProduct = async (public_key: string) => {
        const isDarkMode = document.documentElement.classList.contains("dark");

        const result = await Swal.fire({
        title: "¿Eliminar producto?",
        text: "Esta acción eliminará el producto del listado. ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: isDarkMode ? "#ef4444" : "#d33",
        cancelButtonColor: isDarkMode ? "#3b82f6" : "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        background: isDarkMode ? "#0f172a" : "#f9fafb",
        color: isDarkMode ? "#e2e8f0" : "#1e293b",
        });

        if (result.isConfirmed) {
        classifyDispatch({ type: "remove-product", payload: { public_key } });

        await Swal.fire({
            title: "Eliminado",
            text: "El producto ha sido eliminado correctamente.",
            icon: "success",
            confirmButtonColor: isDarkMode ? "#3b82f6" : "#3085d6",
            background: isDarkMode ? "#0f172a" : "#f9fafb",
            color: isDarkMode ? "#e2e8f0" : "#1e293b",
            timer: 1500,
            showConfirmButton: false,
        });
        }
    };

    const isAvaibleToEdit = (): boolean => {
        return classifyState.products.some((p) => p.edit === true);
    };

    const handleSaveAll = async () => {
        try {
            if (!classifyState.entrySelected.id) {
            await Swal.fire({
                icon: "warning",
                title: "No hay entrada seleccionada",
                text: "Selecciona una entrada antes de guardar.",
            });
            return;
            }

            const confirm = await Swal.fire({
            title: "¿Guardar clasificación?",
            text: "Se crearán o actualizarán los productos en PocketBase.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#22c55e",
            });

            if (!confirm.isConfirmed) return;

            const results = await ClassifyController.saveClassificationBatch(
            classifyState.entrySelected.id,
            classifyState.products,
            classifyDispatch
            );

            const created = results.filter((r) => r.status === "created").length;
            const updated = results.filter((r) => r.status === "updated").length;
            const failed = results.filter((r) => r.status === "error").length;

            await Swal.fire({
            icon: failed > 0 ? "warning" : "success",
            title: "Sincronización completada",
            html: `
                <p><b>${created}</b> productos creados</p>
                <p><b>${updated}</b> productos actualizados</p>
                <p><b>${failed}</b> errores</p>
            `,
            confirmButtonColor: "#22c55e",
            });
        } catch (error) {
            toast.error("❌ Error general al sincronizar");
        }
    };



    return (
        <div className=' w-screen h-screen flex flex-row dark:bg-gray-500 ' >
            <MenuComponent />
            <div className="text-center bg-cyan-50/50 dark:bg-slate-800 p-5 min-h-screen overflow-x-auto">
                <div className="mt-6 flex">
                    <button
                        onClick={handleSaveAll}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-md shadow-md cursor-pointer transition"
                    >
                        Guardar Clasificación
                    </button>
                    {/* <button
                        onClick={handleSaveAll}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md shadow-md cursor-pointer transition"
                    >
                        Salir
                    </button> */}
                    
                </div>
                {/* 🧩 ENCABEZADO */}
                <img src={ArnLogo} className="w-[150px] mx-auto mb-6" alt="Arnian Logo" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <TextField variant="filled" sx={inputText} label={t("Entrys.form.pkey")} value={classifyState.entrySelected.public_key} InputProps={{ readOnly: true }} />
                    <TextField variant="filled" sx={inputText} label="TAX ID" value={classifyState.entrySelected.id_tax} InputProps={{ readOnly: true }} />
                    <TextField variant="filled" sx={inputText} label={t("Entrys.form.invoice")} value={classifyState.entrySelected.invoice_number} InputProps={{ readOnly: true }} />
                    <TextField
                    sx={inputText}
                    variant="filled"
                    label={t("Entrys.form.supplier")}
                    value={suppliers.find((s) => s.id === classifyState.entrySelected.id_supplier)?.name || ""}
                    InputProps={{ readOnly: true }}
                    />
                    <TextField
                    variant="filled"
                    sx={inputText}
                    label={t("Entrys.form.client")}
                    value={clients.find((c) => c.id === classifyState.entrySelected.id_client)?.name || ""}
                    InputProps={{ readOnly: true }}
                    />
                    <TextField variant="filled" sx={inputText} label={t("Entrys.form.created")} value={classifyState.entrySelected.created} InputProps={{ readOnly: true }} />
                </div>

                <hr className="my-4" />

                {/* 🔍 BUSCADOR GLOBAL DE PRODUCTOS */}
                <div className="flex justify-center mb-6">
                    <Autocomplete
                    disablePortal
                    disabled={isAvaibleToEdit()}
                    sx={{ width: 500 }}
                    options={products}
                    inputValue={inputProduct}
                    getOptionLabel={(option) => `${option.name} (${option.brand || "Sin marca"})`}
                    onInputChange={(_, value) => setInputProduct(value)}
                    onChange={(_, value) => handleAddProduct(value)}
                    renderOption={(props, option) => (
                        <li
                        {...props}
                        key={option.id}
                        className="flex flex-col w-full px-3 py-2 hover:bg-gray-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors rounded-md"
                        >
                        <span className="font-semibold text-sm">{option.name || "Sin nombre"}</span>
                        <span className="text-xs mt-1">
                            Marca: <span className="font-medium">{option.brand || "N/A"}</span> — Modelo:{" "}
                            <span className="font-medium">{option.model || "N/A"}</span>
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                            Precio: ${Number(option.unit_price || 0).toFixed(2)}
                        </span>
                        </li>
                    )}
                    renderInput={(params) => <TextField {...params} variant="filled" label={t("Classify.lblProd")} sx={inputText} />}
                    />
                </div>

                {/* 🧾 TABLA DE PRODUCTOS */}
                <div className="bg-white dark:bg-slate-900 rounded-md p-4 shadow-md overflow-x-auto min-h-110">
                    <table className="w-full border-collapse min-w-[1000px]">
                    <thead className="border-b-2 border-gray-300 dark:border-gray-600">
                        <tr>
                        {[
                            `${t("Classify.list.lblOptions")}`,
                            `${t("Classify.list.lblProduct")}`,
                            `${t("Classify.list.lblLot")}`,
                            `${t("Classify.list.lblBatch")}`,
                            `${t("Classify.list.lblQuantity")}`,
                            `${t("Classify.list.lblSupplier")}`,
                            `${t("Classify.list.lblCountry_origin")}`,
                            `${t("Classify.list.lblSeller_country")}`,
                            `${t("Classify.list.lblGross_weight")}`,
                            `${t("Classify.list.lblNet_weight")}`,
                            `${t("Classify.list.lblUnit_weight")}`,
                            `${t("Classify.list.lblBrand")}`,
                            `${t("Classify.list.lblModel")}`,
                            `${t("Classify.list.lblNo_Series")}`,
                            `${t("Classify.list.lblUnit_price")}`,
                            `${t("Classify.list.lblUnit_measurement")}`,
                            `${t("Classify.list.lblFractionMX")}`,
                            `${t("Classify.list.lblParty")}`,
                            `${t("Classify.list.lblItem")}`,
                            `${t("Classify.list.lblLumps")}`,
                        ].map((h) => (
                            <th key={h} className={thHead}>
                            {h}
                            </th>
                        ))}
                        </tr>
                    </thead>

                    <tbody>
                        {classifyState.products.length === 0 ? (
                        <tr>
                            <td colSpan={20} className="py-6 text-center text-gray-400 dark:text-gray-500">
                            No hay productos agregados
                            </td>
                        </tr>
                        ) : (
                        classifyState.products.map((p, index) => (
                            <tr
                            key={index}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                            >
                            <td className={thBody + " flex gap-5"}>
                                <button
                                    onClick={() => handleChangeSave(p)}
                                    className="text-green-400 hover:text-green-600 cursor-pointer text-2xl hover:border-2 border-green-600 p-2 rounded-sm"
                                >
                                    {
                                        p.edit? (<FaSave />) : (<MdEditSquare />)
                                    }
                                </button>

                                <button
                                onClick={() => handleRemoveProduct(p.public_key)}
                                className="text-red-400 hover:text-red-600 cursor-pointer text-2xl hover:border-2 border-red-600 p-2 rounded-sm "
                                title="Eliminar"
                                >
                                <FaTrashAlt />
                                </button>

                                {p.synced ? (
                                    <span className="text-emerald-500 font-semibold">✔</span>
                                ) : p.syncError ? (
                                    <span className="text-red-500" title={p.syncError}>⚠</span>
                                ) : (
                                    <span className="text-gray-400 cursor-progress text-2xl p-2 rounded-sm" ><CgSandClock /></span>
                                )}
                            </td>

                            <td className={thBody}>{p.name || "-"}</td>

                            {/* Campos editables */}
                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="lote"
                                value={p.lote}
                                sx={inputText}
                                label={t("Classify.list.lblLot")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>
                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="batch"
                                value={p.batch}
                                sx={inputText}
                                label={t("Classify.list.lblBatch")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>
                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="quantity"
                                value={p.quantity}
                                type="number"
                                sx={inputText}
                                label={t("Classify.list.lblQuantity")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>

                            <td className={thBody}>{p.supplier?.name || p.id_supplier || "-"}</td>

                            {/* 🌎 País de origen */}
                            <td className={thBody}>
                            <Autocomplete
                                options={countries}
                                disabled={!p.edit}
                                getOptionLabel={(opt:any) => opt?.name || ""}
                                value={
                                typeof p.origin_country === "object"
                                    ? countries.find(
                                        (c:any) =>
                                        c.name === p.origin_country?.name ||
                                        c.iso2 === p.origin_country?.iso2
                                    ) || null
                                    : countries.find(
                                        (c:any) => c.name === p.origin_country || c.iso2 === p.origin_country
                                    ) || null
                                }
                                onChange={(_, val) =>
                                handleChangeCountry(p.public_key, "origin_country", val || null)
                                }
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="filled"
                                    label={t("Classify.list.lblCountry_origin")}
                                    sx={inputText}
                                />
                                )}
                            />
                            </td>

                            {/* 🏷 País vendedor */}
                            <td className={thBody}>
                            <Autocomplete
                                options={countries}
                                disabled={!p.edit}
                                getOptionLabel={(opt:any) => opt?.name || ""}
                                value={
                                typeof p.seller_country === "object"
                                    ? countries.find(
                                        (c:any) =>
                                        c.name === p.seller_country?.name ||
                                        c.iso2 === p.seller_country?.iso2
                                    ) || null
                                    : countries.find(
                                        (c:any) => c.name === p.seller_country || c.iso2 === p.seller_country
                                    ) || null
                                }
                                onChange={(_, val) =>
                                handleChangeCountry(p.public_key, "seller_country", val || null)
                                }
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="filled"
                                    label={t("Classify.list.lblSeller_country")}
                                    sx={inputText}
                                />
                                )}
                            />
                            </td>

                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="weight"
                                value={p.weight}
                                type="number"
                                sx={inputText}
                                label={t("Classify.list.lblGross_weight")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>
                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="net_weight"
                                value={p.net_weight}
                                type="number"
                                sx={inputText}
                                label={t("Classify.list.lblNet_weight")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>

                            {/* Unidad */}
                            <td className={thBody}>
                            <Autocomplete
                                options={measurements}
                                disabled={!p.edit}
                                getOptionLabel={(opt) => opt?.name || ""}
                                value={
                                typeof p.unit_weight === "object"
                                    ? measurements.find((m) => m.id === p.unit_weight?.id) || null
                                    : measurements.find((m) => m.id === p.unit_weight) || null
                                }
                                onChange={(_, val) =>
                                handleChangeAutocomplete(p.public_key, "unit_weight", val || null)
                                }
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="filled"
                                    label={t("Classify.list.lblUnit_weight")}
                                    sx={inputText}
                                />
                                )}
                            />
                            </td>

                            <td className={thBody}>{p.brand || "-"}</td>
                            <td className={thBody}>{p.model || "-"}</td>
                            <td className={thBody}>{p.serial_number || "-"}</td>
                            <td className={thBody}>${Number(p.unit_price || 0).toFixed(2)}</td>

                            {/* Editables finales */}
                            <td className={thBody}>
                            <Autocomplete
                                options={units}
                                disabled={!p.edit}
                                getOptionLabel={(opt) => opt?.name || ""}
                                value={
                                typeof p.type_weight === "object"
                                    ? units.find((u) => u.id === p.type_weight?.id) || null
                                    : units.find((u) => u.id === p.type_weight) || null
                                }
                                onChange={(_, val) =>
                                handleChangeAutocomplete(p.public_key, "type_weight", val || null)
                                }
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="filled"
                                    label={t("Classify.list.lblUnit_measurement")}
                                    sx={inputText}
                                />
                                )}
                            />
                            </td>

                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="tariff_fraction"
                                type="number"
                                value={p.tariff_fraction}
                                sx={inputText}
                                label={t("Classify.list.lblFractionMX")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>
                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="parts_number"
                                type="number"
                                value={p.parts_number}
                                sx={inputText}
                                label={t("Classify.list.lblParty")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>
                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="item"
                                type="number"
                                value={p.item}
                                sx={inputText}
                                label={t("Classify.list.lblItem")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>
                            <td className={thBody}>
                                <TextField
                                variant="filled"
                                disabled={!p.edit}
                                name="limps"
                                type="number"
                                value={p.limps}
                                sx={inputText}
                                label={t("Classify.list.lblLumps")}
                                onChange={(e) => handleChangeInput(e, p.public_key)}
                                />
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>

                </div>
                
                <ToastContainer />
            </div>
        </div>
    );
}
