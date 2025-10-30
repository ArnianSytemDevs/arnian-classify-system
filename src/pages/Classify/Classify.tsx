import { useEffect, useState } from "react";
import ArnLogo from "../../assets/ArnianLogo.png";
import { Autocomplete, FormControl, Switch, TextField } from "@mui/material";
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
import { FaPlusSquare } from "react-icons/fa";
import ProductForm from "../../components/Formularios/ProductForm";
import { pb } from "../../helpers/pocketbase/pocketbase";
import NoPhoto from '../../assets/NotPhoto.png'
import { checkRole } from "../../hooks/usePremission.controller";
import UserPermissions from "../../hooks/usePremission";

export default function Classify() {

    usePreventNavigation()

    const { t } = useTranslation();
    const { classifyState, classifyDispatch, entryDispatch,setRole,role } = useClassifyContext();
    const [inputProduct, setInputProduct] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [inputUnit] = useState("");
    const [inputMeasurement] = useState("");
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [units, setUnits] = useState<Units[]>([]);
    const [clients, setClients] = useState<Clients[]>([]);
    const [measurements,setMeasurements] = useState<Measurement[]>([]);
    const [countries,setCountries] = useState([])
    const [createProduct,setCreateProduct] = useState(false)
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
        const getRole = async () => {
            const userRole = await checkRole();
            setRole(userRole);
        };
        getRole();
    }, []);
    

    useEffect(() => {
        const subtotal = classifyState.products.reduce(
            (acc, p) => acc + ((Number(p.quantity) || 0) * (Number(p.unit_price) || 0)), 0
        );

        const net_weight_total = classifyState.products.reduce(
            (acc, p) => acc + (Number(p.net_weight) || 0), 0
        );

        classifyDispatch({
            type: "update-entry-financials",
            payload: { net_weight_total: Number(net_weight_total) },
        })

        classifyDispatch({
            type: "update-entry-financials",
            payload: { subtotal: Number(subtotal) },
        })
    }, [classifyState.products]);
    
    useEffect(()=>{
        const total = classifyState.entrySelected.other_price + classifyState.entrySelected.packing_price + classifyState.entrySelected.subtotal
    
        classifyDispatch({
            type: "update-entry-financials",
            payload: { total: Number(total) },
        })
    },[classifyState.entrySelected.other_price || classifyState.entrySelected.packing_price || classifyState.entrySelected.subtotal])

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
        // ⏳ Si no hay texto, limpiamos los productos inmediatamente
        if (!inputProduct) {
            setProducts([]);
            return;
        }

        // 🕒 Creamos el temporizador de 3 segundos
        const delayDebounce = setTimeout(() => {
            ClassifyController.getProducts(inputProduct)
            .then((resp: any) => setProducts(resp))
            .catch((err) => console.error("❌ Error al buscar productos:", err));
        }, 800);

        // 🧹 Limpiamos el timeout si el usuario sigue escribiendo
        return () => clearTimeout(delayDebounce);
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
            // "origin_country",
            "seller_country",
            "weight",
            "net_weight",
            "type_weight",
            "unit_weight",
            "tariff_fraction",
            "parts_number",
            "item",
            "limps"
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
            // 🛑 Validar si hay productos en modo edición
            if (classifyState.products.some((p) => p.edit === true)) {
            await Swal.fire({
                icon: "warning",
                title: "Edición activa",
                text: "No puedes realizar esta acción mientras existan productos en modo edición. Guarda o confirma los cambios primero.",
                confirmButtonColor: "#f59e0b",
            });
            return;
            }

            // 🧾 Validar si hay una entrada seleccionada
            if (!classifyState.entrySelected.id) {
            await Swal.fire({
                icon: "warning",
                title: "No hay entrada seleccionada",
                text: "Selecciona una entrada antes de guardar.",
            });
            return;
            }

            // 💾 Confirmar acción de guardado
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

            // 🚀 Ejecutar guardado en PocketBase con los datos financieros incluidos
            const results = await ClassifyController.saveClassificationBatch(
            classifyState.entrySelected.id,
            classifyState.products,
            classifyDispatch,
            {
                subtotal: classifyState.entrySelected.subtotal,
                packing_price: classifyState.entrySelected.packing_price,
                other_price: classifyState.entrySelected.other_price,
                total: classifyState.entrySelected.total,
                total_limbs: classifyState.entrySelected.total_limbs,
                net_weight_total: classifyState.entrySelected.net_weight_total,
            }
            );

            // 📊 Resumen del resultado
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
            console.error("❌ Error general al sincronizar:", error);
            toast.error("❌ Error general al sincronizar");
        }
        };


    const handleCreateProduct = () =>{
        if(classifyState.products.some((p) => p.edit === true)){
            Swal.fire({
            icon: "warning",
            title: "Edición activa",
            text: "No puedes realizar esta acción mientras existan productos en modo edición. Guarda o confirma los cambios primero.",
            confirmButtonColor: "#f59e0b",
            });
        }else{
            setCreateProduct(!createProduct)
        }
    }

    const handleReturn = () =>{
        Swal.fire({
        title: "¿Deseas salir de esta página?",
        text: "Si sales, podrías perder los cambios no guardados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#ef4444",
        }).then((result) => {
        if (result.isConfirmed) {
            classifyDispatch({ type: "clear-all" })
            entryDispatch({ type: 'clear-state' })
            window.location.reload
        } else {
            return "a"
        }
        });
    }

    const renderImage = (file:any,record:Product) => {
        if(file.length !=0){
            const lower = file[0].toLowerCase();
            const url = pb.files.getURL(record, file[0]);
    
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
        }else{
            return(
                <img
                    src={NoPhoto}
                    alt={file}
                    className="w-20 h-20 object-cover rounded border"
                />
            )
        }
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
        const record = classifyState.entrySelected; // o el producto actual
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

    return (
        <div className=' w-screen h-screen flex flex-row dark:bg-gray-500 ' >
            <MenuComponent />
            <div className="text-center bg-cyan-50/50 dark:bg-slate-800 p-5 min-h-screen overflow-x-auto">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 mb-8">
                {/* 🖼️ Logo */}
                <div className="flex justify-center mb-6">
                    <img src={ArnLogo} className="w-[150px]" alt="Arnian Logo" />
                </div>

                {/* 📄 Encabezado de entrada */}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Datos generales de la entrada
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <TextField
                    variant="filled"
                    sx={inputText}
                    label={t("Entrys.form.pkey")}
                    value={classifyState.entrySelected.public_key}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    />
                    <TextField
                    variant="filled"
                    sx={inputText}
                    label="TAX ID"
                    value={classifyState.entrySelected.id_tax}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    />
                    <TextField
                    variant="filled"
                    sx={inputText}
                    label={t("Entrys.form.invoice")}
                    value={classifyState.entrySelected.invoice_number}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    />
                    <TextField
                    variant="filled"
                    sx={inputText}
                    label={t("Entrys.form.supplier")}
                    value={suppliers.find((s) => s.id === classifyState.entrySelected.id_supplier)?.name || ""}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    />
                    <TextField
                    variant="filled"
                    sx={inputText}
                    label={t("Entrys.form.client")}
                    value={clients.find((c) => c.id === classifyState.entrySelected.id_client)?.name || ""}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    />
                    <TextField
                    variant="filled"
                    sx={inputText}
                    label={t("Entrys.form.created")}
                    value={classifyState.entrySelected.created}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    />
                </div>
                {classifyState.entrySelected.file.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {classifyState.entrySelected.file.map((file: File) => (
                        <div
                            key={file.name || file.toString()  }
                            className="flex flex-col items-center justify-center border rounded-lg p-1 bg-gray-50 hover:bg-gray-100 text-center dark:text-black"
                        >

                            <div
                            className="w-[100%] h-[100%] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 p-3"
                            onClick={() => window.open( pb.files.getURL(classifyState.entrySelected, file.toString()))}
                            >
                            {renderPreview(file)}
                            <span className="mt-2 text-xs truncate w-24">{ file.toString() }</span>
                            </div>
                        </div>
                        ))}
                    </div>
                )}

                {/* 💰 Totales financieros */}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Totales financieros
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <TextField
                    variant="filled"
                    label="Subtotal"
                    value={classifyState.entrySelected.subtotal?.toFixed(2) || "0.00"}
                    InputProps={{ readOnly: true }}
                    sx={inputText}
                    fullWidth
                    />
                    <TextField
                    variant="filled"
                    label="Precio embalaje"
                    type="number"
                    value={classifyState.entrySelected.packing_price ?? 0}
                    onChange={(e) =>
                        classifyDispatch({
                        type: "update-entry-financials",
                        payload: { packing_price: Number(e.target.value) },
                        })
                    }
                    sx={inputText}
                    fullWidth
                    />
                    <TextField
                    variant="filled"
                    label="Otros costos"
                    type="number"
                    value={classifyState.entrySelected.other_price ?? 0}
                    onChange={(e) =>
                        classifyDispatch({
                        type: "update-entry-financials",
                        payload: { other_price: Number(e.target.value) },
                        })
                    }
                    sx={inputText}
                    fullWidth
                    />
                    <TextField
                    variant="filled"
                    label="Total general"
                    value={(
                        (classifyState.entrySelected.subtotal ?? 0) +
                        (classifyState.entrySelected.packing_price ?? 0) +
                        (classifyState.entrySelected.other_price ?? 0)
                    ).toFixed(2)}
                    InputProps={{ readOnly: true }}
                    sx={inputText}
                    fullWidth
                    />
                </div>
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
                        className="
                            flex items-center gap-4 w-full px-4 py-3
                            rounded-lg border border-gray-200
                            bg-white
                            hover:bg-gray-100 dark:hover:bg-slate-700
                            dark:hover:text-gray-200
                            hover:shadow-md transition-all duration-200 cursor-pointer
                        "
                        >
                        {/* 🖼️ Imagen */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                            {renderImage(option.files, option)}
                        </div>

                        {/* 🧾 Info */}
                        <div className="flex flex-col flex-grow min-w-0">
                            <span className="font-semibold text-sm truncate">{option.name || "Sin nombre"}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Marca: <span className="font-medium text-gray-700 dark:text-gray-300">{option.brand || "N/A"}</span> — 
                            Modelo: <span className="font-medium text-gray-700 dark:text-gray-300">{option.model || "N/A"}</span>
                            </span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                            Precio: ${Number(option.unit_price || 0).toFixed(2)}
                            </span>
                        </div>
                        </li>
                    )}
                    renderInput={(params) => <TextField {...params} variant="filled" label={t("Classify.lblProd")} sx={inputText} />}
                    />
                    <button 
                        onClick={()=>{ handleCreateProduct() }}
                        className="text-green-400 hover:text-green-600 cursor-pointer text-2xl hover:border-2 border-green-600 p-2 rounded-sm"
                    > <FaPlusSquare /> </button>

                </div>
                <div className="mt-6 flex gap-5">
                    <UserPermissions permission="saveClassify" role={role}>
                        <button
                            onClick={()=>handleSaveAll()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-md shadow-md cursor-pointer transition"
                        >
                            Guardar Clasificación
                        </button>
                    </UserPermissions>
                    <UserPermissions permission="saveReview" role={role} >
                        <button
                            onClick={()=>handleSaveAll()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-md shadow-md cursor-pointer transition"
                        >
                            Guardar Revision
                        </button>
                    </UserPermissions>
                    <UserPermissions permission="cancelProcess" role={role} >
                        <button
                            onClick={()=>{ handleReturn() }}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md shadow-md cursor-pointer transition"
                        >
                            Salir
                        </button>
                    </UserPermissions>
                    <UserPermissions permission="closeClassify" role={role} >
                        <button
                            onClick={()=>{ handleReturn() }}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2 rounded-md shadow-md cursor-pointer transition"
                        >
                            Finalizar entrada
                        </button>
                    </UserPermissions>
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
                            `${t("Classify.list.lblUnit_price")}`,
                            `${t("Classify.list.lblTotalValue")}`,
                            `${t("Classify.list.lblSupplier")}`,
                            `${t("Classify.list.lblCountry_origin")}`,
                            `${t("Classify.list.lblSeller_country")}`,
                            `${t("Classify.list.lblGross_weight")}`,
                            `${t("Classify.list.lblNet_weight")}`,
                            `${t("Classify.list.lblUnit_weight")}`,
                            `${t("Classify.list.lblDamage")}`,
                            `${t("Classify.list.lblBrand")}`,
                            `${t("Classify.list.lblModel")}`,
                            `${t("Classify.list.lblNo_Series")}`,
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
                            
                            <td className={thBody}>${Number(p.unit_price || 0).toFixed(2)}</td>
                            <td className={thBody}>${Number(p.unit_price * p.quantity || 0).toFixed(2)}</td>
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
                            <td className={thBody}>
                                <FormControl>
                                    <Switch
                                        sx={{
                                            "& .MuiSwitch-switchBase.Mui-checked": {
                                            color: p.damage ? "#fd2b2b" : "#2bdcfd", // color del thumb
                                            "&:hover": {
                                                backgroundColor: p.damage
                                                ? "rgba(253,43,43,0.1)"
                                                : "rgba(43,220,253,0.1)", // halo al pasar el mouse
                                            },
                                            },
                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                            backgroundColor: p.damage ? "#fd2b2b" : "#2bdcfd", // color del track
                                            },
                                            "& .MuiSwitch-track": {
                                            backgroundColor: p.damage ? "#fdaaaa" : "#aef6fd", // color del track desactivado
                                            },
                                        }}
                                        id="damage"
                                        name="damage"
                                        disabled={!p.edit}
                                        checked={p.damage}
                                        onChange={(e)=>{ classifyDispatch({type:"change-damaage", payload: {e:e, productId:p.public_key}})}}
                                    />
                                </FormControl>
                            </td>
                            <td className={thBody}>{p.brand || "-"}</td>
                            <td className={thBody}>{p.model || "-"}</td>
                            <td className={thBody}>{p.serial_number || "-"}</td>

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
                <ProductForm openModal={createProduct} setOpenModal={setCreateProduct} mode="classify" />
                <ToastContainer />
            </div>
        </div>
    );
}
