import React, { useEffect, useState } from "react";
import { Modal, TextField, Autocomplete, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { IoMdCloseCircleOutline } from "react-icons/io";
// import { FaRegSave } from "react-icons/fa";
import { pb } from "../../helpers/pocketbase/pocketbase";
import { TiMinusOutline } from "react-icons/ti";
import { useTranslation } from "react-i18next";
import { ProductFormController } from "./ProductForm.controller";
import { type Status, type Measurement, type Supplier } from "../../types/collections";
import type { ChangeEvent } from "react";
import { useClassifyContext } from "../../hooks/useClassifyContext";
import { FaRegWindowClose } from "react-icons/fa";

type ProductFormProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  mode:string;
};

export default function ProductForm({ openModal, setOpenModal,mode }: ProductFormProps) {

  const { productState,productDispatch,classifyDispatch } = useClassifyContext()
  const [inputValue, setInputValue] = useState(""); // solo para búsqueda dinámica
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [measurement,setMeasurement] = useState<Measurement[]>([])
  const [status,setStatus] = useState<Status[]>([])
  const { t } = useTranslation();
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

  useEffect(() => {
    if (!openModal) return;

    const delay = setTimeout(() => {
      const trimmed = inputValue.trim();

      ProductFormController.getSuppliers(trimmed !== "" ? trimmed : undefined, mode)
        .then((resp: any) => {
          setSuppliers(resp);
        })
        .catch((err) => console.error("❌ Error al cargar proveedores:", err));
    }, 800); // Espera de 800ms para evitar spam al escribir

    return () => clearTimeout(delay);
  }, [inputValue, openModal, mode]);

  useEffect(() => {
    if (!openModal) return;

    (async () => {
      try {
        const [measures, statuses]:any = await Promise.all([
          ProductFormController.getMeasurement(),
          ProductFormController.getStatus(),
        ]);

        setMeasurement(measures);
        setStatus(statuses);

        if (mode === "edit" && productState.productList[0]?.id_supplier) {
          const supplierList:any = await ProductFormController.getSuppliers(
            productState.productList[0].id_supplier,
            mode
          );
          setSuppliers(supplierList);
        }
      } catch (err) {
        console.error("❌ Error al cargar datos iniciales:", err);
      }
    })();
  }, [openModal, mode, productState.productList]);

  useEffect(()=>{
    if(openModal == true && mode == 'edit' && measurement.length != 0 && status.length != 0 && suppliers.length != 0){
      productDispatch({type: 'edit-product', payload:{ suppliers:suppliers, measurement:measurement }});
    }
  },[measurement,suppliers,openModal])
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      productDispatch({
        type: "add-files",
        payload: { files: e.target.files },
      });
    }
  };

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
      const record = productState.productList[0]; // o el producto actual
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


  const handleSubmit = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    ProductFormController.createProduct(productState.productForm,status,mode,productState.productList[0],classifyDispatch).then((resp)=>{
      if(resp){
        window.alert(`${t("products.alerSucces")}`)
        productDispatch({type:'clear-state'})
        setOpenModal(false)
        if(mode == "create" || mode == "edit"){
          window.location.reload()
        }
      }else{
        window.alert(`${t("products.alertError")}`)
      }
    })
  }

  const isValid = () =>{
    const rate = productState.productForm
    return rate.alias != '' &&
    rate.brand != '' &&
    rate.code != '' &&
    rate.unit_price != 0 &&
    rate.description != '' &&
    rate.id_measurement != '' &&
    rate.id_supplier != '' &&
    rate.model!= '' &&
    rate.name != '' &&
    rate.part_number != '' &&
    rate.serial_number != '' &&
    rate.weight != 0
  }

  return (
    <Modal
      open={openModal}
      // onClose={() => setOpenModal(false)}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <div
        className="
          flex flex-col bg-white shadow-lg 
          w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2 
          transition-all duration-300
          dark:bg-slate-800 dark:text-cyan-300
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b shadow-sm sticky top-0 bg-white dark:bg-slate-800 z-10">
          <button
            onClick={() => setOpenModal(false)}
            className="bg-gray-100 hover:bg-gray-300 p-1 text-3xl text-red-500 rounded-sm cursor-pointer"
          >
            <IoMdCloseCircleOutline />
          </button>
          {/* <button className="bg-gray-100 hover:bg-gray-300 p-1 text-3xl text-green-500 rounded-sm cursor-pointer">
            <FaRegSave />
          </button> */}
          <button onClick={(()=>setOpenModal(false))} className="bg-gray-100 hover:bg-gray-300 p-1 text-3xl text-cyan-500 rounded-sm cursor-pointer">
            <TiMinusOutline />
          </button>
          <p className="ml-1 text-xl sm:text-3xl text-cyan-800 font-semibold dark:text-cyan-300">
            {t("products.btnCreate")}
          </p>
        </div>

        {/* Body */}
        <div className=" overflow-auto p-5">
          <form className=" grid grid-cols-2 gap-5 " >
            {/* Campos */}
            <TextField sx={inputText} variant="filled" type="text" label="name" id="name" value={productState.productForm.name} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required />
            <TextField sx={inputText} variant="filled" type="text" label="alias" id="alias" value={productState.productForm.alias} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required />
            <TextField sx={inputText} variant="filled" type="text" label="code" id="code" value={productState.productForm.code} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required />
            <TextField sx={inputText} variant="filled" type="number" label="part_number" id="part_number" value={productState.productForm.part_number} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required />
            <TextField sx={inputText} variant="filled" type="text" label="model" id="model" value={productState.productForm.model} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required />
            <TextField sx={inputText} variant="filled" type="text" label="brand" id="brand" value={productState.productForm.brand} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required />
            <TextField sx={inputText} variant="filled" type="text" label="serial_number" id="serial_number" value={productState.productForm.serial_number} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required />
            <TextField sx={inputText} variant="filled" type="number" label="unit_price USD" id="unit_price" value={productState.productForm.unit_price} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required />
            <div>
              <TextField sx={inputText} variant="filled" style={{ width:'70%' }} type="number" id="weight" name="weight" value={productState.productForm.weight} onChange={(e)=>productDispatch({ type:'change-textfield', payload:{e:e} })} label="weight" fullWidth required />
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
                value={productState.productForm.id_measurement.toString()}
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
            {/* <TextField sx={inputText}  type="text" label="color" id="color" value={productState.productForm.color} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} fullWidth required /> */}
            <Autocomplete
              className="w-full"
              id="id_supplier"
              disablePortal
              options={suppliers}
              // 🔑 el value viene de tu reducer (ya guarda el ID seleccionado)
              value={productState.productForm.id_supplier}
              getOptionLabel={(option) => `${option.name} (${option.alias})`}

              inputValue={inputValue}
              onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue); // 🔎 dispara la búsqueda
              }}
              // 🔑 aquí usamos tu handle para despachar el ID del supplier
              onChange={(_, newValue) => {
                productDispatch({
                  type: "change-autocomplete-entry",
                  payload: { field: "id_supplier", value: newValue },
                });
              }}
              renderInput={(params) => (
                <TextField sx={inputText} variant="filled" {...params} required label="Proveedor" />
              )}
            />

            {/* Archivos con preview */}
            <TextField sx={inputText} variant="filled" type="text" label="description" id="description" value={productState.productForm.description} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} multiline fullWidth required /> 
            <TextField sx={inputText} variant="filled" type="text" label="traduccion" id="traduction" value={productState.productForm.traduction} onChange={(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>productDispatch({ type:'change-textfield', payload:{e:e} })} multiline fullWidth required /> 
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-cyan-300">
                Archivos
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="mb-4"
              />

              {productState.productForm.files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {productState.productForm.files.map((file: File) => (
                    <div
                      key={file.name || file.toString()  }
                      className="flex flex-col items-center justify-center border rounded-lg p-1 bg-gray-50 hover:bg-gray-100 text-center dark:text-black"
                    >
                      <button
                        className="cursor-pointer hover:bg-red-300 self-end"
                        onClick={(e) => {
                          e.preventDefault();
                          productDispatch({
                            type: "delete-file",
                            payload: { file: file.name },
                          });
                        }}
                      >
                        <FaRegWindowClose className="text-md text-red-500 cursor" />
                      </button>

                      <div
                        className="w-[100%] h-[100%] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 p-3"
                        onClick={() => window.open(mode == 'edit'? pb.files.getURL(productState.productList[0], file.toString()) : URL.createObjectURL(file))}
                      >
                        {renderPreview(file)}
                        <span className="mt-2 text-xs truncate w-24">{mode == 'edit' ? file.toString() : file.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 dark:bg-slate-800">
          <button
            onClick={() => { setOpenModal(false); productDispatch({type:'clear-form'}) }  }
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
          >
            Cancelar
          </button>
          <button disabled={!isValid()} onClick={(e)=>{ handleSubmit(e) }} className={isValid() ? "px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer":"px-4 py-2 rounded-md bg-gray-600 text-white cursor-not-allowed"}>
            { mode !== "classify"? t("actions.create") :t("products.btnCreateAdd")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
