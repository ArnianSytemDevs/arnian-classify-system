import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Modal, TextField, Autocomplete, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { pb } from "../../helpers/pocketbase/pocketbase";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { ProductFormController } from "./ProductForm.controller";
import { type Status, type Measurement, type Supplier } from "../../types/collections";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import { FaRegWindowClose } from "react-icons/fa";
import UserPermissions from "../../hooks/usePremission";
import { BsBuildingFillAdd } from "react-icons/bs";
import SuppliersForm from "./SuppliersForm";

type ProductFormProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string;
};

export default function ProductForm({ openModal, setOpenModal, mode }: ProductFormProps) {
  const { productState, productDispatch, classifyDispatch, role } = useClassifyContext();
  const { t } = useTranslation();

  // Estados
  const [inputValue, setInputValue] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [measurement, setMeasurement] = useState<Measurement[]>([]);
  const [status, setStatus] = useState<Status[]>([]);
  const [openSModal, setOpenSModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔒 Idempotencia

  const inputText = {
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

  // 🔹 Búsqueda de proveedores (Debounce)
  const searchSuppliers = useCallback(async (val: string, isInitial = false) => {
    const res:any = await ProductFormController.getSuppliers(val, mode, isInitial);
    setSuppliers(res);
  }, [mode]);

  useEffect(() => {
    if (!openModal) return;
    const timer = setTimeout(() => searchSuppliers(inputValue), 600);
    return () => clearTimeout(timer);
  }, [inputValue, openModal, searchSuppliers]);

  // 🔹 Datos iniciales
  useEffect(() => {
    if (!openModal) return;
    (async () => {
      const { measures, statuses }:any = await ProductFormController.getInitialData();
      setMeasurement(measures);
      setStatus(statuses);

      if (mode === "edit" && productState.productList[0]?.id_supplier) {
        searchSuppliers(productState.productList[0].id_supplier, true);
      }
    })();
  }, [openModal, mode, searchSuppliers]);

  // 🔹 Sincronizar edición con el Reducer
  useEffect(() => {
    if (openModal && mode === 'edit' && measurement.length && suppliers.length && !productState.productForm.name) {
      productDispatch({ type: 'edit-product', payload: { suppliers, measurement } });
    }
  }, [measurement, suppliers, openModal, mode, productDispatch, productState.productForm.name]);

  // 🔹 Validación Memoizada
  const isValid = useMemo(() => {
    const r = productState.productForm;
    return !!(r.alias && r.brand && r.code && r.description && r.id_measurement && r.id_supplier && r.model && r.name && r.part_number && r.serial_number && r.weight > 0);
  }, [productState.productForm]);

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    const resp = await ProductFormController.createProduct(
      productState.productForm,
      status,
      mode,
      productState.productList[0],
      classifyDispatch
    );

    if (resp) {
      await Swal.fire({ icon: "success", title: t("products.alerSucces"), timer: 1500, showConfirmButton: false });
      productDispatch({ type: "clear-state" });
      setOpenModal(false);
      if (mode !== "classify") window.location.reload();
    } else {
      await Swal.fire({ icon: "error", title: t("products.alertError") });
    }
    setIsSubmitting(false);
  };

  const renderPreview = (file: File | string) => {
    if (file instanceof File) {
      if (file.type.startsWith("image/")) return <img src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover rounded border" />;
      return <span className="text-red-500 text-2xl">{file.type === "application/pdf" ? "📄" : "📦"}</span>;
    }
    if (typeof file === "string") {
      const url = pb.files.getURL(productState.productList[0], file);
      if (/\.(jpg|jpeg|png)$/i.test(file)) return <img src={url} alt={file} className="w-20 h-20 object-cover rounded border" />;
      return <div className="flex flex-col items-center text-red-500">📄 <span className="text-xs truncate w-20">{file}</span></div>;
    }
    return null;
  };

  return (
    <Modal open={openModal} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="flex flex-col bg-white shadow-lg w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2 transition-all duration-300 dark:bg-slate-800 dark:text-cyan-300">
        <div className="overflow-auto p-5">
          <form className="grid grid-cols-2 gap-5" onSubmit={handleSubmit}>
            <TextField sx={inputText} variant="filled" label={t("products.form.lblName")} value={productState.productForm.name} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="name" fullWidth required />
            <TextField sx={inputText} variant="filled" label={t("products.form.lblAlias")} value={productState.productForm.alias} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="alias" fullWidth />
            <TextField sx={inputText} variant="filled" label={t("products.form.lblCode")} value={productState.productForm.code} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="code" fullWidth required />
            <TextField sx={inputText} variant="filled" label={t("products.form.lblPart_number")} value={productState.productForm.part_number} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="part_number" fullWidth required />
            <TextField sx={inputText} variant="filled" label={t("products.form.lblModel")} value={productState.productForm.model} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="model" fullWidth />
            <TextField sx={inputText} variant="filled" label={t("products.form.lblBrand")} value={productState.productForm.brand} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="brand" fullWidth />
            <TextField sx={inputText} variant="filled" label={t("products.form.lblSerial_number")} value={productState.productForm.serial_number} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="serial_number" fullWidth required />
            <TextField sx={inputText} variant="filled" type="number" label={t("products.form.lblUnit_price") + " USD"} value={productState.productForm.unit_price} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="unit_price" fullWidth />
            
            <div>
              <TextField sx={inputText} variant="filled" style={{ width:'70%' }} type="number" inputProps={{ min: 0 }} id="weight" name="weight" value={productState.productForm.weight} onChange={(e)=>productDispatch({ type:'change-textfield', payload:{e:e} })} label={t("products.form.lblWeight")} fullWidth required />
              <Select
                sx={{
                    width: "30%",
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
                value={productState.productForm.id_measurement || ""}
                onChange={(e: SelectChangeEvent) =>
                    productDispatch({ type: "change-select", payload: { e: e } })
                }
                id="id_measurement"
                name="id_measurement"
                >
                  {measurement.map((msm) => (
                      <MenuItem key={msm.id} value={msm.id}>
                          {msm.alias}
                      </MenuItem>
                  ))}
              </Select>

            </div>

            <div className="flex flex-row">
              <Autocomplete
                className="w-[80%]"
                options={suppliers}
                value={productState.productForm.id_supplier}
                getOptionLabel={(o) => `${o.name} (${o.alias})`}
                onInputChange={(_, v) => setInputValue(v)}
                onChange={(_, v) => productDispatch({ type: "change-autocomplete-entry", payload: { field: "id_supplier", value: v } })}
                renderInput={(params) => <TextField sx={inputText} variant='filled' {...params} required label={t("Entrys.form.supplier")} />}
              />
              <a onClick={() => setOpenSModal(true)} className="w-[20%] transition flex justify-center items-center rounded-md text-white text-4xl bg-cyan-600 hover:bg-cyan-700 cursor-pointer">
                <BsBuildingFillAdd className="w-full" />
              </a>
            </div>

            <TextField sx={inputText} variant="filled" label={t("products.form.lblDescription")} value={productState.productForm.description} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="description" multiline fullWidth />
            <TextField sx={inputText} variant="filled" label={t("products.form.lblTraduction")} value={productState.productForm.traduction} onChange={(e) => productDispatch({ type: 'change-textfield', payload: { e } })} id="traduction" multiline fullWidth />

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2 dark:text-cyan-300">{t("products.form.lblDocuments")}</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && productDispatch({ type: "add-files", payload: { files: e.target.files } })}
                className="block w-full text-sm text-gray-700 border border-cyan-500 rounded-lg cursor-pointer bg-cyan-50 dark:bg-slate-800 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 transition"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                {productState.productForm.files.map((file: any, i: number) => (
                  <div key={i} className="flex flex-col items-center justify-center border rounded-lg p-1 bg-gray-50 hover:bg-gray-100 dark:text-black">
                    <button type="button" className="self-end" onClick={() => productDispatch({ type: "delete-file", payload: { file: file.name || file.toString() } })}>
                      <FaRegWindowClose className="text-red-500" />
                    </button>
                    <div className="p-3 cursor-pointer" onClick={() => window.open(file instanceof File ? URL.createObjectURL(file) : pb.files.getURL(productState.productList[0], file))}>
                      {renderPreview(file)}
                      <span className="mt-2 text-xs truncate w-24 block">{file.name || file.toString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 dark:bg-slate-800">
          <button onClick={() => { setOpenModal(false); productDispatch({ type: 'clear-form' }) }} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">
            Cancelar
          </button>
          <UserPermissions permission="saveProduct" role={role}>
            <button onClick={handleSubmit} disabled={!isValid || isSubmitting} className={isValid && !isSubmitting ? "px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer" : "px-4 py-2 rounded-md bg-gray-600 text-white cursor-not-allowed"}>
              {isSubmitting ? "..." : (mode === "edit" ? t("products.btnUpdate") : t("products.btnCreate"))}
            </button>
          </UserPermissions>
        </div>
        <SuppliersForm openModal={openSModal} setOpenModal={setOpenSModal} mode="create" call={"component"} />
      </div>
    </Modal>
  );
}