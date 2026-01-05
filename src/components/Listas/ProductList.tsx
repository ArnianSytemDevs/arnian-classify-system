import { useEffect, useState } from "react";
import ProductListController from "./ProductList.controller";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import type { Product, Status, Supplier } from "../../types/collections";
import type { ProductsFilters } from "../../helpers/pocketbase/Products";
import {
  Modal,
  TextField,
  Switch,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  Button,
} from "@mui/material";
import { FaFilter, FaBroom } from "react-icons/fa";
import type { SelectChangeEvent } from "@mui/material";
import { pb } from "../../helpers/pocketbase/pocketbase";
import NoPhoto from "../../assets/NotPhoto.png";
import { useTranslation } from "react-i18next";
import { FaSquare } from "react-icons/fa6";
import { FaCheckSquare } from "react-icons/fa";

type ProductListProps = {
  status: Status[];
};

export default function ProductList({ status }: ProductListProps) {
  const { productState,productDispatch } = useClassifyContext();
  const [products, setProducts] = useState<any[]>([]);
  const [openMod, setOpenMod] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inputValue, setInputValue] = useState("");

  const [filters, setFilters] = useState<ProductsFilters>({
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
    id_status: "",
    id_supplier: "",
    deprected: false,
    created: "",
    updated: "",
  });
  const { t } = useTranslation();

  // ✅ estilos coherentes
  const thBody =
    "px-5 py-4 text-sm font-mono font-light text-left text-gray-800 dark:text-gray-200";
  const thHead =
    "px-5 py-2 font-semibold transition text-left text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-t-md";
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

  /* =======================================================
     🎯 Efectos para cargar y filtrar productos
  ======================================================= */
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      ProductListController.getProdList(setProducts, filters);
    }, 600);

    return () => {
      clearTimeout(delayDebounce);
      ProductListController.unsubscribe();
    };
  }, [filters]);

  useEffect(() => {
    if (openMod && inputValue.trim() !== "") {
      ProductListController.getSuppliers(inputValue).then((resp: any) => {
        setSuppliers(resp);
      });
    } else {
      setSuppliers([]);
    }
  }, [inputValue, openMod]);

  /* =======================================================
     🧩 Handlers de filtros y cambios
  ======================================================= */
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

  const clearFilters = () => {
    setFilters({
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
      id_status: "",
      id_supplier: "",
      deprected: false,
      created: "",
      updated: "",
    });
  };

  /* =======================================================
     🖼️ Render de imagen del producto
  ======================================================= */
  const renderImage = (file: string, record: Product) => {
    if (record.files?.length) {
      const fileName = record.files[0];
      const url = pb.files.getURL(record, fileName);
      const ext = fileName.toLowerCase();

      if (ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png"))
        return (
          <img
            src={url || NoPhoto}
            alt={file}
            className="w-20 h-20 object-cover rounded border"
          />
        );

      if (ext.endsWith(".pdf"))
        return (
          <div className="flex flex-col items-center text-red-500">
            📄 <span className="text-xs truncate w-20">{fileName}</span>
          </div>
        );

      if (ext.endsWith(".doc") || ext.endsWith(".docx"))
        return (
          <div className="flex flex-col items-center text-blue-500">
            📝 <span className="text-xs truncate w-20">{fileName}</span>
          </div>
        );

      return (
        <div className="flex flex-col items-center text-gray-500">
          📦 <span className="text-xs truncate w-20">{fileName}</span>
        </div>
      );
    } else {
      return (
        <img
          src={NoPhoto}
          alt={file}
          className="w-20 h-20 object-cover rounded border"
        />
      );
    }
  };

  /* =======================================================
     🧾 Render principal
  ======================================================= */
  return (
    <>
      {/* 🔹 Tabla principal */}
      <div className="overflow-y-auto max-h-[calc(100vh-80px)] w-full">
        <table className="w-full border-collapse">
          <thead className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 font-semibold text-gray-700 dark:text-gray-200">
                <button
                  className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition"
                  onClick={() => setOpenMod(true)}
                  title="Filtrar productos"
                >
                  <FaFilter className="text-gray-600 dark:text-cyan-300" />
                </button>
              </th>
              <th className={thHead}></th>
              <th className={thHead}>{t("products.form.lblAlias")}</th>
              <th className={thHead}>{t("products.form.lblName")}</th>
              <th className={thHead}>{t("products.form.lblPart_number")}</th>
              <th className={thHead}>{t("products.form.lblBrand")}</th>
              <th className={thHead}>{t("products.form.lblModel")}</th>
              <th className={thHead}>{t("products.form.lblDescription")}</th>
              <th className={thHead}>{t("products.form.lblStatus")}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-x divide-gray-200 dark:divide-gray-500">
            {products.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                onClick={() => {
                    productDispatch({
                    type: "change-box",
                    payload: {
                        product: p,
                        status: !productState.productList.some(item => item.id === p.id),
                    },
                    });
                }}
              >
                <td className={thBody}>
                  {
                      productState.productList.some(item => item.id === p.id)?(<FaCheckSquare className=" text-xl text-sky-600 border-1 border-gray-500 rounded-xs " />):(<FaSquare className=" text-xl text-white border-1 border-gray-500 rounded-xs " />)
                  }
                </td>
                <td className={thBody}>{renderImage(p.files, p)}</td>
                <td className={thBody}>{p.alias}</td>
                <td className={thBody}>{p.name}</td>
                <td className={thBody}>{p.code}</td>
                <td className={thBody}>{p.brand}</td>
                <td className={thBody}>{p.model}</td>
                <td className={`${thBody} max-w-70 line-clamp-3`}>{p.description}</td>
                <td
                  className={`${thBody} underline decoration-2` }
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

      {/* 🔹 Modal de filtros */}
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
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-cyan-300">
              Filtros de productos
            </h2>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<FaBroom />}
              onClick={clearFilters}
            >
              Limpiar
            </Button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-2 gap-5 p-5 text-gray-800 dark:text-gray-200">
            <TextField variant='filled'  sx={inputText} name="id" label="ID" value={filters.id} onChange={handleChange} fullWidth />
            <TextField variant='filled' sx={inputText} name="public_key" label="Public Key" value={filters.public_key} onChange={handleChange} fullWidth />
            <TextField variant='filled' sx={inputText} name="name" label={t("products.form.lblName")} value={filters.name} onChange={handleChange} fullWidth />
            <TextField variant='filled' sx={inputText} name="alias" label={t("products.form.lblAlias")} value={filters.alias} onChange={handleChange} fullWidth />
            <TextField variant='filled' sx={inputText} name="code" label={t("products.form.lblAlias")} value={filters.code} onChange={handleChange} fullWidth />

            <FormControl>
              <label className="text-gray-700 dark:text-gray-300">Deprected</label>
              <Switch id="deprected" name="deprected" checked={filters.deprected} onChange={handleSwitch} />
            </FormControl>

            <TextField variant='filled' sx={inputText} name="part_number" label={t("products.form.lblPart_number")} value={filters.part_number} onChange={handleChange} fullWidth />
            <TextField variant='filled' sx={inputText} name="model" label={t("products.form.lblModel")} value={filters.model} onChange={handleChange} fullWidth />
            <TextField variant='filled' sx={inputText} name="brand" label={t("products.form.lblBrand")} value={filters.brand} onChange={handleChange} fullWidth />
            <TextField variant='filled' sx={inputText} name="serial_number" label={t("products.form.lblSerial_number")} value={filters.serial_number} onChange={handleChange} fullWidth />

            <FormControl fullWidth>
              <Select id="id_status" name="id_status" value={filters.id_status} onChange={handleChange} 
              sx={{
                    width: "100%",
                    background:"#FFF",
                    "& .MuiInputBase-root": {
                        color: "text.primary",
                        backgroundColor: "background.paper",
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
                    "& .MuiSvgIcon-root": {
                        color: "text.secondary", // icono flecha cambia con el modo
                    },
                }}
                >
                {status.map((st) => (
                  <MenuItem key={st.id} value={st.id}>
                    {st.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              sx={{ width: "100%" }}
              id="id_supplier"
              disablePortal
              options={suppliers}
              value={suppliers.find((sp) => sp.id === filters.id_supplier) || null}
              getOptionLabel={(option) => `${option.name} (${option.alias})`}
              inputValue={inputValue}
              onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
              onChange={handleAutocomplete}
              renderInput={(params) => <TextField sx={inputText} variant='filled' {...params} label={t("products.form.lblSupplier")} fullWidth />}
            />

            <TextField variant='filled' sx={inputText} name="created" type="date" label={t("products.form.lblCreated")} value={filters.created} onChange={handleChange} fullWidth />
            <TextField variant='filled' sx={inputText} name="updated" type="date" label={t("products.form.lblUpdated")} value={filters.updated} onChange={handleChange} fullWidth />
          </div>
        </div>
      </Modal>
    </>
  );
}
